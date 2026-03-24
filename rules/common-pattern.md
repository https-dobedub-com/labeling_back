# labeling_back common 모듈 규칙

이 문서는 `src/common` 모듈의 구조와 컨벤션을 기준으로 추출한 규칙이다.
새 에이전트나 개발자는 아래 규칙을 기본값으로 따르고, common 내부에 기능을 추가하거나 사용할 때 이 패턴을 유지한다.

## 1. 폴더 구조

```text
src/common/
  common.module.ts          # 루트 모듈 (@Global)
  types.ts                  # 공용 enum, DTO, 타입
  context/
    index.ts                # barrel export
    context.module.ts       # NestJS 모듈
    context.service.ts      # AsyncLocalStorage 기반 요청 컨텍스트
  event-box/
    index.ts                # barrel export
    event-box.module.ts     # NestJS 모듈 (TypeORM + BullMQ)
    queues.ts               # 큐 이름 enum + 등록 배열
    common-dispatcher.ts    # 이벤트 디스패처 base 클래스
    common-consumer.ts      # 큐 워커 abstract base 클래스
    event-box-dispatcher.provider.ts  # 실제 이벤트 디스패처 구현체
  slack/
    index.ts                # barrel export
    slack.module.ts         # NestJS 모듈
    slack.service.ts        # Slack 웹훅 서비스
```

## 2. 루트 모듈 (common.module.ts)

- `@Global()` + `@Module()`로 선언한다.
- 하위 feature 모듈 3개를 imports/exports 한다.
- 비즈니스 모듈에서 별도 import 없이 `Context`, `SlackService` 등을 주입할 수 있다.

```ts
@Global()
@Module({
    imports: [ContextModule, SlackModule, EventBoxModule],
    exports: [ContextModule, SlackModule, EventBoxModule],
})
export class CommonModule {}
```

- 새 공통 feature를 추가하면 여기에 import/export를 추가한다.

## 3. 하위 feature 모듈 구조 규칙

각 feature 폴더는 아래 구조를 따른다.

```text
<feature>/
  index.ts            # barrel export (export * from './xxx.module'; export * from './xxx.service';)
  <feature>.module.ts # NestJS 모듈 (providers + exports)
  <feature>.service.ts 또는 핵심 파일들
```

- `index.ts`는 `export *` 패턴으로 모듈과 서비스만 re-export 한다.
- 모듈 파일은 `providers`와 `exports`에 같은 서비스를 등록한다.

```ts
// 단순 feature 모듈 패턴
@Module({
    providers: [SomeService],
    exports: [SomeService],
})
export class SomeModule {}
```

## 4. types.ts — 공용 타입 규칙

- 프로젝트 전역에서 공유하는 enum, DTO, 타입 alias를 이 파일에 정의한다.
- `@common/types` 경로로 import 한다.

### 현재 정의된 항목

| 이름 | 종류 | 설명 |
|------|------|------|
| `OrderType` | enum | 정렬 방향 (ASC, DESC) |
| `PaginationDto` | class | 페이징 공통 DTO (page, limit, sort, order) |
| `CalendarDate` | type alias | `YYYY-MM-DD` 또는 `YYYY-MM-DD HH:mm:ss` 형식 문자열 |
| `AgeLimit` | enum | 연령 제한 (NONE=0, ADULT=19) |
| `CastingRoleType` | enum | 캐스팅 역할 (main, supporting) |
| `ContentType` | enum | 콘텐츠 타입 (voicetoon) |
| `SocialType` | enum | 소셜 로그인 타입 (google, kakao, naver, apple) |

### 작성 규칙

- enum 키는 `SCREAMING_SNAKE_CASE`를 쓴다.
- enum 값은 도메인에 따라 `SCREAMING_SNAKE_CASE` (OrderType) 또는 `lowercase` (SocialType) 중 기존 패턴을 따른다.
- 공통 DTO에는 `class-validator`, `class-transformer`, `@nestjs/swagger` 데코레이터를 함께 붙인다.
- query string으로 들어오는 숫자 필드에는 `@Type(() => Number)`를 반드시 붙인다.
- 특정 도메인에만 쓰이는 타입은 여기에 넣지 않고 해당 도메인 폴더에 둔다.

