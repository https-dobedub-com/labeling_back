# labeling_back services 폴더 규칙

이 문서는 `src/services` 폴더의 구조와 실제 코드 패턴을 기준으로 추출한 규칙이다.
모듈 생성 절차와 체크리스트는 `rules/module-generation.md`를 참고한다. 이 문서는 실제 코드 수준의 컨벤션에 집중한다.

> **참고**: 도메인 설계 시 비즈니스 맥락은 `context/` 폴더를 참조한다.

## 1. 폴더 구조

### 1-1. admin 전용 도메인 (예: `admin/`)

```text
src/services/
  admins.ts                             # 시스템 관리자 모듈 그룹 (필요 시)
  clients.ts                            # 외부 클라이언트 모듈 그룹 (필요 시)
  generals.ts                           # 일반 사용자 모듈 그룹 (default export 배열)
  admin/
    admin.module.ts                     # NestJS 모듈
    applications/
      admin.service.ts                  # use case 서비스
    controllers/
      admin.controller.ts              # HTTP 컨트롤러
    domain/
      admin.entity.ts                   # TypeORM 엔티티 (DddAggregate 상속)
    repository/
      admin.repository.ts              # 데이터 접근 (DddRepository 상속)
```

### 1-2. 복수 타입 도메인 (예: `<domain>/` — admin + client + general)

하나의 도메인이 여러 타입에서 사용되면, **모듈·컨트롤러·서비스를 타입별로 분리**하되 **엔티티·리포지토리는 공유**한다.
모든 도메인이 반드시 3개 타입을 가져야 하는 것은 아니다. 필요한 타입만 만든다.

```text
src/services/<domain>/
  admin-<domain>.module.ts              # 시스템 관리자 전용 모듈
  client-<domain>.module.ts             # 외부 클라이언트 전용 모듈
  general-<domain>.module.ts            # 일반 사용자 전용 모듈
  applications/
    admin-<domain>.service.ts           # 시스템 관리자 전용 서비스
    client-<domain>.service.ts          # 외부 클라이언트 전용 서비스
    general-<domain>.service.ts         # 일반 사용자 전용 서비스
    <domain>.service.ts                 # (선택) 공유 로직, 이벤트 핸들러
  controllers/
    admin-<domain>.controller.ts        # @Controller('admins/<domain>')
    client-<domain>.controller.ts       # @Controller('clients/<domain>')
    general-<domain>.controller.ts      # @Controller('<domain>')
    dto/                                # DTO (타입별 또는 공용)
  domain/
    <domain>.entity.ts                  # 공유 엔티티
    validators/                         # 공유 검증 로직
  repository/
    <domain>.repository.ts              # 공유 리포지토리
```

### 1-3. 단일 타입 전용 도메인

특정 타입만 필요한 경우, 해당 타입의 모듈·서비스·컨트롤러만 만든다.
구조는 1-2에서 불필요한 타입의 파일을 생략한 형태와 동일하다.

## 2. 모듈 그룹 파일 규칙

- `src/services` 루트에는 필요한 그룹 파일만 둔다. 현재 기본값은 `generals.ts`다.
- 그룹 파일은 모듈 배열을 **default export** 한다.
- `app.module.ts`에서 spread로 등록한다.

```ts
// src/services/admins.ts — 시스템 관리자
import { AdminModule } from './admin/admin.module';
export default [AdminModule];

// src/services/clients.ts — 외부 클라이언트
export default [];

// src/services/generals.ts — 일반 사용자
export default [];

// src/app.module.ts
import adminsModule from './services/admins';
import clientsModule from './services/clients';
import generalsModule from './services/generals';
imports: [...adminsModule, ...clientsModule, ...generalsModule],
```

**규칙**:
- 시스템 관리자 모듈(`Admin*Module`)은 `admins.ts`에 등록한다.
- 외부 클라이언트 모듈(`Client*Module`)은 `clients.ts`에 등록한다.
- 일반 사용자 모듈(`General*Module`)은 `generals.ts`에 등록한다.
- 하나의 도메인이 여러 타입에 필요하면, 각 타입의 모듈을 해당 그룹 파일에 **각각** 등록한다.
- 같은 `*Module`을 여러 그룹 파일에 중복 등록하지 않는다 (NestJS 중복 등록 경고 방지).
- Swagger 문서 생성도 이 그룹 파일 단위로 분리된다.

