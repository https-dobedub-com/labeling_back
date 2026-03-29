# labeling_back

`pudding-back`, `vogopang_back` 구조를 따라 만든 NestJS 백엔드 기초 스켈레톤입니다.

## 포함 내용

- `configs`, `databases`, `common`, `middlewares`, `libs`, `services` 기본 폴더
- `Context` 기반 요청 스코프
- `TypeORM` + `DddAggregate / DddRepository` 베이스
- `health` 체크 엔드포인트
- `clip` 테이블 기반 도메인

## 실행

```bash
npm install
npm run start:dev
```

## 기본 엔드포인트

- `GET /health`
- `GET /clips`
- `GET /clips/:id`

## 데이터 복사 스크립트

```bash
npm run copy:dubright:help
```

- 상세 설명: `docs/dubright-copy-script.md`
- project metadata task:

```bash
npm run copy:dubright:project-metadata:dry
```

- character role_type task:

```bash
npm run copy:dubright:character-role-type:dry
```

- clip duration task:

```bash
npm run copy:dubright:clip-duration:dry
```

- `.env.copy`가 있으면 copy script 실행 시 자동으로 읽습니다.
- 상세 실패 로그는 `logs/copy/<runId>.jsonl`에 남습니다.
- 실제 실행 시 target write는 batch transaction 단위로 rollback 됩니다.
- 실행 완료 후 `target-audit` 결과로 target 기준 미처리 행 존재 여부를 확인할 수 있습니다.
