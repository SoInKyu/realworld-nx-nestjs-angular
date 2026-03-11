# Claude Code Skills Guide

이 프로젝트에서 사용 가능한 Claude Code 스킬과 슬래시 커맨드를 설명합니다.

## 슬래시 커맨드

Claude Code CLI에서 `/`로 시작하여 실행하는 커맨드입니다.

### `/feature <설명>`

기존 기능을 확장할 때 사용합니다. Fat Controller / Thin Service 패턴에 맞춰 개발 워크플로우를 안내합니다.

**사용 예시:**

```
/feature Article에 viewCount 필드 추가
/feature 기사 목록에 태그 필터링 추가
/feature User에 bio 최대 길이 검증 추가
```

**워크플로우:** 도메인 식별 → 엔티티 수정 → DTO 업데이트 → 컨트롤러 로직 추가 → 테스트 작성 → 검증

**참조 문서:** `docs/architecture.md`, `docs/testing-guide.md`, `docs/api-routes.md`

---

### `/pr [설명]`

현재 변경사항에 대해 PR 워크플로우를 전체 자동화합니다.

**사용 예시:**

```
/pr
/pr viewCount 기능 추가 PR
```

**워크플로우:** 브랜치 생성 → 스테이징 → 테스트 → 린트 → 커밋 → 푸시 → PR 생성 → CI 확인

**참조 문서:** `docs/contributing.md`, `docs/ci-pipeline.md`

---

### `/opsx [서브커맨드]`

OpenSpec CLI를 실행합니다. 스펙 기반 개발 관리에 사용합니다.

**사용 예시:**

```
/opsx                    # 변경사항 목록
/opsx show <name>        # 변경사항 상세
/opsx new my-feature     # 새 변경 제안
/opsx validate --all     # 전체 검증
```

## 스킬 (자동 로드)

`.agent/skills/`에 위치하며, 사용자의 질문이 트리거 조건에 맞으면 자동으로 로드됩니다.

### feature-dev

| 항목   | 내용                                                                        |
| ------ | --------------------------------------------------------------------------- |
| 위치   | `.agent/skills/feature-dev/SKILL.md`                                        |
| 트리거 | "add a field", "extend an endpoint", "add filtering", "modify an entity" 등 |
| 용도   | 기존 백엔드 기능 확장 시 아키텍처 패턴과 워크플로우 안내                    |

**핵심 내용:**

- Fat Controller / Thin Service 패턴 규칙
- 엔티티 → DTO → 컨트롤러 수정 순서
- 테스트 대상 선택 기준 (Service vs Controller)
- 상세 참조: `docs/architecture.md`, `docs/testing-guide.md`, `docs/api-routes.md`

### pr-workflow

| 항목   | 내용                                                         |
| ------ | ------------------------------------------------------------ |
| 위치   | `.agent/skills/pr-workflow/SKILL.md`                         |
| 트리거 | "create a PR", "open a pull request", "submit my changes" 등 |
| 용도   | 브랜치 생성부터 CI 검증까지 전체 PR 플로우 자동화            |

**핵심 내용:**

- 8단계 자동화 워크플로우 (branch → stage → test → lint → commit → push → PR → CI)
- 실패 시 중단 후 보고
- 상세 참조: `docs/contributing.md`, `docs/ci-pipeline.md`

### OpenSpec 스킬 (4종)

| 스킬                    | 위치                                     | 용도                     |
| ----------------------- | ---------------------------------------- | ------------------------ |
| openspec-propose        | `.agent/skills/openspec-propose/`        | 새 변경 제안 작성        |
| openspec-explore        | `.agent/skills/openspec-explore/`        | 스펙 탐색 및 분석        |
| openspec-apply-change   | `.agent/skills/openspec-apply-change/`   | 변경사항 적용            |
| openspec-archive-change | `.agent/skills/openspec-archive-change/` | 완료된 변경사항 아카이브 |

## 설계 원칙

### Progressive Disclosure (점진적 공개)

스킬은 3단계로 컨텍스트를 관리합니다:

```
1단계: 메타데이터 (name + description) → 항상 로드 (~100 단어)
2단계: SKILL.md 본문            → 트리거 시 로드 (~300 단어)
3단계: docs/ 참조 문서           → 필요 시 로드 (무제한)
```

### 문서 중복 방지

SKILL.md에는 **핵심 지시사항만** 포함하고, 상세 내용은 기존 `docs/` 문서를 링크합니다:

| SKILL.md (핵심)    | docs/ (상세)                         |
| ------------------ | ------------------------------------ |
| 패턴 규칙 3줄 요약 | `architecture.md` 전체 아키텍처      |
| 테스트 대상 판별표 | `testing-guide.md` 31개 케이스 목록  |
| PR 8단계 명령어    | `contributing.md` + `ci-pipeline.md` |

### 문서 구조 전체 맵

```
docs/
  architecture.md          ← 아키텍처, 엔티티 모델, 인증, DB
  api-routes.md            ← API 엔드포인트, 응답 형식, 에러 코드
  testing-guide.md         ← 테스트 패턴, mock 예제, 31개 케이스
  ci-pipeline.md           ← CI 트리거, 파이프라인 단계, 환경 설정
  contributing.md          ← PR 워크플로우, 코딩 컨벤션
  vibe-coding-transition-plan.md  ← 전환 계획, 인수조건, 의존 관계
  skills-guide.md          ← 이 문서 (스킬 설명)

.agent/skills/
  feature-dev/SKILL.md     → docs/architecture.md, testing-guide.md, api-routes.md 참조
  pr-workflow/SKILL.md     → docs/contributing.md, ci-pipeline.md 참조
  openspec-*/SKILL.md      → OpenSpec CLI 워크플로우

.claude/commands/
  feature.md               → /feature 슬래시 커맨드 (feature-dev 스킬 연동)
  pr.md                    → /pr 슬래시 커맨드 (pr-workflow 스킬 연동)
  opsx.md                  → /opsx 슬래시 커맨드
```
