> ✅ 작업 완료 (2026-03-24 14:07:59)

# DB 쿼리 컨텍스트 문서화

- 대상 경로: `context/`

## 개요
- 작업 목적: 현재 연결된 DB의 6개 테이블 구조와 관계를 context 문서로 정리해, 이후 에이전트가 쿼리 작업 시 참고할 수 있게 한다.
- 작업 범위: 제공된 DDL을 기준으로 테이블 요약, PK/FK, 조인 경로, JSON 컬럼, 쿼리 시 주의사항을 문서화한다.
- 작업 범위 제외: 실제 DB 스키마 변경, 쿼리 구현, 코드 변경은 제외한다.

## 현재 상태 분석
- `context/business-overview.md`는 비어 있다.
- `context/domain/`에는 실제 참고용 문서가 아직 없다.
- 사용자 제공 기준 현재 주요 테이블은 총 6개다:
  - `project`
  - `character`
  - `speaker`
  - `clip`
  - `license_qc`
  - `performance`
- 쿼리 작업 관점에서 핵심 허브 테이블은 `clip`이다.
- JSON 컬럼은 `character.personality_tags`, `license_qc.allowed_usage`, `performance.situational_tags`, `performance.nonverbal_events`, `performance.prosody_tags`다.

## 변경 계획

### 생성할 파일
| 파일 경로 | 역할 | 비고 |
|-----------|------|------|
| `context/domain/clip.md` | 6개 테이블 상세 참조 문서 | PK/FK, 컬럼 요약, 조인 포인트 정리 |

### 수정할 파일
| 파일 경로 | 변경 내용 | 비고 |
|-----------|-----------|------|
| `context/business-overview.md` | 전체 데이터 구조와 쿼리 관점 개요 추가 | 허브 테이블, 관계, 조회 흐름 요약 |

### 삭제할 파일
| 파일 경로 | 삭제 이유 |
|-----------|-----------|
| (없음) | |

## 구현 상세

### 1. business overview 보강
- 전체 테이블 수와 역할 분류를 짧게 적는다.
- `project -> character -> clip -> license_qc/performance` 흐름과 `speaker -> clip` 흐름을 요약한다.
- 쿼리 작업 시 어느 테이블을 기준으로 조인해야 하는지 적는다.

### 2. 상세 query reference 문서 작성
- 테이블별로 아래 항목을 정리한다:
  - 용도
  - PK
  - 주요 FK
  - 자주 쓰는 컬럼
  - JSON 컬럼 여부
  - 자주 발생하는 조인 패턴
- 에이전트가 바로 참고할 수 있게 예시 조회 포인트도 적는다.

### 3. 주의사항 정리
- `license_qc`, `performance`는 `clip_id` 1:1 확장 테이블로 본다는 점 명시
- `project_id`, `character_id`, `speaker_id` null 가능성 명시
- JSON 컬럼은 문자열이 아니라 JSON 함수 기반 조회가 필요할 수 있음을 명시

## 체크리스트
- [x] ~~`business-overview.md` 개요 작성~~ ✅ 2026-03-24 14:07:59
- [x] ~~`clip.md` 생성~~ ✅ 2026-03-24 14:07:59
- [x] ~~관계/조인 규칙 정리~~ ✅ 2026-03-24 14:07:59
- [x] ~~JSON 컬럼/주의사항 정리~~ ✅ 2026-03-24 14:07:59
- [x] ~~문서 검토~~ ✅ 2026-03-24 14:07:59

## 참고사항
- 참조한 rules 문서 목록
- `rules/plan-rules.md`
- 참조한 context 문서 목록
- `context/business-overview.md`
- 주의사항
- 이번 문서는 사용자 제공 DDL을 기준으로 작성한다.
- 승인 전 구현을 시작하지 않는다.

## 구현 결과 요약
- 생성한 파일
  - `context/domain/clip.md`
- 수정한 파일
  - `context/business-overview.md`
- 주요 변경 사항 요약
  - 현재 연결된 6개 테이블의 역할과 관계를 `business-overview.md`에 요약했다.
  - `clip` 도메인 기준으로 실제 쿼리 작업에 바로 참고할 수 있는 레퍼런스 문서를 추가했다.
  - PK/FK, 기본 조인 경로, JSON 컬럼, null/default 값, 실무용 조회 포인트를 정리했다.
