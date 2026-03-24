# labeling_back configs 모듈 규칙

이 문서는 `/src/configs` 모듈을 기준으로 추출한 설정 관리 규칙이다.
새 에이전트나 개발자는 아래 규칙을 기본값으로 따르고, 설정을 추가하거나 변경할 때 이 패턴을 유지한다.

## 1. 폴더 구조

```text
src/configs/
  index.ts              # barrel export (공개 API)
  configuration.ts      # 설정 정의 함수 + 타입(interface)
  configs.service.ts    # 설정 접근 서비스 (@Injectable)
  configs.module.ts     # NestJS 모듈 등록 + env 검증
```

- 하위 폴더 없이 4개 파일로 구성된다.
- `@configs` alias로 프로젝트 전역에서 import 한다.

## 2. 파일별 역할

### `configuration.ts`

- 환경 변수를 타입이 있는 설정 객체로 매핑하는 **함수를 default export** 한다.
- 설정 섹션별 interface를 이 파일에서 정의하고, 외부에서 쓸 interface만 `export` 한다.
- 최상위 `AppConfig` interface는 export 하지 않는다 (내부용).
- type-only import를 사용한다.

```ts
import type { DataSourceOptions } from 'typeorm';
import type { RedisOptions } from 'ioredis';

export interface SlackConfig {
    webhookUrl: string;
    jobWebhookUrl: string;
}

export interface JwtConfig {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    jobToken: string;
}

interface AppConfig {
    mysql: DataSourceOptions;
    redis: RedisOptions;
    slack: SlackConfig;
    jwt: JwtConfig;
}

export default (env: Record<string, any> = process.env): AppConfig => ({
    mysql: { ... },
    redis: { ... },
    slack: { ... },
    jwt: { ... },
});
```

### `configs.service.ts`

- `@Injectable()` 서비스로, NestJS `ConfigService`를 래핑한다.
- 각 설정 섹션은 **getter**로 노출한다 (`get mysql()`, `get redis()` 등).
- getter 반환 타입은 `configuration.ts`의 interface 또는 외부 라이브러리 타입을 쓴다.
- 값은 non-null assertion(`!`)으로 가져온다 (모듈 로딩 시 검증이 끝났으므로).
- 환경 판별 메서드(`isProduction`, `isLocal`, `isDevelopment`)를 일반 메서드로 제공한다.

```ts
@Injectable()
export class ConfigsService {
    constructor(private readonly configService: NestConfigService) {}

    isProduction() { return process.env.NODE_ENV === 'production'; }
    isLocal() { return process.env.NODE_ENV === 'local'; }
    isDevelopment() { return process.env.NODE_ENV === 'development'; }

    get mysql() { return this.configService.get<DataSourceOptions>('mysql')!; }
    get redis() { return this.configService.get<RedisOptions>('redis')!; }
    get slack() { return this.configService.get<SlackConfig>('slack')!; }
    get jwt() { return this.configService.get<JwtConfig>('jwt')!; }
}
```

### `configs.module.ts`

- `@Global()` + `@Module()`로 선언하여 프로젝트 전역에서 `ConfigsService`를 주입할 수 있게 한다.
- `ConfigModule.forRoot()`를 import하며 아래 3가지를 설정한다.
  - `envFilePath`: `.env.${NODE_ENV || 'local'}` 패턴
  - `load`: `configuration` 함수
  - `validate`: `validateConfigObject` 함수
- `providers`와 `exports`에 `ConfigsService`를 등록한다.

### `index.ts`

- barrel export 파일이다.
- `ConfigsModule`과 `ConfigsService`만 re-export 한다.
- `configuration.ts`의 타입은 필요한 곳에서 직접 import 한다.

```ts
export * from './configs.module';
export * from './configs.service';
```

## 3. 환경 변수 검증 규칙

- `configs.module.ts` 내부의 `validateConfigObject` 함수가 앱 부팅 시 검증을 담당한다.
- `configuration()` 함수를 실행한 뒤 모든 설정값을 재귀적으로 순회한다.
- `undefined` 또는 `NaN`인 값이 있으면 에러를 throw 한다.
- 에러 메시지는 한국어로 출력한다: `❌ .env 파일의 "{key}" 설정 값이 누락되었습니다.`
- `SWAGGER_GEN` 환경 변수가 설정되어 있으면 검증을 건너뛴다.

## 4. 환경 파일 규칙

- 환경 파일은 프로젝트 루트에 `.env.{NODE_ENV}` 형식으로 둔다.
- `NODE_ENV` 값에 따라 로딩할 파일이 결정된다.
  - `local` → `.env.local`
  - `development` → `.env.development`
  - `production` → `.env.production`
- `NODE_ENV`가 없으면 기본값은 `local`이다.

## 5. 새 설정 섹션 추가 절차

새로운 외부 연동이나 설정 그룹을 추가할 때 아래 순서를 따른다.

1. `.env.*` 파일에 환경 변수 추가
2. `configuration.ts`에서:
   - 필요하면 interface를 정의하고 export
   - `AppConfig`에 새 섹션 프로퍼티 추가
   - default export 함수의 반환 객체에 매핑 추가
3. `configs.service.ts`에서:
   - 새 섹션에 대한 getter 추가
4. 끝. 모듈/index 파일은 수정하지 않는다.

## 6. 설정값 사용 규칙

- 비즈니스 모듈에서 `process.env`를 직접 참조하지 않는다.
- 반드시 `ConfigsService`를 주입받아 getter로 접근한다.
- `ConfigsService`는 `@Global()` 모듈이므로 별도 import 없이 주입 가능하다.

```ts
// ✅ 올바른 사용
constructor(private readonly configsService: ConfigsService) {}
this.configsService.mysql;

// ❌ 금지
process.env.MYSQL_HOST;
```

- 환경 판별이 필요하면 `configsService.isProduction()` 등의 메서드를 사용한다.

## 7. 필수 환경 변수 목록

현재 `configuration.ts` 기준 필수 환경 변수:

| 섹션 | 환경 변수 |
|------|----------|
| mysql | `MYSQL_HOST`, `MYSQL_USERNAME`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` |
| redis | `REDIS_HOST` |
| slack | `SLACK_WEBHOOK_URL`, `SLACK_JOB_WEBHOOK_URL` |
| jwt | `JWT_ACCESS_TOKEN_SECRET`, `JWT_REFRESH_TOKEN_SECRET`, `JOB_TOKEN` |
| 시스템 | `NODE_ENV` (local / development / production) |

## 8. 코드 스타일 규칙

- type-only import는 `import type { ... }` 문법을 쓴다.
- interface 정의에는 JSDoc이나 주석을 달지 않는다.
- NestJS `ConfigService`는 `NestConfigService`로 alias하여 import 한다.
- 포트 등 기본값이 있는 설정은 `configuration.ts`에서 하드코딩한다 (예: `port: 3306`, `port: 6379`).

## 9. 주의사항

- `ConfigsModule`은 `@Global()`이므로 다른 모듈에서 imports에 넣지 않아도 된다.
- `configuration.ts`의 default export 함수는 `env` 파라미터를 받되 기본값을 `process.env`로 둔다. 이는 검증 함수에서 파싱된 env 객체를 넘기기 위한 구조다.
- redis 타입은 `configuration.ts`에서 `ioredis`의 `RedisOptions`를, `configs.service.ts`에서 `bullmq`의 `RedisOptions`를 쓴다. 둘 다 호환되므로 현행 그대로 유지한다.
