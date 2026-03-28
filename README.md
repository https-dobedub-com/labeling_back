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
- 실제 dubright_label 메타데이터 통합 task:

```bash
npm run copy:dubright:label-metadata:dry
```

- 이 task는 `project.genre`, `project.sub_genre(NULL)`, `project.source_lang`, `character.role_type`, `clip.duration_sec`까지 함께 반영합니다.