## 3. 도메인 모듈 내부 구조 규칙

### 3-1. 단일 타입 도메인 (admin 전용 또는 general 전용)

```text
<domain>/
  <domain>.module.ts        # 모듈 정의
  applications/             # use case 서비스
    <domain>.service.ts
  controllers/              # HTTP 컨트롤러
    <domain>.controller.ts
  domain/                   # 엔티티, 도메인 로직
    <domain>.entity.ts
  repository/               # 데이터 접근
    <domain>.repository.ts
```

### 3-2. 복수 타입 도메인 (admin / client / general)

```text
<domain>/
  admin-<domain>.module.ts          # 시스템 관리자 모듈
  client-<domain>.module.ts         # 외부 클라이언트 모듈
  general-<domain>.module.ts        # 일반 사용자 모듈
  applications/
    admin-<domain>.service.ts       # 시스템 관리자 서비스
    client-<domain>.service.ts      # 외부 클라이언트 서비스
    general-<domain>.service.ts     # 일반 사용자 서비스
    <domain>.service.ts             # (선택) 공유 로직, 이벤트 핸들러
  controllers/
    admin-<domain>.controller.ts    # @Controller('admins/<domain>')
    client-<domain>.controller.ts   # @Controller('clients/<domain>')
    general-<domain>.controller.ts  # @Controller('<domain>')
  domain/
    <domain>.entity.ts              # 공유 엔티티
  repository/
    <domain>.repository.ts          # 공유 리포지토리
```

**핵심 규칙**:
- 엔티티와 리포지토리는 **1개만** 만들고 모든 타입의 모듈에서 공유한다.
- 모듈·컨트롤러·서비스는 타입별(admin/client/general)로 **분리**한다.
- 각 모듈은 공유 리포지토리를 providers에 넣고 exports로 내보낸다.
- 모든 도메인이 3개 타입을 가져야 하는 것은 아니다. 필요한 타입만 만든다.

필요에 따라 추가 가능한 폴더:
- `controllers/dto/` — 요청/응답 DTO (`rules/dto-pattern.md` 참고)
- `domain/validators/` — 비즈니스 규칙 검증 (`rules/validator-pattern.md` 참고)

## 4. 모듈 파일 패턴

### 4-1. 단일 타입 모듈 (`<domain>.module.ts`)

```ts
@Module({
    controllers: [AdminController],
    providers: [AdminRepository, AdminService],
    exports: [AdminRepository, AdminService],
})
export class AdminModule {}
```

### 4-2. 복수 타입 분리 모듈

```ts
// admin-task.module.ts
@Module({
    controllers: [AdminTaskController],
    providers: [TaskRepository, AdminTaskService],
    exports: [TaskRepository, AdminTaskService],
})
export class AdminTaskModule {}

// client-task.module.ts
@Module({
    controllers: [ClientTaskController],
    providers: [TaskRepository, ClientTaskService],
    exports: [TaskRepository, ClientTaskService],
})
export class ClientTaskModule {}

// general-task.module.ts
@Module({
    controllers: [GeneralTaskController],
    providers: [TaskRepository, GeneralTaskService],
    exports: [TaskRepository, GeneralTaskService],
})
export class GeneralTaskModule {}
```

**규칙**:
- `controllers`에 컨트롤러를 등록한다.
- `providers`와 `exports`에 Repository와 Service를 동시에 넣는다.
- `@Global()` 데코레이터를 붙이지 않는다 (비즈니스 모듈은 글로벌이 아님).
- import는 상대 경로로 모듈 내부 파일을 참조한다.
- 타입별 분리 시, **공유 리포지토리는 각 모듈의 providers에 각각 등록**한다.
- 같은 use case를 처리하는 컨트롤러 handler 메서드명과 application service 메서드명은 동일하게 맞춘다.
- 예: controller가 `answer()`를 호출하면 service도 `answer()`를 사용한다.

