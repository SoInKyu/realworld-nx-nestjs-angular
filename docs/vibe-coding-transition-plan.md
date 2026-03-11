# Vibe Coding Workshop Transition Plan

## 작업 배경

이 프로젝트(RealWorld/Conduit)는 NX 모노레포 기반의 Medium.com 클론으로, 기능적으로는 완성된 상태였으나 다음과 같은 품질 인프라가 부재했다:

| 영역      | 전환 전 상태                          | 문제점                                                      |
| --------- | ------------------------------------- | ----------------------------------------------------------- |
| 테스트    | 테스트 파일 3개, 커버리지 임계치 없음 | 코드 변경 시 회귀 검증 불가                                 |
| CI/CD     | 없음                                  | PR 품질 게이트 부재, 수동 검증에 의존                       |
| 문서화    | README만 존재                         | AI 코딩 도구(Claude Code)가 프로젝트를 이해할 컨텍스트 부족 |
| 스펙 관리 | 없음                                  | 요구사항 추적 및 변경 관리 체계 부재                        |

바이브 코딩 워크샵에서 참가자가 **Claude Code CLI로 새 기능을 개발하고, PR → CI 통과 플로우를 체험**하려면, 이 품질 인프라가 사전에 갖춰져야 한다.

## 개요

### 목표

워크샵 참가자가 Claude Code를 사용하여 독립적으로 기능 개발 → 테스트 → PR → CI 통과를 경험할 수 있는 환경을 구축한다.

### 작업 범위

총 5개 작업 영역으로 구성되며, 3개의 OpenSpec 스펙으로 관리된다.

| #   | 작업                   | OpenSpec 스펙           | 산출물                                                            |
| --- | ---------------------- | ----------------------- | ----------------------------------------------------------------- |
| W1  | 프로젝트 문서화        | `project-documentation` | `CLAUDE.md`, `docs/`                                              |
| W2  | 단위 테스트 추가       | `unit-testing`          | `user.service.spec.ts`, `article-api-handlers.controller.spec.ts` |
| W3  | 커버리지 임계치 설정   | `unit-testing`          | `jest.config.js` × 2                                              |
| W4  | CI 파이프라인 구축     | `ci-pipeline`           | `.github/workflows/ci.yml`                                        |
| W5  | OpenSpec 프로젝트 설정 | —                       | `openspec/config.yaml`, specs, archives                           |

### 전환 후 상태

```
[참가자] → feature 브랜치 생성
        → Claude Code로 코드 작성
        → npx nx affected:test (로컬 검증)
        → git push → PR 생성
        → GitHub Actions CI 자동 실행 (lint → test → build)
        → CI 통과 → 머지 가능
```

## 작업별 상세 및 인수조건

### W1. 프로젝트 문서화

**스펙:** `project-documentation`

**인수조건:**

- [x] `CLAUDE.md`가 프로젝트 루트에 존재
- [x] Fat Controller / Thin Service 아키텍처 패턴이 문서화됨
- [x] 서브, 테스트, 린트, 빌드 명령어가 정확한 구문으로 기재됨
- [x] Service 테스트 패턴 (mock Repository 주입) 예제 포함
- [x] Controller 테스트 패턴 (mock Services, no TestingModule) 예제 포함
- [x] `docs/` 폴더에 상세 문서 5종 생성 (architecture, ci-pipeline, testing-guide, api-routes, contributing)
- [x] PR 기여 워크플로우가 순차적 단계로 기술됨 (`docs/contributing.md`)

### W2. 단위 테스트 추가

**스펙:** `unit-testing`

**인수조건:**

- [x] `UserService` 테스트 15개 케이스 통과 (`libs/user/api/shared/src/lib/user.service.spec.ts`)
  - login: 성공, 미존재 이메일(NotFoundException), 잘못된 비밀번호(BadRequestException)
  - register: 성공(해싱+JWT), 중복(BadRequestException)
  - updateUserInfo: 비밀번호 변경 포함/미포함, 미존재 사용자
  - getProfile: 팔로잉 중/아님/미인증
  - getJwtInfo: 유효한 헤더/헤더 없음/잘못된 형식/headers 객체 없음
- [x] `ArticleApiHandlersController` 테스트 16개 케이스 통과 (`libs/article/api/handlers/src/lib/article-api-handlers.controller.spec.ts`)
  - CRUD: 생성(slug+태그), 수정, 삭제(본인/타인/미존재), 조회(존재/미존재)
  - Favorite: 추가(멱등성), 해제
  - Comment: 작성, 삭제(본인/타인/미존재)
  - Tag: 목록 조회
