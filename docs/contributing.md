# Contributing Guide (PR Workflow)

바이브 코딩 워크샵 참가자를 위한 PR 기여 가이드입니다.

## PR 워크플로우

### 1. 브랜치 생성

```bash
git checkout -b feature/my-feature
```

### 2. 코드 변경

기능 개발 또는 버그 수정을 진행합니다.

### 3. 테스트 실행

```bash
# 변경된 프로젝트만 테스트
npx nx affected:test

# 특정 프로젝트 테스트
npx nx test user-api-shared
npx nx test article-api-handlers
```

### 4. Lint 검사

```bash
# 변경된 프로젝트만 린트
npx nx affected:lint

# 전체 린트
npm run lint
```

### 5. 커밋

```bash
git add <변경된 파일들>
git commit -m "설명적인 커밋 메시지"
```

### 6. 푸시

```bash
git push -u origin feature/my-feature
```

### 7. PR 생성

GitHub에서 `master` 브랜치로 Pull Request를 생성합니다.

## CI 자동 검사

PR을 생성하면 GitHub Actions CI가 자동으로 실행됩니다:

```
npm ci → Lint → Test (with coverage) → Build
```

- 모든 단계가 통과해야 PR 머지가 가능합니다.
- NX affected 기반으로 **변경된 프로젝트만** 검사합니다.
- 같은 PR에서 추가 push 시 이전 CI 실행은 자동 취소됩니다.

## 코딩 컨벤션

| 항목     | 규칙                           |
| -------- | ------------------------------ |
| 언어     | TypeScript (strict mode 아님)  |
| 들여쓰기 | 2칸 스페이스                   |
| 따옴표   | 싱글 쿼트 (`'`)                |
| 삭제     | 소프트 삭제만 (하드 삭제 금지) |
| 기본키   | UUID                           |

## 새 기능 추가 시 참고

### 백엔드 (NestJS)

1. 엔티티는 `BaseEntity`를 상속
2. 서비스는 `BaseService<T>`를 상속 (CRUD 자동 제공)
3. 비즈니스 로직은 컨트롤러에 작성 (Fat Controller 패턴)
4. 공개 라우트는 `@SkipAuth()` 데코레이터 사용
5. 응답은 `ActionSuccessResponse`, `DetailSuccessResponse`, `ListSuccessResponse` 래퍼 사용

### 테스트

1. 서비스에 로직이 있으면 → 서비스 테스트
2. 컨트롤러에 로직이 있으면 → 컨트롤러 테스트
3. `TestingModule` 사용하지 않음 — 직접 인스턴스 생성
4. 파일 상단에 `@nestjs/typeorm` mock 필수
