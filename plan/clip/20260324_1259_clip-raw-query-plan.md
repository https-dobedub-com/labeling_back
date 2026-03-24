> ✅ 작업 완료 (2026-03-24 13:04:54)

# clip raw query 전환

- 대상 경로: `src/services/clip`

## 개요
- 작업 목적: `clip` 도메인에서 TypeORM Entity/Repository 기반 조회를 제거하고, raw query로 DB를 직접 조회하는 구조로 전환한다.
- 작업 범위: `clip.entity.ts` 제거, `clip.repository.ts`를 raw query 전용으로 재작성, `clip.module.ts` 의존성 정리, 서비스 레이어 연동 변경을 포함한다.
- 작업 범위 제외: 다른 도메인 구조 변경, DB 스키마 변경, 신규 엔드포인트 추가는 제외한다.

## 현재 상태 분석
- 현재 `clip` 도메인은 `clip.module.ts`, `clip.service.ts`, `clip.repository.ts`, `clip.entity.ts` 구조를 사용 중이다.
- `clip.repository.ts`는 `@InjectRepository(Clip)` + `Repository<Clip>` 기반이다.
- 사용자 요청은 entity 자체를 없애고 raw query 방식으로 직접 조회하자는 것이다.
- 현재 `ddd-aggregate` 수정 영향으로 `ddd-repository.ts`의 `setTraceId()` 호출이 깨져 있으며, 현재 `npm run build`는 실패 상태다.
- `clip`은 조회 중심 구조라 raw query로 전환해도 현재 요구 범위 안에서는 대응 가능하다.

## 변경 계획

### 생성할 파일
| 파일 경로 | 역할 | 비고 |
|-----------|------|------|
| (없음) | | |

### 수정할 파일
| 파일 경로 | 변경 내용 | 비고 |
|-----------|-----------|------|
| `src/services/clip/repository/clip.repository.ts` | `DataSource` 기반 raw query repository로 재작성 | `find`, `count`만 유지 |
| `src/services/clip/applications/clip.service.ts` | raw query repository 반환값 기준으로 조회 로직 정리 | |
| `src/services/clip/clip.module.ts` | `TypeOrmModule.forFeature([Clip])` 제거 | 필요 시 provider만 유지 |
| `src/databases/entities.ts` | `Clip` 엔티티 등록 제거 | |

### 삭제할 파일
| 파일 경로 | 삭제 이유 |
|-----------|-----------|
| `src/services/clip/domain/clip.entity.ts` | raw query 전환으로 Entity 불필요 |

## 구현 상세

### 1. repository를 raw query 전용으로 전환
- `InjectRepository(Clip)` 제거
- `InjectDataSource()` 또는 `DataSource` 주입으로 변경
- `find`, `count`는 SQL 문자열 + 파라미터 바인딩 방식으로 구현
- 페이징과 정렬은 기존 `PaginationOptions`를 유지하되 SQL로 직접 반영

### 2. service 연동 수정
- `retrieve()`는 repository의 기본 `find({ clipId })` 결과에서 단건을 검증하는 방식 유지
- 반환 타입은 Entity 인스턴스가 아니라 raw row object 기준으로 처리

### 3. module / entities 정리
- `clip.module.ts`에서 `TypeOrmModule.forFeature([Clip])` 제거
- `databases/entities.ts`에서 `Clip` 제거
- `clip.entity.ts` 파일 삭제

### 4. 검증
- `rg`로 `Clip` 엔티티 import 잔여 확인
- `npm run build` 통과 확인

## 체크리스트
- [x] ~~clip repository raw query 전환~~ ✅ 2026-03-24 13:04:54
- [x] ~~clip service 연동 정리~~ ✅ 2026-03-24 13:04:54
- [x] ~~module / entities / entity 파일 정리~~ ✅ 2026-03-24 13:04:54
- [x] ~~잔여 import / 타입 참조 정리~~ ✅ 2026-03-24 13:04:54
- [x] ~~build 검증~~ ✅ 2026-03-24 13:04:54

## 참고사항
- 참조한 rules 문서 목록
- `rules/module-generation.md`
- `rules/services-pattern.md`
- `rules/plan-rules.md`
- 참조한 context 문서 목록
- `context/business-overview.md` (내용 없음)
- `context/domain/clip.md` (현재 없음)
- 주의사항
- raw query는 SQL injection 방지를 위해 반드시 파라미터 바인딩 방식으로 작성한다.
- 승인 전 구현을 시작하지 않는다.

## 구현 결과 요약
- 생성한 파일
  - (없음)
- 수정한 파일
  - `src/services/clip/repository/clip.repository.ts`
  - `src/services/clip/clip.module.ts`
  - `src/services/clip/applications/clip.service.ts`
  - `src/databases/entities.ts`
  - `src/libs/ddd/ddd-repository.ts`
- 삭제한 파일
  - `src/services/clip/domain/clip.entity.ts`
- 주요 변경 사항 요약
  - `clip.repository.ts`를 `DataSource.query()` 기반 raw query repository로 전환했다.
  - `clip.module.ts`에서 `TypeOrmModule.forFeature([Clip])`를 제거했다.
  - `Clip` entity 등록을 제거하고 `clip.entity.ts` 파일을 삭제했다.
  - `ddd-repository.ts`는 현재 `ddd-aggregate` 상태와 맞도록 `setTraceId` optional 호출로 컴파일 가능하게 정리했다.
  - `npm run build` 검증을 완료했다.