```ts
// PaginationDto 대표 패턴
export class PaginationDto {
    @ApiProperty({ description: '페이지 번호', example: 1, default: 1, required: false })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    page?: number;
}
```

## 5. context — 요청 컨텍스트 규칙

### 역할

- Node.js `AsyncLocalStorage`를 래핑하여 요청 단위 컨텍스트를 관리한다.
- 함수 파라미터로 context를 넘기지 않고도 어디서든 현재 요청의 EntityManager, traceId, 사용자 정보 등을 꺼낼 수 있다.

### 핵심 export

| export | 설명 |
|--------|------|
| `Context` | `@Injectable()` 서비스. `get<K>(key)`, `set(key, value)` 메서드 제공 |
| `ContextKey` | 컨텍스트 키 enum |
| `asyncLocalStorage` | `AsyncLocalStorage` 인스턴스 (서비스 밖에서 직접 접근 시 사용) |

### ContextKey 목록

```ts
export enum ContextKey {
    ENTITY_MANAGER = 'entityManager',   // 트랜잭션 EntityManager
    DDD_EVENTS = 'dddEvents',           // 도메인 이벤트 수집
    TRACE_ID = 'traceId',               // 요청 추적 ID
    ADMIN = 'admin',                    // 관리자 정보
    USER = 'user',                      // 사용자 정보
}
```

### 사용 규칙

- 비즈니스 코드에서는 `Context` 서비스를 주입받아 `get<Type>(ContextKey.XXX)` 패턴으로 접근한다.
- `asyncLocalStorage` 인스턴스를 직접 쓰는 곳은 인프라 코드(CommonConsumer, Transactional decorator 등)로 한정한다.
- 새 컨텍스트 키가 필요하면 `ContextKey` enum에 추가한다.
- store가 없을 때 `set()`을 호출하면 `Error('There is no context store.')`가 발생한다.

## 6. slack — Slack 웹훅 규칙

### 역할

- Slack IncomingWebhook을 통해 에러 알림, job 실행 결과 등을 전송한다.

### 핵심 export

| export | 설명 |
|--------|------|
| `SlackService` | `@Injectable()` 서비스. `send()`, `sendJob()` 메서드 제공 |

### 구현 패턴

- 생성자에서 `ConfigsService`를 주입받아 웹훅 URL로 `IncomingWebhook` 인스턴스를 생성한다.
- URL이 없으면 `null`로 두고, 호출 시 graceful하게 무시한다.
- 2개의 웹훅 채널을 분리한다.
  - `webhook`: 일반 에러/알림용 (`send()`)
  - `jobWebhook`: job 실행 결과 알림용 (`sendJob()`)

### 사용 규칙

- 에러 전송은 `slackService.send(message)` 한 줄로 처리한다.
- job 알림은 `slackService.sendJob({ request, response, start })` 형태로 구조화된 블록 메시지를 보낸다.
- 웹훅 미설정 시 에러를 throw하지 않고 로그만 남기거나 조용히 반환한다.
- 전송 실패 시에도 에러를 throw하지 않고 `console.error`로 처리한다.
- local 환경에서는 Slack 알림을 보내지 않는 패턴이 있다 (CommonConsumer 참고).

```ts
// Slack 서비스 초기화 패턴
constructor(private readonly configsService: ConfigsService) {
    this.webhook = this.configsService.slack.webhookUrl
        ? new IncomingWebhook(this.configsService.slack.webhookUrl)
        : null;
}
```

## 7. event-box — 도메인 이벤트 비동기 처리 규칙

### 역할

- 도메인 이벤트를 트랜잭션 안에서 저장하고, 트랜잭션이 끝난 뒤 BullMQ 큐로 비동기 전달하기 위한 인프라다.
- 성격상 `outbox + queue dispatcher` 조합으로 이해하면 된다.