- [x] 모든 테스트가 DB 없이 mock 기반으로 실행 가능
- [x] `@nestjs/typeorm` mock이 각 테스트 파일 상단에 포함 (Node 23 호환)

### W3. 커버리지 임계치 설정

**스펙:** `unit-testing`

**인수조건:**

- [x] `user-api-shared`의 `jest.config.js`에 50% 임계치 설정 (branches, lines, functions, statements)
- [x] `article-api-handlers`의 `jest.config.js`에 50% 임계치 설정 (branches, lines, functions, statements)
- [x] `--coverage` 플래그로 테스트 실행 시 임계치 미달 시 빌드 실패

### W4. CI 파이프라인 구축

**스펙:** `ci-pipeline`

**인수조건:**

- [x] `.github/workflows/ci.yml` 파일 존재
- [x] PR → `master`에서만 트리거 (직접 push 시 트리거 안 됨)
- [x] Node.js 18 LTS 사용 (`bcrypt@5.0.1` 호환)
- [x] `npm ci`로 결정적 설치
- [x] `fetch-depth: 0`으로 전체 git 히스토리 체크아웃
- [x] lint → test → build 순차 실행 (NX affected 기반)
- [x] 어떤 단계든 실패 시 이후 단계 중단
- [x] DB 서비스 컨테이너 불필요 (mock 기반 테스트)
- [x] 동일 PR 연속 push 시 이전 실행 자동 취소 (`cancel-in-progress`)

### W5. OpenSpec 프로젝트 설정

**인수조건:**

- [x] `openspec/config.yaml`에 프로젝트 컨텍스트 (tech stack, 아키텍처, 컨벤션) 기술
- [x] 3개 스펙 등록 및 validation 통과 (`ci-pipeline`, `project-documentation`, `unit-testing`)
- [x] `vibe-coding-workshop-setup` change 아카이브 완료
- [x] `project-documentation` change 아카이브 완료

## 의존 관계

```
W1 프로젝트 문서화
 │
 ├──→ W2 단위 테스트 추가 (CLAUDE.md의 테스트 패턴 문서를 참조하여 작성)
 │     │
 │     └──→ W3 커버리지 임계치 설정 (테스트가 존재해야 임계치 의미 있음)
 │           │
 │           └──→ W4 CI 파이프라인 (테스트+커버리지가 갖춰져야 CI에서 검증 가능)
 │
 └──→ W5 OpenSpec 설정 (프로젝트 컨텍스트 이해가 선행되어야 config 작성 가능)
```

**핵심 의존 경로:** W1 → W2 → W3 → W4

| 선행 작업   | 후행 작업   | 의존 이유                                                                      |
| ----------- | ----------- | ------------------------------------------------------------------------------ |
| W1 문서화   | W2 테스트   | 테스트 패턴(Service vs Controller)을 문서에서 정의 → 이를 기반으로 테스트 작성 |
| W2 테스트   | W3 커버리지 | 테스트가 없으면 커버리지 임계치 설정이 무의미                                  |
| W3 커버리지 | W4 CI       | CI에서 `--coverage`로 테스트 실행하므로 임계치가 먼저 설정되어야 함            |
| W1 문서화   | W5 OpenSpec | 프로젝트 아키텍처 이해 → config.yaml 컨텍스트 작성                             |

**독립 작업:** W5는 W4와 독립적으로 진행 가능 (W1만 선행하면 됨)

## 현재 상태

**모든 작업 완료.** 2026-03-11 기준 전체 인수조건이 충족되었으며, OpenSpec change가 아카이브되었다.

| 작업               | 상태 | 검증                                          |
| ------------------ | ---- | --------------------------------------------- |
| W1 프로젝트 문서화 | 완료 | CLAUDE.md + docs/ 5종 존재                    |
| W2 단위 테스트     | 완료 | 15 + 16 = 31개 테스트 전체 통과               |
| W3 커버리지 임계치 | 완료 | 두 프로젝트 jest.config.js 설정 확인          |
| W4 CI 파이프라인   | 완료 | ci.yml 스펙 대조 검증 완료                    |
| W5 OpenSpec 설정   | 완료 | 3개 스펙 validation 통과, 2개 change 아카이브 |
