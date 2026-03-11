# 바이브 코딩 마이그레이션 매뉴얼

> 레거시 프로젝트를 AI 기반 바이브 코딩 워크플로우로 전환하기 위한 단계별 가이드

## 목차

1. [개요](#개요)
2. [사전 준비](#사전-준비)
3. [Phase 1: 프로젝트 분석 및 문서화](#phase-1-프로젝트-분석-및-문서화)
4. [Phase 2: 테스트 인프라 구축](#phase-2-테스트-인프라-구축)
5. [Phase 3: CI/CD 파이프라인](#phase-3-cicd-파이프라인)
6. [Phase 4: 이슈 관리 체계](#phase-4-이슈-관리-체계)
7. [Phase 5: 보안 및 성능 개선](#phase-5-보안-및-성능-개선)
8. [트러블슈팅](#트러블슈팅)
9. [부록: 프롬프트 레퍼런스](#부록-프롬프트-레퍼런스)

---

## 개요

### 바이브 코딩이란?

AI 코딩 에이전트(Claude Code 등)와 자연어 대화를 통해 소프트웨어를 개발하는 워크플로우입니다. AI가 코드 작성, 테스트, 리팩토링, 이슈 관리까지 수행하며, 개발자는 방향 설정과 리뷰에 집중합니다.

### 이 매뉴얼의 목적

기존 프로젝트에 바이브 코딩을 적용하기 위한 **인프라 준비 과정**을 안내합니다. 실제 NX 모노레포 프로젝트(NestJS + Angular)에서 수행한 작업을 기반으로, 프롬프트와 결과를 정리했습니다.

### 예상 소요 시간

| Phase   | 작업                    | 예상 시간 |
| ------- | ----------------------- | --------- |
| Phase 1 | 프로젝트 분석 및 문서화 | 30분      |
| Phase 2 | 테스트 인프라 구축      | 1시간     |
| Phase 3 | CI/CD 파이프라인        | 30분      |
| Phase 4 | 이슈 관리 체계          | 20분      |
| Phase 5 | 보안 및 성능 개선       | 1시간     |

---

## 사전 준비

### 필수 도구

- **Claude Code** CLI 설치 (`npm install -g @anthropic-ai/claude-code`)
- **Node.js** 18+
- **Git** + GitHub 계정
- **GitHub CLI** (`gh`) 설치 및 인증

### 권장 플러그인

```bash
# oh-my-claudecode: 심층 인터뷰, 코드 리뷰 등 확장 기능
# superpowers: 계획 수립, 서브에이전트 기반 개발
# openspec: 스펙 기반 문서 관리
```

### 프로젝트 요건

- Git 저장소가 초기화되어 있을 것
- 빌드 가능한 상태일 것 (빌드가 안 되면 먼저 수정)
- GitHub 원격 저장소가 연결되어 있을 것

---

## Phase 1: 프로젝트 분석 및 문서화

AI가 프로젝트를 이해할 수 있도록 컨텍스트 문서를 생성하는 단계입니다.

### Step 1: 심층 인터뷰로 프로젝트 분석

**Prompt:**

> 이 프로젝트를 바이브 코딩을 위한 프로젝트로 전환하려 해. 문서화 및 테스트 CI/CD까지 진행할꺼야. 이를 위한 심층인터뷰를 진행해줘.

**결과:**

- Claude가 프로젝트 구조, 기술 스택, 아키텍처 패턴을 파악
- 질문-답변을 통해 프로젝트 목표와 범위를 명확화
- 전환 계획의 기초 자료 수집

**Tip:** 심층 인터뷰는 `oh-my-claudecode` 플러그인의 기능입니다. 질문에 구체적으로 답변할수록 이후 작업의 품질이 높아집니다.

### Step 2: CLAUDE.md 생성

**Prompt:**

> /init

**결과:**

- `CLAUDE.md` 파일 자동 생성
- 빌드/테스트/린트 명령어, 아키텍처 개요, 코딩 컨벤션 문서화
- 이후 모든 Claude Code 세션에서 이 파일을 자동으로 참조

**핵심 포인트:**

```markdown
# CLAUDE.md에 포함되어야 하는 핵심 정보:

- 프로젝트 개요 및 기술 스택
- 빌드, 테스트, 린트 명령어
- 아키텍처 패턴 (예: Fat Controller / Thin Service)
- 테스트 패턴 (mock 방법, Node 호환성 이슈 등)
- API 라우트 구조
```

**Tip:** `/init` 이후 CLAUDE.md를 직접 리뷰하고, 프로젝트 특수성(예: 특이한 아키텍처 패턴)을 보강하세요.

### Step 3: OpenSpec으로 문서 관리

**Prompt:**

> openspec을 사용해서 이 프로젝트의 문서화 해줘.

**결과:**

- `openspec/` 디렉토리에 스펙 문서 생성
- 변경 사항(changes)을 추적 가능한 형태로 관리
- 이후 각 작업의 진행 상태를 openspec으로 관리

**Tip:** OpenSpec은 변경 계획을 문서화하고 추적하는 도구입니다. `npx openspec list`로 현재 상태를 확인할 수 있습니다.

### Step 4: 전환 계획 문서 및 이슈 등록

**Prompt 1:**

> @docs/vibe-coding-transition-plan.md를 만들어줘.
> 해당 문서를 통해 작업 배경, 개요, 인수조건이 들어가야 하고, 다른 작업과 의존 관계가 있을 경우 의존 관계도 기술되어 있어야 해

**Prompt 2:**

> @docs/vibe-coding-transition-plan.md를 gh issue로 등록해줘. 이슈에는 작업 배경, 개요, 인수조건이 들어가야 하고, 다른 작업과 의존 관계가 있을 경우 의존 관계도 기술해줘.

**결과:**

- `docs/vibe-coding-transition-plan.md` 생성
- GitHub에 Epic 이슈 등록 (작업 배경, 인수조건, 의존 관계 포함)

---

## Phase 2: 테스트 인프라 구축

AI가 안전하게 코드를 수정할 수 있는 안전망을 구축합니다.

### Step 1: 테스트 구현 요청

**Prompt:**

> 이 프로젝트에 테스트를 추가하고 싶어. ut, it, e2e, lint까지 테스트를 구현해줘. 추가적으로 맥락을 요청하려면 심층 인터뷰를 진행해.

**결과 (실제 프로젝트 기준):**

- **Unit Tests**: UserService (15개), ArticleController (16개)
- **Integration Tests**: Angular 컴포넌트 (8개)
- **E2E Tests**: supertest 기반 API 시나리오 (10개)
- **총 77개 테스트**, 13개 Test Suite

**생성된 테스트 파일:**

```
libs/user/api/shared/src/lib/user.service.spec.ts          # 15 tests
libs/article/api/handlers/src/lib/article-api-handlers.controller.spec.ts  # 16 tests
libs/article/feature/src/lib/home/home.component.spec.ts    # 2 tests
libs/article/feature/src/lib/editor/editor.component.spec.ts # 1 test
apps/api/src/app/api-e2e.spec.ts                            # 10 tests
... (기타 기존 테스트 포함)
```

**Tip:** "심층 인터뷰를 진행해"를 추가하면 Claude가 테스트 전략을 결정하기 전에 프로젝트 구조를 파악합니다.

### Step 2: 커버리지 확인

**Prompt:**

> 테스트 커버리지 알려줘

**결과:**

- 프로젝트별 커버리지 리포트 출력
- 부족한 영역 식별 및 개선 방향 제시

### Step 3: 병렬 실행 규칙 추가

**Prompt:**

> 규칙에 병렬로 가능한 작업은 병렬로 수행하도록 적어줘.

**결과:**

- CLAUDE.md에 `## Work Rules` 섹션 추가
- 독립적인 작업의 병렬 실행 규칙 명시
- 이후 Claude가 자동으로 병렬 실행 적용

---

## Phase 3: CI/CD 파이프라인

코드 품질을 자동으로 검증하는 체계를 구축합니다.

### Step 1: Git Hook 설정 (심층 인터뷰)

**Prompt:**

> git hook 기반 상시 검증 체계를 설정하기 위한 최적의 방안을 찾고있어. 심층 인터뷰 진행해줘.

**인터뷰 답변 예시:**

- 훅 타이밍: pre-commit
- 범위: 변경된 파일만
- 도구: Husky v9
- 실패 시: push 차단
- 검증 항목: Prettier (자동 수정 + re-stage)

**결과:**

- `.husky/pre-commit` 스크립트 생성
- 커밋 시 자동으로 Prettier 포매팅 + re-stage

**주의사항:**

```bash
# 한국어/특수문자 경로에서 lint-staged v16은 오류 발생
# → 커스텀 pre-commit 스크립트로 대체
# git diff --cached --name-only로 상대 경로 사용
```

### Step 2: 구현 시작

**Prompt:**

> 시작해줘

**결과:**

- Husky v9 + 커스텀 pre-commit 훅 설치
- `package.json`에 `husky`, `lint-staged` devDependency 추가
- `.husky/pre-commit` 스크립트 생성

### Step 3: GitHub Actions CI 설정 및 검증

**Prompt:**

> github에서 어떻게 돌아가는지 확인하려면 어떻게 확인할 수 있어?

**답변:** "방법 1" (테스트 PR을 만들어 CI 동작 확인)

**결과:**

- `.github/workflows/ci.yml` 생성 (lint → test → build)
- 테스트 PR 생성 → CI 통과 확인

### Step 4: PR 머지 및 paths-ignore

**Prompt:**

> PR 머지해줘. 그리고 문서와 같은 테스트와 직접 상관없는 파일이 변경될 경우 검증을 바이패스 하도록 해줘.

**결과:**

- PR 머지
- CI에 `paths-ignore` 추가:

```yaml
paths-ignore:
  - '*.md'
  - 'docs/**'
  - '.agent/**'
  - '.claude/**'
  - 'openspec/**'
  - 'LICENSE'
  - '.gitignore'
```

### Step 5: Claude Hook 설정

**Prompt:**

> claude hook을 사용해서 prompt 실행후에 readme를 최신 상태로 유지하도록 설정해줘.

**결과:**

- `.claude/settings.json`에 Stop hook 추가
- 소스 파일 변경 시 README 업데이트 리마인더 자동 표시

---

## Phase 4: 이슈 관리 체계

AI가 이슈를 발견하고, 등록하고, 해결하는 체계를 구축합니다.

### Step 1: 프로젝트 분석 및 이슈 등록

**Prompt:**

> 발견된 이슈들을 깃헙 이슈에 등록해줘. 앞서서 이슈 등록에 사용한 프롬프트로 기헙 이슈 관리 스킬을 만들어줘. 사용한 프롬프트는 ~/.claude/projects/\<프로젝트이름\> 에서 찾을 수 있어

**결과:**

- 10개 GitHub 이슈 등록 (#5~#14)
- 라벨 체계: `priority:critical`, `priority:high`, `priority:medium`, `security`, `performance`
- `.agent/skills/github-issue/SKILL.md` 스킬 생성
- `.claude/commands/issue.md` 슬래시 커맨드 생성

**등록된 이슈 예시:**
| # | 제목 | 우선순위 |
|---|------|---------|
| #5 | fix: JWT 시크릿 하드코딩 | Critical |
| #6 | perf: N+1 쿼리 문제 | Critical |
| #7 | fix: 입력 검증 추가 | Critical |
| #8~#14 | 기타 개선 사항 | High/Medium |

---

## Phase 5: 보안 및 성능 개선

발견된 Critical 이슈를 병렬로 해결합니다.

### Step 1: 병렬 구현

**Prompt:**

> Critical 이슈에대해 작업 계획을 세우고 병렬로 작업을 진행해. 작업관련 문서들은 openspec을 사용해서 관리해

**결과 (3개 에이전트 병렬 실행):**

| Agent   | Issue         | 수정 내용                                          |
| ------- | ------------- | -------------------------------------------------- |
| Agent 1 | #5 JWT 시크릿 | `process.env.JWT_SECRET` 전환, `.env.example` 생성 |
| Agent 2 | #6 N+1 쿼리   | 배치 쿼리 메서드 추가 (60+ → 3 쿼리)               |
| Agent 3 | #7 입력 검증  | ValidationPipe 강화, CORS 설정, DTO `@IsOptional`  |

### Step 2: 인수조건 검증

**Prompt:**

> 인수조건도 만족했는지 확인해.

**결과:**

- 각 이슈별 인수조건 항목을 코드에서 직접 검증
- grep/파일 확인으로 증거 기반 검증

### Step 3: GitHub 이슈 상태 관리

**Prompt:**

> github 이슈에서 하나도 처리 안된것으로 나오는데? 상태 변경도 안되었고, 코멘트로 생성 안되었어.

**교훈:** AI가 코드를 수정해도 GitHub 이슈 상태 업데이트를 잊을 수 있습니다. 명시적으로 요청해야 합니다.

**결과:**

- 3개 이슈에 해결 코멘트 추가 (변경 내용, 커밋 해시, 검증 결과)
- 이슈 Close 처리

### Step 4: 커밋 및 푸시

**Prompt:**

> 변경사항 커밋 푸시해줘

**결과:**

- 이슈별 개별 커밋 (3개 + docs 1개)
- master에 푸시

---

## 트러블슈팅

### 1. Angular `providedIn: 'root'` 서비스 테스트 실패

**증상:** `Failed to load app configs` 에러
**원인:** `IConfigurationService`가 `providedIn: 'root'`로 선언되어 TestBed에서 실제 서비스 로드 시도
**해결:** TestBed providers에 명시적 mock 추가

```typescript
providers: [{ provide: IConfigurationService, useValue: mockConfigService }];
```

### 2. lint-staged v16 한국어 경로 오류

**증상:** `'파일경로' is outside repository`
**원인:** lint-staged가 절대 경로를 `git add`에 전달, 한국어 포함 경로에서 실패
**해결:** `.husky/pre-commit`에 커스텀 스크립트 작성 (상대 경로 사용)

### 3. CI `npm ci` ERESOLVE 오류

**증상:** Angular peer dependency 충돌
**원인:** `@angular/localize@11.2.7`이 `@angular/compiler@11.2.7` 요구하나 `11.2.6` 설치됨
**해결:** `npm ci --legacy-peer-deps` 플래그 추가

### 4. Node 23 + NestJS v7 호환성

**증상:** `util.isNullOrUndefined is not a function`
**원인:** `@nestjs/typeorm@7`이 Node 23에서 제거된 `util.isNullOrUndefined` 사용
**해결:** 테스트 파일 최상단에 mock 추가

```typescript
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
  TypeOrmModule: { forFeature: () => ({ module: class {} }) },
}));
```

### 5. E2E 테스트에서 QueryBuilder mock 누락

**증상:** `GET /api/articles` 500 에러
**원인:** N+1 쿼리 수정 후 `favoriteService.repository.createQueryBuilder` 체이닝 미지원
**해결:** mock에 체이닝 가능한 QueryBuilder 추가

```typescript
const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  getRawMany: jest.fn().mockResolvedValue([]),
};
```

---

## 부록: 프롬프트 레퍼런스

### 효과적인 프롬프트 패턴

#### 1. 심층 인터뷰 패턴

```
[작업 목표]를 위한 최적의 방안을 찾고있어. 심층 인터뷰 진행해줘.
```

- Claude가 질문을 통해 요구사항을 정밀하게 파악
- 답변이 구체적일수록 결과 품질 향상

#### 2. 복합 작업 패턴

```
[작업 A]해줘. [작업 B]도 해줘. [작업 C]도 해줘.
```

- 여러 작업을 한 프롬프트에 나열
- Claude가 독립적인 작업은 병렬로 처리

#### 3. 병렬 실행 패턴

```
Critical 이슈에대해 작업 계획을 세우고 병렬로 작업을 진행해.
```

- "병렬로"를 명시하면 독립 작업을 서브에이전트로 분산

#### 4. 문서 연계 패턴

```
@docs/파일명.md를 만들어줘.
@docs/파일명.md를 gh issue로 등록해줘.
```

- `@파일명` 으로 문서를 참조하여 연계 작업 수행

#### 5. 검증 요청 패턴

```
인수조건도 만족했는지 확인해.
```

- 작업 완료 후 반드시 검증 요청
- Claude가 코드에서 직접 증거를 수집하여 검증

#### 6. 상태 관리 리마인더 패턴

```
github 이슈에서 하나도 처리 안된것으로 나오는데?
```

- AI가 코드 작업에 집중하면 외부 상태(이슈, PR) 관리를 놓칠 수 있음
- 명시적으로 상태 업데이트 요청

### 전체 프롬프트 목록

상세한 프롬프트 카탈로그는 `.agent/skills/vibe-coding-tutorial/references/prompt-catalog.md`를 참조하세요.

---

## 체크리스트

마이그레이션 완료 시 다음 항목이 충족되어야 합니다:

- [ ] `CLAUDE.md` 생성 (프로젝트 구조, 명령어, 패턴 문서화)
- [ ] 테스트 인프라 (UT + IT + E2E, 최소 50개 이상 테스트)
- [ ] CI/CD 파이프라인 (GitHub Actions: lint → test → build)
- [ ] Git Hook (pre-commit: Prettier 자동 포매팅)
- [ ] 이슈 관리 (GitHub Issues: 라벨 체계, Critical/High/Medium)
- [ ] 보안 점검 (하드코딩된 시크릿 제거, 입력 검증, CORS 설정)
- [ ] 문서화 (OpenSpec 변경 추적, transition plan)
- [ ] Claude 스킬 (프로젝트 맞춤 스킬 생성)
