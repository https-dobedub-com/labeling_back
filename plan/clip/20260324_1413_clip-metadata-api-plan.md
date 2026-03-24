> ✅ 작업 완료 (2026-03-24 14:18:22)

# clip 메타데이터 API

- 대상 경로: `src/services/clip`

## 개요
- 작업 목적: `clip` 단건 조회 API에서 화면 메타데이터에 필요한 컬럼을 한 번에 내려줄 수 있도록, `clip`과 연관 테이블 데이터를 모두 포함한 상세 조회 API를 만든다.
- 작업 범위: `GET /clips/:id`를 메타데이터 상세 응답으로 확장하고, repository raw query, service, controller, DTO를 정리한다.
- 작업 범위 제외: 목록 API 응답 구조 변경, DB 스키마 변경, 다른 도메인 API 추가는 제외한다.

## 현재 상태 분석
- 현재 `GET /clips/:id`는 [clip.controller.ts](/Users/nes0903/Documents/labeling_back/src/services/clip/controllers/clip.controller.ts) -> [clip.service.ts](/Users/nes0903/Documents/labeling_back/src/services/clip/applications/clip.service.ts) -> [clip.repository.ts](/Users/nes0903/Documents/labeling_back/src/services/clip/repository/clip.repository.ts) 흐름이다.
- 현재 repository `find()`는 `clip` 단일 테이블 컬럼만 조회한다.
- `context/domain/clip.md` 기준으로 메타데이터 화면에 필요한 연관 테이블은 아래다.
  - `project`
  - `character`
  - `speaker`
  - `license_qc`
  - `performance`
- `license_qc`, `performance`는 `clip` 기준 1:1 확장 테이블이므로 `LEFT JOIN`이 적절하다.
- DTO 규칙상 관계 depth가 깊고 계산/조합 필드가 많으므로 response DTO를 추가하는 편이 안전하다.

## 변경 계획

### 생성할 파일
| 파일 경로 | 역할 | 비고 |
|-----------|------|------|
| `src/services/clip/controllers/dto/clip-response.dto.ts` | 상세 메타데이터 응답 DTO | nested/grouped 응답 구조 정의 |

### 수정할 파일
| 파일 경로 | 변경 내용 | 비고 |
|-----------|-----------|------|
| `src/services/clip/repository/clip.repository.ts` | 단건 메타데이터 raw query 추가 | 다중 `LEFT JOIN` |
| `src/services/clip/applications/clip.service.ts` | 상세 메타데이터 조회 로직 추가 | DTO 변환 포함 |
| `src/services/clip/controllers/clip.controller.ts` | 기존 `GET /clips/:id`를 메타데이터 응답으로 연결 | |
| `src/services/clip/controllers/dto/index.ts` | response DTO export 추가 | |

### 삭제할 파일
| 파일 경로 | 삭제 이유 |
|-----------|-----------|
| (없음) | |

## 구현 상세

### 1. 상세 메타데이터 raw query 추가
- `clip_repository`에 `findMetadataById(id: number)` 메서드를 추가한다.
- `clip` 기준으로 아래를 `LEFT JOIN` 한다.
  - `project`
  - `character`
  - `speaker`
  - `license_qc`
  - `performance`
- 컬럼은 화면 메타데이터에서 바로 쓰기 좋게 alias를 정리한다.

### 2. 응답 DTO 추가
- `clip-response.dto.ts`에 상세 응답 DTO를 만든다.
- 구조는 아래처럼 묶는다.
  - `clip`
  - `project`
  - `character`
  - `speaker`
  - `licenseQc`
  - `performance`
- null 가능한 확장 테이블은 nullable 응답으로 둔다.

### 3. service / controller 연결
- `ClipService.retrieve(id)`는 단순 `find({ clipId })` 대신 메타데이터 query를 호출한다.
- 결과 없으면 `NotFoundException` 유지
- `ClipController`의 `GET /clips/:id`는 그대로 두고 응답 데이터만 메타데이터 상세로 바꾼다.

### 4. 검증
- `npm run build`
- `rg`로 DTO export / import 누락 확인

## 체크리스트
- [x] ~~repository 메타데이터 raw query 추가~~ ✅ 2026-03-24 14:18:22
- [x] ~~response DTO 추가~~ ✅ 2026-03-24 14:18:22
- [x] ~~service/controller 연결 수정~~ ✅ 2026-03-24 14:18:22
- [x] ~~import / export 정리~~ ✅ 2026-03-24 14:18:22
- [x] ~~build 검증~~ ✅ 2026-03-24 14:18:22

## 참고사항
- 참조한 rules 문서 목록
- `rules/module-generation.md`
- `rules/services-pattern.md`
- `rules/dto-pattern.md`
- `rules/plan-rules.md`
- 참조한 context 문서 목록
- `context/business-overview.md`
- `context/domain/clip.md`
- 주의사항
- `license_qc`, `performance`는 `LEFT JOIN` 기준으로 처리한다.
- 승인 전 구현을 시작하지 않는다.

## 구현 결과 요약
- 생성한 파일
  - `src/services/clip/controllers/dto/clip-response.dto.ts`
- 수정한 파일
  - `src/services/clip/repository/clip.repository.ts`
  - `src/services/clip/applications/clip.service.ts`
  - `src/services/clip/controllers/dto/index.ts`
- 주요 변경 사항 요약
  - `GET /clips/:id`가 `clip`, `project`, `character`, `speaker`, `license_qc`, `performance`를 함께 내려주는 메타데이터 상세 응답으로 확장되었다.
  - repository에 다중 `LEFT JOIN` 기반 raw query를 추가했다.
  - JSON 컬럼은 service에서 파싱해 화면에서 바로 쓰기 좋게 정리했다.
  - `npm run build` 검증을 완료했다.