## 5. 엔티티 패턴 (`domain/<domain>.entity.ts`)

```ts
type Ctor = {
    email: string;
    password: string;
    sub?: string;
};

@Entity('admins')
export class Admin extends DddAggregate {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ comment: '네이버웍스 고유 ID', nullable: true })
    sub?: string;

    constructor(args: Ctor) {
        super();
        if (args) {
            this.email = args.email;
            this.password = args.password;
            this.sub = args.sub;
        }
    }
}
```

**규칙**:
- `DddAggregate`를 상속한다 (createdAt, updatedAt, deletedAt, 이벤트 발행 자동 제공).
- `@Entity('<table_name>')` 으로 테이블명을 명시한다.
- 생성자는 `Ctor` 타입 객체를 받아 필드를 채운다.
- `Ctor` 타입은 엔티티 파일 상단에 `type`으로 정의한다 (interface가 아님).
- `constructor`에서 `if (args)` 가드를 넣는다 (TypeORM이 인자 없이 인스턴스를 생성하는 경우 대응).
- `super()`를 반드시 호출한다.
- `@Column()`의 `comment` 옵션으로 컬럼 설명을 한국어로 남긴다.
- 새 엔티티를 만들면 `src/databases/entities.ts` 배열에 등록해야 한다.

## 6. Repository 패턴 (`repository/<domain>.repository.ts`)

```ts
@Injectable()
export class AdminRepository extends DddRepository<Admin> {
    entityClass = Admin;

    async find(
        conditions: { id?: number; email?: string; sub?: string },
        options?: TypeormRelationOptions<Admin>
    ) {
        return this.entityManager.find(this.entityClass, {
            where: stripUndefined({
                id: conditions.id,
                email: conditions.email,
                sub: conditions.sub,
            }),
            ...convertOptions(options),
        });
    }

    async count(conditions: { id?: number; email?: string; sub?: string }) {
        return this.entityManager.count(this.entityClass, {
            where: stripUndefined({ ... }),
        });
    }
}
```

### 6-1. 교차 도메인 조회 규칙

- 다른 도메인의 정보를 참조해야 할 때는 **해당 도메인의 repository를 주입받고 그 repository의 `find(...)`를 사용**한다.
- 예: clip 서비스에서 프로젝트 정보를 확인해야 하면 `ProjectRepository.find({ id: projectId })`를 호출한다.
- 다른 도메인 엔티티를 `entityManager`로 직접 조회하지 않는다.
- service 내부 helper로 우회하기보다, **어떤 repository의 `find(...)`를 통해 조회하는지가 코드에 드러나도록 유지**한다.

### 6-2. 기간(범위) 조회 패턴

날짜 범위 조건은 `checkRangeValue()` 유틸을 사용한다.

```ts
import { checkRangeValue } from '@libs/utils';

async find(
    conditions: {
        id?: number;
        search?: string;
        searchKey?: string;
        minCreatedAt?: string;
        maxCreatedAt?: string;
    },
    options?: PaginationOptions
) {
    return this.entityManager.find(this.entityClass, {
        where: stripUndefined({
            id: conditions.id,
            createdAt: checkRangeValue(conditions.minCreatedAt, conditions.maxCreatedAt),
            ...checkLikeValue({ searchKey: conditions.searchKey, searchValue: conditions.search }),
        }),
        ...convertOptions(options),
    });
}
```

**`checkRangeValue(minValue, maxValue)` 동작:**

| minValue | maxValue | 결과 |
|----------|----------|------|
| ✅ | ✅ | `And(MoreThanOrEqual(min), LessThan(max))` |
| ✅ | ❌ | `MoreThanOrEqual(min)` |
| ❌ | ✅ | `LessThan(max)` |
| ❌ | ❌ | `undefined` (조건 제외) |

**필드명 규칙:**
- 범위 조건의 파라미터명은 `min{필드명}`, `max{필드명}` 으로 짓는다.
- 예: `minCreatedAt` / `maxCreatedAt`, `minStartOn` / `maxStartOn`
- 엔티티 필드 하나에 시작/종료가 분리된 경우 각각 적용한다.
  ```ts
  startOn: checkRangeValue(conditions.minStartOn, conditions.maxStartOn),
  endOn: checkRangeValue(conditions.minEndOn, conditions.maxEndOn),
  ```

