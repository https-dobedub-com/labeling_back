# labeling_back Agent Instructions

- 작업 루트는 현재 `labeling_back` 리포지토리 또는 그 하위 디렉토리로 간주한다.
- 공용 문서(`AGENTS.md`, `rules/`, `context/`, `plan/`)는 이 리포지토리 루트에서 함께 관리한다.
- 상위 다른 레포의 shared 문서를 기본값으로 참조하지 않는다.
- 실제 코드 조회, 파일 수정, 테스트 실행, git 명령은 모두 현재 `labeling_back` 리포지토리 범위 안에서 수행한다.
- 이 레포에서 모든 작업을 시작할 때 `rules/` 폴더에서 관련 문서를 확인하고, 그 규칙을 기본값으로 따른다.

## rules 문서 목록

| 파일 | 대상 | 언제 참조하는가 |
|------|------|----------------|
| `module-generation.md` | 모듈 생성 절차 | 새 도메인 모듈을 만들 때 |
| `services-pattern.md` | `src/services/` | 도메인 모듈 코드를 작성·수정할 때 |
| `dto-pattern.md` | DTO 작성 | endpoint 입출력 DTO를 만들 때 |
| `validator-pattern.md` | 비즈니스 검증 | `domain/validators` 계층을 만들 때 |
| `configs-pattern.md` | `src/configs/` | 환경 변수·설정을 추가·수정할 때 |
| `databases-pattern.md` | `src/databases/` | DB 연결, 엔티티 등록을 변경할 때 |
| `common-pattern.md` | `src/common/` | context, 공통 유틸, 공용 모듈 작업 시 |
| `libs-pattern.md` | `src/libs/` | base 클래스, 데코레이터, 유틸 사용·확장 시 |
| `middlewares-pattern.md` | `src/middlewares/` | 미들웨어를 추가·수정할 때 |
| `swagger-pattern.md` | `src/swagger/` | Swagger 문서 생성을 변경할 때 |
| `plan-rules.md` | `plan/` | 작업 계획서 작성 시 |

- 모듈 구조를 새로 만들 때는 `controller -> application service -> repository -> entity` 흐름을 유지한다.
- import 경로는 가능한 한 이 레포의 alias 규칙을 따른다.
- alias: `@configs`, `@databases`, `@common/*`, `@middlewares`, `@libs/*`, `@services/*`
- 규칙 문서와 실제 코드가 다르면, 우선 실제 코드 패턴을 확인하고 그 차이를 사용자에게 짧게 보고한다.
- 구조 규칙을 바꿨다면, 관련 `rules/*.md` 문서도 함께 갱신한다.

## 비즈니스 컨텍스트

- 작업 전 `context/` 폴더에서 관련 도메인의 비즈니스 맥락을 확인한다.
- 비즈니스 로직 판단이 필요할 때 반드시 참조한다.
- 도메인별 컨텍스트 파일은 `context/domain/<도메인명>.md`에 위치한다.

| 파일 | 내용 | 언제 참조하는가 |
|------|------|----------------|
| `business-overview.md` | 서비스 개요, 권한/사용자 구조, 운영 맥락 | 전체 비즈니스 맥락 파악 시 |
| `domain/clip.md` | clip 도메인 규칙, 상태값, 테이블 연관관계 | clip 도메인 작업 시 |

## 작업 계획서 규칙

- 모든 작업을 시작하기 전에 `plan/<도메인>/` 폴더에 계획서를 먼저 작성한다.
- 파일명: `<YYYYMMDD>_<HHmm>_<작업명>-plan.md` (예: `20260324_1010_clip-domain-plan.md`)
- 날짜와 시간을 파일명 맨 앞에 두어 파일시스템에서 시간순 정렬을 보장한다.
- 도메인 분류가 애매하면 `plan/etc/`에 넣는다.
- **계획서 작성 후 반드시 멈추고 사용자 승인을 기다린다. 승인 전에 구현 작업을 시작하지 않는다.**
- 상세 규칙과 템플릿은 `rules/plan-rules.md`를 참조한다.
