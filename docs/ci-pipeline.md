# CI Pipeline Guide

## 개요

GitHub Actions 기반 CI 파이프라인으로, Pull Request가 `master` 브랜치로 열리거나 업데이트될 때 자동 실행됩니다.

## 트리거 조건

| 이벤트             | 트리거 여부      |
| ------------------ | ---------------- |
| PR → master        | O (자동 실행)    |
| 직접 push → master | X (트리거 안 됨) |

## 파이프라인 단계

```
npm ci → Lint → Test → Build
```

모든 단계는 **NX affected** 명령어를 사용하여 변경된 프로젝트만 검사합니다.

### 1. 의존성 설치

```bash
npm ci  # 결정적(deterministic) 설치, package-lock.json 기반
```

### 2. Lint

```bash
npx nx affected:lint --base=origin/master
```

변경된 프로젝트의 ESLint 검사를 실행합니다.

### 3. Test

```bash
npx nx affected:test --base=origin/master --coverage
```

변경된 프로젝트의 Jest 테스트를 실행합니다. `--coverage` 플래그로 커버리지도 측정합니다.

### 4. Build

```bash
npx nx affected:build --base=origin/master
```

변경된 프로젝트의 프로덕션 빌드를 검증합니다.

## 실패 시 동작

- 각 단계는 순차적으로 실행됩니다.
- **어떤 단계든 실패하면 이후 단계는 실행되지 않습니다.**
- 예: Lint 실패 → Test, Build 건너뜀

## 환경 설정

| 항목        | 값                | 이유                                 |
| ----------- | ----------------- | ------------------------------------ |
| Node.js     | 18 LTS            | `bcrypt@5.0.1` 호환성                |
| fetch-depth | 0 (전체 히스토리) | NX affected의 `git diff` 비교에 필요 |
| npm ci      | 결정적 설치       | 캐시 친화적, 재현 가능               |
| DB          | 불필요            | 모든 테스트가 mock 기반              |

## 워크플로우 파일

`.github/workflows/ci.yml` — 전체 설정은 이 파일을 참조하세요.

## 동시성 제어

같은 PR에서 연속 push 시, 이전 실행은 자동 취소됩니다:

```yaml
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```