**DTO에서의 기간 필드:**
```ts
// Query DTO
export class AdminInquiryQueryDto extends PaginationDto {
    @IsOptional()
    minCreatedAt?: string;

    @IsOptional()
    maxCreatedAt?: string;

    @IsOptional()
    search?: string;

    @IsOptional()
    searchKey?: string;
}
```

**규칙**:
- `DddRepository<Entity>`를 상속한다.
- `entityClass = EntityClass`를 반드시 명시한다.
- `@Injectable()` 데코레이터를 붙인다.
- 조회 조건은 **plain object** (`{ id?, email?, ... }`)로 받는다.
- 조건에서 undefined 값 제거는 `stripUndefined()`를 사용한다.
- 페이지네이션/정렬/relations 변환은 `convertOptions()`를 사용한다.
- `this.entityManager`를 통해 TypeORM을 호출한다 (직접 DataSource를 쓰지 않음).
- service나 controller에서 `entityManager.find()`를 직접 호출하지 않는다.
- 날짜 범위 조회는 `checkRangeValue()`를 사용한다 — 직접 `Between`, `MoreThanOrEqual` 등을 쓰지 않는다.

## 7. Service 패턴 (`applications/<domain>.service.ts`)

### 메서드 시그니처 — 인라인 destructuring 패턴 (필수)

서비스 메서드의 첫 번째 파라미터는 **인라인 destructuring + 인라인 타입 정의** 형태를 쓴다.
`conditions` 같은 변수명으로 객체를 통째로 받지 않는다.

```ts
// ✅ 올바른 패턴 — 인라인 destructuring
async list({ search }: { search?: string }, options?: PaginationOptions) { ... }
async create({ title, content }: { title: string; content: string }) { ... }
async retrieve({ id, user }: { id: number; user?: User }) { ... }

// ❌ 잘못된 패턴 — conditions 변수로 받기
async list(conditions: { search?: string }, options?: PaginationOptions) { ... }
```

### 대표 예시

```ts
@Injectable()
export class AdminClipService extends DddService {
    constructor(private readonly clipRepository: ClipRepository) {
        super();
    }

    async list({ search }: { search?: string }, options?: PaginationOptions) {
        const [items, total] = await Promise.all([
            this.clipRepository.find({ search }, options),
            this.clipRepository.count({ search }),
        ]);
        return { items, total };
    }

    async create({ scriptText, audioPath }: { scriptText?: string; audioPath?: string }) {
        const clip = new Clip({ scriptText, audioPath });
        await this.clipRepository.save(clip);
    }

    async retrieve({ id }: { id: number }) {
        return this.clipRepository.findOneOrFail({ id });
    }
}
```

### General 서비스 — Context 값을 파라미터로 받는 패턴

```ts
async list({ user, search }: { user?: User; search?: string }, options?: PaginationOptions) {
    const [items, total] = await Promise.all([
        this.clipRepository.find({ search, userId: user?.id }, options),
        this.clipRepository.count({ search, userId: user?.id }),
    ]);
    return { items, total };
}
```

- 컨트롤러에서 Context로 꺼낸 `user`, `admin` 등을 서비스 메서드의 첫 번째 객체에 함께 넘긴다.

**규칙**:
- `DddService`를 상속한다 (entityManager, context, eventEmitter 자동 주입).
- `@Injectable()` 데코레이터를 붙인다.
- 생성자에서 `super()`를 호출하고, repository를 주입받는다.
- 다른 도메인 데이터를 참조할 때는 그 도메인의 repository를 생성자에 명시적으로 주입하고 `find(...)`를 호출한다.
- **첫 번째 파라미터: `{ 필드들 }: { 타입들 }` 인라인 destructuring** — `conditions` 같은 래핑 변수를 쓰지 않는다.
- **두 번째 파라미터: `options?: PaginationOptions`** — 목록 조회 시 pagination.
- 메서드는 **use case 단위**로 작성한다 (예: `list`, `create`, `update`, `retrieve`, `delete`).
- 목록 조회는 `{ items, total }` 형태로 반환한다.
- items와 total을 `Promise.all()`로 병렬 호출하는 패턴을 따른다.
- 트랜잭션이 필요한 메서드에는 `@Transactional()`을 붙인다.
- 필수 context나 필수 입력값이 비어 있는 경우에는 `BadRequestException`을 우선 사용한다.
- 실제 권한 부족이나 소유권 위반처럼 접근 자체가 금지된 경우에만 `ForbiddenException`을 사용한다.
- HTTP 관련 객체(req, res)를 직접 다루지 않는다.

