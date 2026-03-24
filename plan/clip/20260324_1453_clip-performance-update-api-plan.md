> ✅ 작업 완료 (2026-03-24 14:59:26)

# clip performance 업데이트 API

- 대상 경로: `src/services/clip`

## 개요
- 작업 목적: 사람이 직접 입력하는 `performance` 라벨링 데이터를 저장/수정할 수 있는 API를 추가한다.
- 작업 범위: `PUT /clips/:id/performance` 엔드포인트, request DTO, repository raw query update/insert(upsert), service 연결을 포함한다.
- 작업 범위 제외: `performance` 외 다른 테이블 수정 API, 목록 API 구조 변경, DB 스키마 변경은 제외한다.

## 현재 상태 분석
- 현재 `clip` 도메인은 general 단일 타입 구조다.
- `GET /clips/:id`는 이미 `performance`를 포함한 메타데이터 상세 응답을 내려준다.
- `performance`는 `clip_id`를 PK/FK로 쓰는 `clip` 기준 1:1 확장 테이블이다.
- 현재 저장/수정용 API는 없고, repository도 조회 raw query만 있다.
- 사용자 설명 기준 `performance` 값은 사람이 `clip`을 듣고 직접 입력하는 라벨링 데이터다.

## 변경 계획

### 생성할 파일
| 파일 경로 | 역할 | 비고 |
|-----------|------|------|
| `src/services/clip/controllers/dto/clip-performance-update.dto.ts` | performance 업데이트 body DTO | partial update 허용 |

### 수정할 파일
| 파일 경로 | 변경 내용 | 비고 |
|-----------|-----------|------|
| `src/services/clip/controllers/dto/index.ts` | DTO export 추가 | |
| `src/services/clip/controllers/clip.controller.ts` | `PUT /clips/:id/performance` 추가 | |
| `src/services/clip/applications/clip.service.ts` | performance update use case 추가 | |
| `src/services/clip/repository/clip-performance.repository.ts` | `performance` upsert raw query 추가 | |

### 삭제할 파일
| 파일 경로 | 삭제 이유 |
|-----------|-----------|
| (없음) | |

## 구현 상세

### 1. request DTO 추가
- `clip-performance-update.dto.ts`를 만든다.
- `performance` 테이블 컬럼을 기준으로 업데이트 가능한 필드를 정의한다.
- 사람이 수동 입력하는 라벨링 데이터라 partial update를 허용한다.
- JSON 컬럼(`situational_tags`, `nonverbal_events`, `prosody_tags`)은 배열/객체 입력을 받을 수 있게 정리한다.

### 2. repository raw query 추가
- `upsertPerformance(clipId, payload)` 메서드를 추가한다.
- 전략은 `INSERT ... ON DUPLICATE KEY UPDATE`를 쓴다.
- 전달되지 않은 필드는 기존 값을 유지하도록 SQL을 구성한다.
- JSON 필드는 문자열로 직렬화해서 저장한다.

### 3. service / controller 연결
- `PUT /clips/:id/performance`를 추가한다.
- service는 clip 존재 여부를 먼저 확인한 뒤 update를 수행한다.
- 저장 후에는 갱신된 performance 데이터를 다시 반환하거나, 기존 메타데이터 상세 응답을 재사용한다.

### 4. 검증
- `npm run build`
- DTO / import / export 누락 확인

## 체크리스트
- [x] ~~performance update DTO 추가~~ ✅ 2026-03-24 14:59:26
- [x] ~~repository upsert raw query 추가~~ ✅ 2026-03-24 14:59:26
- [x] ~~service/controller 연결~~ ✅ 2026-03-24 14:59:26
- [x] ~~응답 반환 방식 정리~~ ✅ 2026-03-24 14:59:26
- [x] ~~build 검증~~ ✅ 2026-03-24 14:59:26

## 참고사항
- 참조한 rules 문서 목록
- `rules/module-generation.md`
- `rules/services-pattern.md`
- `rules/dto-pattern.md`
- `rules/plan-rules.md`
- 참조한 context 문서 목록
- `context/domain/clip.md`
- 주의사항
- `performance.clip_id`는 PK라 새 row가 없으면 insert, 있으면 update가 필요하다.
- JSON 컬럼 직렬화/역직렬화 일관성을 유지해야 한다.
- 승인 전 구현을 시작하지 않는다.

## 구현 결과 요약
- 생성한 파일
  - `src/services/clip/controllers/dto/clip-performance-update.dto.ts`
  - `src/services/clip/repository/clip-performance.repository.ts`
- 수정한 파일
  - `src/services/clip/controllers/dto/index.ts`
  - `src/services/clip/controllers/clip.controller.ts`
  - `src/services/clip/applications/clip.service.ts`
  - `src/services/clip/clip.module.ts`
- 주요 변경 사항 요약
  - `PUT /clips/:id/performance` 엔드포인트를 추가했다.
  - `performance` 테이블을 `INSERT ... ON DUPLICATE KEY UPDATE` 방식으로 저장/수정하도록 raw query repository를 추가했다.
  - 저장 후에는 `GET /clips/:id`와 같은 메타데이터 상세 응답을 다시 반환하도록 연결했다.
  - `npm run build` 검증을 완료했다.