### 핵심 파일과 역할

| 파일 | 역할 |
|------|------|
| `queues.ts` | `QueueName` enum 정의 + 큐 등록 배열 default export |
| `common-dispatcher.ts` | 이벤트-큐 매핑을 관리하는 base 클래스 |
| `common-consumer.ts` | 큐 워커 abstract base 클래스 (`WorkerHost` 상속) |
| `event-box-dispatcher.provider.ts` | `ddd-event.created` 이벤트를 받아 큐에 job을 추가하는 구현체 |
| `event-box.module.ts` | TypeORM(DddEvent) + BullMQ 큐 등록 |

### 동작 흐름

```text
Aggregate.publishEvent()
-> DddRepository.save()
-> ddd_events 테이블 저장
-> @Transactional 종료
-> eventEmitter.emit('ddd-event.created', dddEvent)
-> EventBoxDispatcherProvider.handleEventBoxCreated()
-> target queue.add(...)
-> CommonConsumer 기반 worker 처리
```

### queue 정의 규칙

- 큐 이름은 `queues.ts`의 `QueueName` enum에 추가한다.
- default export는 `Object.values(QueueName).map((name) => ({ name }))` 패턴으로 BullMQ 등록 배열을 만든다.
- 새 큐를 추가하면 `EventBoxModule`의 `BullModule.registerQueue(...queues)`에 자동 반영된다.

```ts
export enum QueueName {
    HEALTH = 'health-queue',
}
export default Object.values(QueueName).map((name) => ({ name }));
```

### dispatcher 규칙

- `CommonDispatcher`는 base 클래스로, 이벤트-큐 매핑을 static `_eventMap`으로 관리한다.
- `pushEventMap(event, queueName)` static 메서드로 이벤트 클래스와 큐를 매핑한다.
- `EventBoxDispatcherProvider`는 `CommonDispatcher`를 상속하며, `@OnEvent('ddd-event.created')`로 이벤트를 수신한다.
- 처리 순서:
  1. DB에서 `PENDING` 상태 이벤트인지 확인 (중복 방지)
  2. `eventMap`에서 대상 큐 목록 조회
  3. 각 큐에 job 추가 (`attempts: 3`, `backoff: exponential 1000ms`, `removeOnComplete: true`, `removeOnFail: 7일`)
  4. 성공 시 `eventStatus`를 `PROCESSED`로 갱신

### consumer 작성 규칙

- `CommonConsumer` abstract 클래스를 상속한다 (`WorkerHost` 기반).
- `methodHandlerMap`에 job name별 handler를 등록한다.
- `process(job)` 메서드는 base class가 처리한다. 구현체는 handler만 등록하면 된다.
- handler는 JSON.parse된 payload plain object를 받아서 처리한다.
- 실패 시 `@OnWorkerEvent('failed')` 핸들러가 자동으로:
  - traceId 포함 에러 로그를 남긴다.
  - local 환경이 아니면 Slack 알림을 보낸다.
- consumer는 `asyncLocalStorage.run()` 안에서 실행되며, traceId가 컨텍스트에 복원된다.

### 이벤트-큐 매핑 규칙

- `@EventHandler(EventClass, QueueName.X)` 데코레이터로 매핑한다.
- 이 데코레이터는 내부적으로 `CommonDispatcher.pushEventMap()`을 호출한다.
- 이벤트를 만들었으면 어느 큐가 처리할지를 반드시 함께 등록한다.

### 도메인 이벤트 작성 규칙

- `DddEvent` 계열로 동작해야 한다.
- `eventType`은 `constructor.name` 기반으로 식별되므로, 클래스명은 안정적으로 유지한다.
- payload는 직렬화 가능한 plain data만 넣는다.
- request 객체, repository, service 같은 런타임 객체를 payload에 넣지 않는다.

### event-box를 써야 하는 경우