## 8. Controller 패턴 (`controllers/<domain>.controller.ts`)

### 4단계 주석 규칙 (필수)

**모든 컨트롤러 핸들러에 아래 4단계 주석을 반드시 넣는다.** 주석이 없는 핸들러는 규칙 위반이다.
각 단계의 코드는 해당 주석 아래에 위치해야 한다. 해당 단계에서 할 일이 없어도 **주석은 반드시 남긴다** (빈 줄로 둔다).

```
// 1. Destructure body, params, query   → 입력 파싱·destructuring
// 2. Get context                       → Context에서 인증 정보 조회 (admin, user 등)
// 3. Get result                        → service 호출 (비즈니스 로직)
// 4. Send response                     → { data } 반환
```

### 8-1. Admin 컨트롤러 예시 (목록 조회)

```ts
@Controller('admins/clips')
export class AdminClipController {
    constructor(private readonly adminClipService: AdminClipService) {}

    @Get()
    async list(@Query() query: AdminClipQueryDto) {
        // 1. Destructure body, params, query
        const { search, ...options } = query;

        // 2. Get context

        // 3. Get result
        const data = await this.adminClipService.list({ search }, options);

        // 4. Send response
        return { data };
    }
}
```

### 8-2. Client 컨트롤러 예시 (외부 클라이언트 — Context 사용)

```ts
@Controller('clients/tasks')
export class ClientTaskController {
    constructor(
        private readonly clientTaskService: ClientTaskService,
        private readonly context: Context,
    ) {}

    @Get()
    async list(@Query() query: ClientTaskQueryDto) {
        // 1. Destructure body, params, query
        const { search, ...options } = query;

        // 2. Get context
        const client = this.context.get<Client>(ContextKey.CLIENT);

        // 3. Get result
        const data = await this.clientTaskService.list({ client, search }, options);

        // 4. Send response
        return { data };
    }
}
```

### 8-3. General 컨트롤러 예시 (일반 사용자)

```ts
@Controller('clips')
export class GeneralClipController {
    constructor(
        private readonly generalClipService: GeneralClipService,
    ) {}

    @Get()
    async list(@Query() query: GeneralClipQueryDto) {
        // 1. Destructure body, params, query
        const { search, ...options } = query;

        // 2. Get context

        // 3. Get result
        const data = await this.generalNoticeService.list({ search }, options);

        // 4. Send response
        return { data };
    }
}
```

### 8-4. 생성(Create) 예시

```ts
@Post()
async create(@Body() body: AdminNoticeCreateDto) {
    // 1. Destructure body, params, query
    const { title, content, isPublished } = body;

    // 2. Get context

    // 3. Get result
    await this.adminNoticeService.create({ title, content, isPublished });

    // 4. Send response
    return { data: {} };
}
```

### 각 단계 상세 설명

| 단계 | 목적 | 내용 |
|------|------|------|
| **1. Destructure** | 입력 분리 | `@Query`, `@Body`, `@Param`에서 받은 값을 destructuring. Query DTO는 `const { 도메인필드, ...options } = query` 패턴으로 pagination 분리 |
| **2. Get context** | 인증 정보 조회 | `this.context.get<Admin>(ContextKey.ADMIN)` 또는 `this.context.get<Client>(ContextKey.CLIENT)`. 불필요하면 주석만 남기고 비워둔다 |
| **3. Get result** | 서비스 호출 | `await this.service.method(...)` — 비즈니스 로직은 여기서만 실행. `const data = ...` 또는 `await ...` (반환값 없는 mutation) |
| **4. Send response** | 응답 반환 | 조회: `return { data }`, 생성/수정/삭제: `return { data: {} }` |

