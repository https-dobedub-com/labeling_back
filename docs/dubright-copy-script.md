# Dubright Copy Script

## 목적

- `dubright` 계열 source DB에서 일부 데이터를 읽어 target DB 테이블로 복사할 때 쓰는 독립 실행 스크립트 골격이다.
- Nest 런타임을 띄우지 않고 `ts-node`로 직접 실행한다.

## 구조

```text
scripts/
  dubright-copy.ts
  lib/
    db.ts
    logger.ts
    types.ts
  examples/
    dubright-copy.example.ts
```

## 실행 개념

1. source DB에서 batch 단위 조회
2. row 단위 transform
3. target DB에 insert / upsert
4. dry-run 또는 실제 실행

## 필요한 환경변수

```bash
SOURCE_DB_HOST=
SOURCE_DB_PORT=3306
SOURCE_DB_USER=
SOURCE_DB_PASSWORD=
SOURCE_DB_NAME=

TARGET_DB_HOST=
TARGET_DB_PORT=3306
TARGET_DB_USER=
TARGET_DB_PASSWORD=
TARGET_DB_NAME=
```

## 실행 예시

```bash
npm run copy:dubright -- --task ./scripts/examples/dubright-copy.example.ts --dry-run
```

```bash
npm run copy:dubright -- --task ./scripts/examples/dubright-copy.example.ts --batch-size 500 --limit 1000
```

## 권장 절차

1. example 파일을 복사해 실제 task 파일을 만든다.
2. source SELECT SQL을 실제 테이블 기준으로 수정한다.
3. transform 로직을 맞춘다.
4. target INSERT / UPSERT SQL을 맞춘다.
5. `--dry-run`으로 먼저 실행한다.
6. 소량 `--limit`으로 실제 실행한다.
7. 마지막에 전체 실행한다.

## 주의사항

- source / target 매핑은 task 파일에서 직접 정의해야 한다.
- 같은 작업을 다시 돌릴 수 있도록 target write는 가능하면 upsert로 작성한다.
- source row 건수, target 반영 건수를 로그로 확인한다.
- production source는 read-only 계정 사용을 권장한다.