- 후처리를 비동기로 분리하고 싶을 때
- 재시도 가능한 작업으로 보내고 싶을 때 (메일, 알림, 외부 API 호출 등)
- 트랜잭션 commit 이후에만 실행되어야 할 때

### event-box를 쓰지 않아도 되는 경우

- 단순 CRUD로 끝나는 작업
- 비동기 큐 분리가 필요 없는 짧은 동기 처리
- 큐 consumer가 없는 경우

## 8. 새 공통 feature 추가 규칙

common 폴더에 새 feature를 추가할 때 아래 순서를 따른다.

1. `src/common/<feature>` 폴더 생성
2. `<feature>.service.ts` 작성 (`@Injectable()`)
3. `<feature>.module.ts` 작성 (providers + exports)
4. `index.ts` 작성 (`export *` barrel export)
5. `common.module.ts`의 imports/exports에 새 모듈 추가

## 9. import 패턴

- common 내부 모듈 간 참조는 `@common/<feature>` alias를 사용한다.
- 외부 라이브러리 타입은 `import type { ... }` 문법을 우선 사용한다.
- 사용 중인 alias:
  - `@common/context` → Context, ContextKey, asyncLocalStorage
  - `@common/slack` → SlackService
  - `@configs` → ConfigsService
  - `@libs/ddd` → DddEvent, DddEventStatus

```ts
// common 내부 간 참조 패턴
import { ContextKey } from '@common/context';
import { SlackService } from '@common/slack';
import { ConfigsService } from '@configs';
```

## 10. 코드 스타일 규칙

- 클래스명: `PascalCase` (Context, SlackService, CommonDispatcher)
- enum: `PascalCase` 이름 + `SCREAMING_SNAKE_CASE` 값 (일부 도메인 enum은 lowercase 값)
- private 필드: `camelCase` (static은 `_` 접두어: `_eventMap`)
- 로거: `private readonly logger = new Logger(ClassName.name)` 패턴
- DI 주입: 생성자 `private readonly` 패턴 또는 프로퍼티 `@Inject()` + `!` 패턴
- 에러 처리: throw하지 않고 catch 후 로그/Slack 전송 패턴이 기본
- 주석: 한국어로 작성 (// NOTE: 패턴 사용)

## 11. 현재 코드 기준 주의사항

- `QueueName`은 `HEALTH` 하나만 있다.
- `CommonConsumer`를 상속한 concrete consumer가 아직 없다.
- `@EventHandler(...)` 사용처도 아직 없다.
- `CommonDispatcher.getQueue()`는 빈 객체에서 큐를 꺼내는 형태라, 실제 큐 인스턴스를 반환하지 못한다.
- event-box 기능을 새로 만들 때는 이벤트 클래스뿐 아니라 `큐 주입/반환 방식`, `consumer 구현`, `event-queue 매핑`까지 같이 완성해야 한다.

## 12. event-box 구현 체크리스트

- 이벤트 클래스명을 안정적으로 정의했는가
- aggregate 또는 도메인 저장 흐름에서 `publishEvent()`를 호출하는가
- 저장이 `DddRepository.save()` 경로를 타는가
- service가 `@Transactional()` 안에서 동작하는가
- `QueueName`에 새 큐를 추가했는가
- consumer를 만들고 실제 handler를 등록했는가
- event type과 큐를 매핑했는가
- `CommonDispatcher.getQueue()` 또는 동등한 큐 반환 경로를 구현했는가
- 실패 시 재시도/Slack 알림이 의도대로 동작하는가

## 13. 전체 구현 원칙

- common은 비즈니스 로직을 두지 않는 인프라 계층이다.
- 비즈니스 모듈에서 중복되는 인프라성 기능이 있으면 common으로 올린다.
- controller에서 직접 큐를 밀어 넣거나 Slack을 호출하지 않는다. service를 통한다.
- event-box 구조를 바꿨다면 `common/event-box`, `libs/ddd`, `libs/decorators`, `databases` 연결 지점까지 함께 검토한다.
