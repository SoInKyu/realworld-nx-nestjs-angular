---
name: github-issue
description: This skill should be used when the user asks to "create an issue", "register a bug", "report a problem", "add a GitHub issue", "이슈 등록", "이슈 만들어", "버그 등록", or needs to create structured GitHub issues with labels and categorization.
version: 0.1.0
---

# GitHub Issue Management

Create and manage structured GitHub issues with consistent format and labels.

## Label System

### Priority Labels

- `priority:critical` — 즉시 해결 필요 (보안 취약점, 데이터 손실)
- `priority:high` — 빠른 시일 내 해결 (코드 품질, 주요 버그)
- `priority:medium` — 가능할 때 해결 (개선사항, 리팩터링)
- `priority:low` — 여유 있을 때 (Nice-to-have)

### Category Labels

- `security` — 보안 취약점
- `performance` — 성능 개선
- `code-quality` — 코드 품질
- `testing` — 테스트 커버리지
- `dx` — 개발자 경험

## Issue Body Template

모든 이슈는 다음 구조를 따른다:

```
## 문제
[구체적인 문제 설명, 코드 위치 포함]

## 영향
[이 문제가 미치는 영향]

## 해결 방안
[구체적인 해결 단계]

## 예상 소요
[시간 추정]
```

## Workflow

### 1. Label 확인

기존 라벨이 없으면 생성:

```bash
gh label create "<name>" --color "<hex>" --description "<desc>" --force
```

### 2. Issue 생성

```bash
gh issue create --title "<type>: <description>" --label "<labels>" --body "$(cat <<'EOF'
## 문제
...
## 영향
...
## 해결 방안
...
## 예상 소요
...
EOF
)"
```

### 3. Title Convention

- `fix:` — 버그 수정
- `feat:` — 새 기능
- `perf:` — 성능 개선
- `refactor:` — 리팩터링
- `test:` — 테스트
- `chore:` — 유지보수
- `docs:` — 문서

## Reference Documents

- **`docs/contributing.md`** — PR workflow, coding conventions
- **`docs/architecture.md`** — Domain structure for issue context
