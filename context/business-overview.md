# DB 개요

## 현재 연결된 테이블

- 현재 연결된 DB 기준 핵심 테이블은 6개다.
- 마스터 성격 테이블
  - `project`
  - `character`
  - `speaker`
- 허브 테이블
  - `clip`
- clip 확장 메타 테이블
  - `license_qc`
  - `performance`

## 관계 요약

- `project (1) -> (N) character`
- `project (1) -> (N) clip`
- `character (1) -> (N) clip`
- `speaker (1) -> (N) clip`
- `clip (1) -> (0..1) license_qc`
- `clip (1) -> (0..1) performance`

## 조회 기준점

- 프로젝트 기준 조회
  - `project -> clip`
  - 필요 시 `clip -> character`, `clip -> speaker`, `clip -> license_qc`, `clip -> performance`
- 캐릭터 기준 조회
  - `character -> clip -> project`
- 화자 기준 조회
  - `speaker -> clip -> project`
- 라이선스/QC 기준 조회
  - `clip LEFT JOIN license_qc`
- 감정/퍼포먼스 기준 조회
  - `clip LEFT JOIN performance`

## 쿼리 작성 주의사항

- 허브는 `clip`이다. 대부분의 상세 조회는 `clip`에서 시작하는 편이 단순하다.
- `license_qc`, `performance`는 `clip_id` 기반 1:1 확장 테이블이지만, 모든 clip에 항상 row가 있다고 가정하지 않는다.
- 따라서 `clip`에서 `license_qc`, `performance`를 붙일 때는 기본값으로 `LEFT JOIN`을 우선 고려한다.
- nullable FK가 있다.
  - `character.project_id`
  - `clip.project_id`
  - `clip.character_id`
  - `clip.speaker_id`
- ID 타입이 섞여 있다.
  - 정수: `project_id`, `speaker_id`, `clip_id`
  - 문자열: `character_id`, `episode_id`, `session_id`, `contract_id`, `annotator_id`

## JSON 컬럼

- `character.personality_tags`
- `license_qc.allowed_usage`
- `performance.situational_tags`
- `performance.nonverbal_events`
- `performance.prosody_tags`

- 위 컬럼들은 `longtext + json_valid(...) check` 구조다.
- 일반 문자열 검색보다 JSON 함수 기반 조회를 우선 고려한다.
- 다만 인덱스가 없으므로 대량 조회에서는 비용이 커질 수 있다.

## 우선 확인할 문서

- clip 도메인 쿼리 작업 시: `context/domain/clip.md`
