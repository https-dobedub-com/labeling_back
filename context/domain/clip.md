# clip 도메인 쿼리 레퍼런스

## 테이블 구성

- 현재 관련 테이블은 6개다.
- 핵심 흐름
  - `project -> character`
  - `project -> clip`
  - `speaker -> clip`
  - `clip -> license_qc`
  - `clip -> performance`

## 테이블별 요약

### 1. `project`

- 역할: 작품/프로젝트 마스터
- PK: `project.project_id`
- 주요 컬럼
  - `title_ko`
  - `title_en`
  - `genre`
  - `sub_genre`
  - `rating`
  - `language`
  - `is_localized`
  - `source_lang`
- 연결
  - `character.project_id`
  - `clip.project_id`

### 2. `character`

- 역할: 프로젝트 내 캐릭터 메타
- PK: `character.character_id` (`varchar(50)`)
- FK: `project_id -> project.project_id`
- 주요 컬럼
  - `role_name`
  - `gender`
  - `age_group`
  - `role_type`
  - `dialect`
  - `speech_level`
- JSON 컬럼
  - `personality_tags`
- 연결
  - `clip.character_id -> character.character_id`

### 3. `speaker`

- 역할: 실제 녹음 화자/성우 마스터
- PK: `speaker.speaker_id`
- 주요 컬럼
  - `name`
  - `gender`
  - `language`
- 연결
  - `clip.speaker_id -> speaker.speaker_id`

### 4. `clip`

- 역할: 허브 테이블. 대부분의 조회 시작점
- PK: `clip.clip_id`
- FK
  - `project_id -> project.project_id`
  - `character_id -> character.character_id`
  - `speaker_id -> speaker.speaker_id`
- 인덱스
  - `idx_clip_project (project_id)`
  - `idx_clip_character (character_id)`
  - `idx_clip_speaker (speaker_id)`
- 주요 컬럼
  - `episode_id`
  - `script_text`
  - `audio_path`
  - `session_id`
  - `mic_type`
  - `room_id`
  - `distance_category`
  - `sample_rate`
  - `bit_depth`
  - `channels`
  - `duration_sec`
  - `noise_level`
  - `post_process`

### 5. `license_qc`

- 역할: clip별 라이선스/QC 확장 정보
- PK: `license_qc.clip_id`
- FK: `clip_id -> clip.clip_id`
- 관계: `clip` 기준 1:1 확장 테이블로 취급
- 주요 컬럼
  - `contract_id`
  - `allowed_region`
  - `license_period_start`
  - `license_period_end`
  - `secondary_license`
  - `consent_version`
  - `consent_scope`
  - `qc_result`
  - `qc_notes`
  - `annotator_id`
  - `annotation_timestamp`
- JSON 컬럼
  - `allowed_usage`

### 6. `performance`

- 역할: clip별 감정/퍼포먼스 라벨 확장 정보
- PK: `performance.clip_id`
- FK: `clip_id -> clip.clip_id`
- 관계: `clip` 기준 1:1 확장 테이블로 취급
- 주요 컬럼
  - `primary_emotion`
  - `secondary_emotion`
  - `valence`
  - `arousal`
  - `speaking_style`
  - `delivery_intent`
  - `scene_context_short`
  - `relationship`
  - `utterance_type`
- JSON 컬럼
  - `situational_tags`
  - `nonverbal_events`
  - `prosody_tags`

## 기본 조인 경로

### clip 기본 상세 조회

```sql
SELECT
    c.clip_id,
    c.project_id,
    c.character_id,
    c.speaker_id,
    c.episode_id,
    c.script_text,
    c.audio_path,
    p.title_ko,
    ch.role_name,
    s.name AS speaker_name
FROM clip c
LEFT JOIN project p ON p.project_id = c.project_id
LEFT JOIN `character` ch ON ch.character_id = c.character_id
LEFT JOIN speaker s ON s.speaker_id = c.speaker_id
WHERE c.clip_id = ?;
```

### clip + QC + performance 조회

```sql
SELECT
    c.clip_id,
    l.qc_result,
    l.allowed_region,
    pf.primary_emotion,
    pf.secondary_emotion,
    pf.speaking_style
FROM clip c
LEFT JOIN license_qc l ON l.clip_id = c.clip_id
LEFT JOIN performance pf ON pf.clip_id = c.clip_id
WHERE c.clip_id = ?;
```

### 프로젝트 단위 clip 목록 조회

```sql
SELECT
    c.clip_id,
    c.episode_id,
    c.character_id,
    c.speaker_id,
    c.duration_sec,
    c.created_at
FROM clip c
WHERE c.project_id = ?
ORDER BY c.clip_id DESC
LIMIT ? OFFSET ?;
```

## 쿼리 작성 규칙

- clip 상세 조회는 기본적으로 `clip`에서 시작한다.
- `license_qc`, `performance`는 기본적으로 `LEFT JOIN`을 우선 고려한다.
- `project_id`, `character_id`, `speaker_id`는 nullable이라 inner join을 남발하지 않는다.
- `character_id`는 문자열 PK다.
- `clip_id`, `project_id`, `speaker_id`는 정수 PK/FK다.
- `episode_id`, `session_id`, `contract_id`, `annotator_id`는 문자열 식별자다.

## JSON 컬럼 조회 시 메모

- `character.personality_tags`
- `license_qc.allowed_usage`
- `performance.situational_tags`
- `performance.nonverbal_events`
- `performance.prosody_tags`

- 이 컬럼들은 `JSON` 타입이 아니라 `longtext + json_valid check` 구조다.
- 따라서 일반 `LIKE`보다 JSON 함수 사용을 먼저 고려한다.
- 다만 인덱스가 없으므로 필터 비용이 크다.

## 실무용 조회 포인트

- 프로젝트 전체 현황
  - `project -> clip`
  - 필요 시 `clip -> license_qc`, `clip -> performance`
- 캐릭터별 수집 현황
  - `character -> clip`
- 화자별 녹음 현황
  - `speaker -> clip`
- QC 진행 현황
  - `clip LEFT JOIN license_qc`
- 감정/발화 라벨 현황
  - `clip LEFT JOIN performance`

## null / default 메모

- `clip.distance_category` 기본값: `근접`
- `clip.sample_rate` 기본값: `48000`
- `clip.bit_depth` 기본값: `16`
- `clip.channels` 기본값: `1`
- `clip.noise_level` 기본값: `clean`
- `clip.post_process` 기본값: `raw`
- `license_qc.allowed_region` 기본값: `전세계`
- `license_qc.secondary_license` 기본값: `0`
- `license_qc.qc_result` 기본값: `pending`
- `character.dialect` 기본값: `표준어`
- `character.speech_level` 기본값: `반말`
- `project.rating` 기본값: `전체`
- `project.language` 기본값: `ko`
- `speaker.language` 기본값: `ko`