**규칙**:
- `@Controller('<resource-path>')` 경로는 리소스 기준으로 잡는다.
- **service 호출 코드는 반드시 "3. Get result" 주석 아래에 위치**한다. "2. Get context" 아래에 넣지 않는다.
- Context가 필요 없는 핸들러(주로 admin)도 "2. Get context" 주석은 남겨둔다 (일관성).
- Client 컨트롤러는 `Context`를 생성자에 주입받는다 (소속 프로젝트/조직 식별 필요 시). Admin, General 컨트롤러는 필요할 때만 주입한다.
- 응답은 `{ data: ... }` 래핑 패턴을 따른다.
- controller에서 DB 쿼리, 이벤트 발행, 비즈니스 판단을 직접 하지 않는다.
- service만 주입받고, repository를 직접 주입하지 않는다.
- `@Query()` 타입에 `PaginationOptions`를 직접 쓰지 않는다 → 도메인별 Query DTO를 만든다 (`rules/dto-pattern.md` §6 참고).

## 9. 의존 흐름

```text
Controller → Service → Repository → Entity
```

- 역방향 의존 금지.
- Controller는 Service만 호출한다.
- Service는 Repository를 조합할 수 있다.
- Repository는 Entity와 TypeORM만 다룬다.

## 10. 네이밍 규칙

### 10-1. 단일 타입 도메인

| 대상 | 패턴 | 예시 |
|------|------|------|
| 모듈 클래스 | `PascalCase + Module` | `AdminModule` |
| 서비스 클래스 | `PascalCase + Service` | `AdminService` |
| 리포지토리 클래스 | `PascalCase + Repository` | `AdminRepository` |
| 엔티티 클래스 | 도메인명 단수형 `PascalCase` | `Admin` |
| 컨트롤러 클래스 | `PascalCase + Controller` | `AdminController` |
| 파일명 | `<domain>.<role>.ts` (dot suffix) | `admin.service.ts` |
| 생성자 타입 | `Ctor` (type alias) | `type Ctor = { ... }` |
| 테이블명 | 복수형 lowercase | `admins` |

### 10-2. 복수 타입 분리 도메인 (admin / client / general)

| 대상 | Admin (시스템 관리자) | Client (외부 클라이언트) | General (일반 사용자) |
|------|---------------------|--------------|-----------------|
| 모듈 클래스 | `Admin{Domain}Module` | `Client{Domain}Module` | `General{Domain}Module` |
| 서비스 클래스 | `Admin{Domain}Service` | `Client{Domain}Service` | `General{Domain}Service` |
| 컨트롤러 클래스 | `Admin{Domain}Controller` | `Client{Domain}Controller` | `General{Domain}Controller` |
| 모듈 파일 | `admin-<domain>.module.ts` | `client-<domain>.module.ts` | `general-<domain>.module.ts` |
| 서비스 파일 | `admin-<domain>.service.ts` | `client-<domain>.service.ts` | `general-<domain>.service.ts` |
| 컨트롤러 파일 | `admin-<domain>.controller.ts` | `client-<domain>.controller.ts` | `general-<domain>.controller.ts` |
| 라우트 경로 | `admins/<domain>` | `clients/<domain>` | `<domain>` |

공유 항목 (타입에 무관):

| 대상 | 패턴 | 예시 |
|------|------|------|
| 공유 리포지토리 | `{Domain}Repository` | `InquiryRepository` |
| 공유 엔티티 | 도메인명 단수형 | `Inquiry` |

## 11. import 패턴

```ts
// 모듈 내부: 상대 경로
import { AdminRepository } from '../repository/admin.repository';

// 공통 라이브러리: alias
import { DddService } from '@libs/ddd';
import { DddAggregate } from '@libs/ddd';
import { DddRepository } from '@libs/ddd';
import { convertOptions, stripUndefined, TypeormRelationOptions } from '@libs/utils';
import { PaginationOptions } from '@libs/utils';
```

- 모듈 내부 참조는 상대 경로를 사용한다.
- 공통 코드는 `@libs/*`, `@common/*`, `@configs` alias를 사용한다.

