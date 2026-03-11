## Why

이 프로젝트는 기능적으로 완성된 RealWorld(Conduit) 앱이지만, 테스트(3개 파일), CI/CD(없음), 문서화(README만)가 부족하다. 바이브 코딩 워크샵에서 참가자가 Claude Code CLI로 새 기능을 개발하고 PR→CI 통과 플로우를 체험하려면, 사전에 품질 인프라가 갖춰져야 한다.

## What Changes

- CLAUDE.md 작성: 프로젝트 구조, 아키텍처 패턴(Fat Controller/Thin Service), 테스트 패턴, PR 가이드 문서화
- 단위 테스트 추가: UserService(13개 케이스) + ArticleApiHandlersController(16개 케이스) — 비즈니스 로직이 실제로 있는 레이어만 테스트
- GitHub Actions CI 파이프라인: PR→master 시 lint→test→build (NX affected 기반)
- 프로젝트별 Jest 커버리지 임계치(50%) 설정
- openspec 프로젝트 컨텍스트 설정

## Capabilities

### New Capabilities
- `project-documentation`: CLAUDE.md 기반 프로젝트 문서화 — 구조, 패턴, 명령어, 테스트 가이드
- `unit-testing`: user/article 도메인 핵심 모듈 단위 테스트 및 커버리지 임계치
- `ci-pipeline`: GitHub Actions 기반 PR CI 파이프라인 (lint, test, build)

### Modified Capabilities
<!-- 기존 스펙 없음 — 신규 프로젝트 설정 -->

## Impact

- **Affected NX libraries:**
  - `user-api-shared` — UserService 테스트 추가, jest.config.js 커버리지 설정
  - `article-api-handlers` — Controller 테스트 추가, jest.config.js 커버리지 설정
- **New files:**
  - `CLAUDE.md` (프로젝트 루트)
  - `.github/workflows/ci.yml`
  - `libs/user/api/shared/src/lib/user.service.spec.ts`
  - `libs/article/api/handlers/src/lib/article-api-handlers.controller.spec.ts`
- **Modified files:**
  - `libs/user/api/shared/jest.config.js` (커버리지 임계치)
  - `libs/article/api/handlers/jest.config.js` (커버리지 임계치)
  - `openspec/config.yaml` (프로젝트 컨텍스트)
- **Dependencies:** 변경 없음 (기존 Jest, ESLint 활용)
- **Breaking changes:** 없음
