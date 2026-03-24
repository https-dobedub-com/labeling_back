> ✅ 작업 완료 (2026-03-24 10:44:37)

# clip 구조 정렬

- 대상 경로: `src/services/clip`

## 개요
- 작업 목적: 현재 `src/services/clip` 구조를 `rules/module-generation.md`, `rules/services-pattern.md`, `rules/dto-pattern.md` 기준에 맞게 재정렬한다.
- 작업 범위: `clip` 도메인 내부 파일명, 클래스명, DTO 배치, 모듈 구성, import 경로를 정리한다.
- 작업 범위 제외: DB 스키마 변경, 새 엔드포인트 추가, 다른 도메인(`project`, `character`, `speaker`) 구현은 이번 범위에서 제외한다.

## 현재 상태 분석
- 현재 `clip`은 general 전용 도메인인데도 `general-clip.module.ts`, `general-clip.service.ts`, `general-clip.controller.ts`처럼 복수 타입 도메인 규칙의 네이밍을 일부 사용하고 있다.
- `rules/module-generation.md` 기준으로 general 전용 도메인은 `<domain>.module.ts`, `<domain>.service.ts`, `<domain>.controller.ts` 형태가 기본이다.
- `rules/dto-pattern.md` 기준으로 DTO 파일은 `<domain>-<purpose>.dto.ts` 형식을 따라야 하는데, 현재 `list-clip.query.dto.ts`는 규칙 문서 예시와 맞지 않는다.
- `clip.repository.ts`는 현재 `TypeORM Repository<Clip>` 직접 주입 방식인데, 문서 기준으로는 repository naming / query DTO / service 호출 흐름을 먼저 정리할 필요가 있다.
- `context/domain/clip.md`는 아직 존재하지 않는다. 비즈니스 컨텍스트 문서가 비어 있으므로 이번 작업은 코드 구조 정렬에 한정한다.

## 변경 계획

### 생성할 파일
| 파일 경로 | 역할 | 비고 |
|-----------|------|------|
| `src/services/clip/clip.module.ts` | general 전용 단일 타입 모듈 | 기존 `general-clip.module.ts` 대체 |
| `src/services/clip/applications/clip.service.ts` | general 전용 서비스 | 기존 `general-clip.service.ts` 대체 |
| `src/services/clip/controllers/clip.controller.ts` | general 전용 컨트롤러 | 기존 `general-clip.controller.ts` 대체 |
| `src/services/clip/controllers/dto/clip-query.dto.ts` | query DTO | 기존 `list-clip.query.dto.ts` 대체 |
| `src/services/clip/controllers/dto/index.ts` | DTO barrel export | 문서 규칙 반영 |

### 수정할 파일
| 파일 경로 | 변경 내용 | 비고 |
|-----------|-----------|------|
| `src/services/generals.ts` | 새 모듈 파일명에 맞춰 import 수정 | |
| `src/services/clip/repository/clip.repository.ts` | DTO import, 메서드 시그니처, naming 정리 | |
| `README.md` | clip 도메인 파일 구조/엔드포인트 설명이 바뀌면 반영 | 필요 시 최소 수정 |

### 삭제할 파일
| 파일 경로 | 삭제 이유 |
|-----------|-----------|
| `src/services/clip/general-clip.module.ts` | 단일 타입 규칙에 맞지 않는 파일명 |
| `src/services/clip/applications/general-clip.service.ts` | 단일 타입 규칙에 맞지 않는 파일명 |
| `src/services/clip/controllers/general-clip.controller.ts` | 단일 타입 규칙에 맞지 않는 파일명 |
| `src/services/clip/controllers/dto/list-clip.query.dto.ts` | DTO 파일명 규칙 불일치 |

## 구현 상세

### 1. 단일 타입 도메인 네이밍으로 정리
- `general-clip.module.ts`를 `clip.module.ts`로 교체한다.
- `general-clip.service.ts`를 `clip.service.ts`로 교체한다.
- `general-clip.controller.ts`를 `clip.controller.ts`로 교체한다.
- 클래스명도 각각 `ClipModule`, `ClipService`, `ClipController`로 맞춘다.

### 2. DTO 파일 구조 정리
- `list-clip.query.dto.ts`를 `clip-query.dto.ts`로 교체한다.
- `controllers/dto/index.ts`를 추가해 barrel export를 만든다.
- 컨트롤러와 서비스는 DTO를 barrel import 또는 규칙에 맞는 파일명으로 참조한다.

### 3. import / 모듈 연결 정리
- `src/services/generals.ts`의 import를 `./clip/clip.module`로 변경한다.
- repository의 query DTO import도 새 파일명으로 맞춘다.
- 모듈 내부 provider / export 선언은 문서 규칙대로 유지한다.

### 4. 잔여 흔적 정리
- 삭제 대상 파일을 제거한다.
- `rg`로 `general-clip`, `list-clip`, 잘못된 import가 남아 있는지 확인한다.

## 체크리스트
- [x] ~~clip 도메인 단일 타입 네이밍 정리~~ ✅ 2026-03-24 10:44:37
- [x] ~~DTO 파일 구조 및 barrel export 정리~~ ✅ 2026-03-24 10:44:37
- [x] ~~generals.ts 및 import 연결 수정~~ ✅ 2026-03-24 10:44:37
- [x] ~~잔여 파일/문구 정리~~ ✅ 2026-03-24 10:44:37
- [x] ~~build 검증~~ ✅ 2026-03-24 10:44:37

## 참고사항
- 참조한 rules 문서 목록
- `rules/module-generation.md`
- `rules/services-pattern.md`
- `rules/dto-pattern.md`
- `rules/plan-rules.md`
- 참조한 context 문서 목록
- `context/business-overview.md` (내용 없음)
- `context/domain/clip.md` (현재 없음)
- 주의사항
- 이 계획은 구조 정렬만 다룬다.
- AGENTS 규칙에 따라 사용자 승인 전에는 구현을 시작하지 않는다.

## 구현 결과 요약
- 생성한 파일
  - `src/services/clip/clip.module.ts`
  - `src/services/clip/applications/clip.service.ts`
  - `src/services/clip/controllers/clip.controller.ts`
  - `src/services/clip/controllers/dto/clip-query.dto.ts`
  - `src/services/clip/controllers/dto/index.ts`
  - `src/common/types.ts`
- 수정한 파일
  - `src/services/generals.ts`
  - `src/services/clip/repository/clip.repository.ts`
  - `src/common/index.ts`
  - `src/libs/utils/typeorm.ts`
- 삭제한 파일
  - `src/services/clip/general-clip.module.ts`
  - `src/services/clip/applications/general-clip.service.ts`
  - `src/services/clip/controllers/general-clip.controller.ts`
  - `src/services/clip/controllers/dto/list-clip.query.dto.ts`
- 주요 변경 사항
  - general 전용 단일 타입 도메인 네이밍으로 `clip` 구조를 정리했다.
  - query DTO를 문서 규칙에 맞춰 `clip-query.dto.ts`와 barrel export 구조로 맞췄다.
  - `PaginationDto`를 추가하고 controller/service/repository 흐름을 `conditions + options` 패턴으로 정리했다.
  - `npm run build` 검증까지 완료했다.