## 12. 도메인 타입 판단 기준

- 도메인에 어떤 타입(admin/client/general)이 필요한지는 **요구사항에 따라 결정**한다.
- 반드시 3개 타입 모두 있어야 하는 것은 아니다. 필요한 타입만 만든다.
- admin만 필요하면 `admin-<domain>.module.ts` 하나만 만들고 `admins.ts`에만 등록한다.
- client만 필요하면 `client-<domain>.module.ts` 하나만 만들고 `clients.ts`에만 등록한다.
- general만 필요하면 `general-<domain>.module.ts` 하나만 만들고 `generals.ts`에만 등록한다.
- 여러 타입이 필요하면 각각 만들고 해당 그룹 파일에 각각 등록한다.

### 타입별 역할 요약

| 타입 | 사용자 | 역할 | ContextKey |
|------|--------|------|------------|
| `admin` | 시스템 관리자 | 전체 서비스 데이터 관리 | `ContextKey.ADMIN` |
| `client` | 외부 클라이언트 운영자 | 소속 프로젝트/조직 데이터 관리 | `ContextKey.CLIENT` |
| `general` | 일반 사용자 | 자신의 데이터만 접근 | — (JWT 유니크 키) |

## 13. 미완성 의존성 처리 — 주석 처리 규칙 (필수)

아직 존재하지 않는 도메인, 엔티티, 헬퍼, 공통 함수 등을 참조해야 할 경우, **직접 생성하지 않고 주석 처리**한다.

### 원칙
- 현재 작업 범위에 포함되지 않는 의존성은 **가정하고 주석으로 남긴다**.
- 주석에는 어떤 도메인/함수가 필요한지 알 수 있도록 의도를 명시한다.
- 해당 의존성이 완성되면 주석을 해제하여 활성화한다.
- 이 규칙은 특정 계층에만 적용되는 것이 아니라, **레포 어디서든 미래 작업 예정 의존성이 필요한 모든 계층**(`entity`, `repository`, `service`, `controller`, `dto`, `module`)에 동일하게 적용한다.
- 미래 의존성 흐름은 **최종 목표 구조를 기준으로 각 계층이 같은 방향을 바라보도록** 맞춘다.
- 아직 연결되지 않은 부분만 주석 처리하고, 이미 구현 가능한 부분은 같은 미래 흐름을 기준으로 유지한다.
- 즉, 어느 한 계층만 부분적으로 주석 처리하지 말고, 관련 계층들이 서로 맞물리는 형태로 주석과 구현을 정렬한다.

### 예시

```ts
// repository — 아직 Client 도메인이 없으므로 future filter를 주석 처리
conditions: {
    id?: number;
    // clientId?: number;
    // clientName?: string;
    search?: string;
},

where: stripUndefined({
    id: conditions.id,
    // client: conditions.clientId ? { id: conditions.clientId } : undefined,
    ...checkLikeValue({ ... }),
}),
relations: {
    admin: true,
    // client: true,
},
```

```ts
// service — 미래 Client 흐름을 기준으로 시그니처를 정렬
async list({
    search,
    // clientName,
}: {
    search?: string;
    // clientName?: string;
}) { ... }
```

```ts
// entity — 아직 Client 엔티티가 없으므로 relation 주석 처리
// @ManyToOne(() => Client)
// client: Client;
```

```ts
// controller — context 부분만 미완성이면 그 줄만 주석 처리
// const client = this.context.get(ContextKey.CLIENT);
const data = await this.clipService.list({ search, searchKey /* clientId: client.id */ }, options);
```

### 금지 사항
- ❌ 아직 없는 엔티티 파일을 직접 생성하여 빈 껍데기로 만들지 않는다.
- ❌ 아직 없는 유틸/헬퍼 함수를 임의로 만들지 않는다.
- ❌ 존재하지 않는 모듈을 import하여 빌드 에러를 유발하지 않는다.

## 14. 주의사항

- DTO, validator, guard, facade 계층은 필요 시 `rules/dto-pattern.md`, `rules/validator-pattern.md`를 참고하여 추가한다.
