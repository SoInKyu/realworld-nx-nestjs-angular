---
name: vibe-coding-tutorial
description: This skill should be used when the user asks to "create a vibe coding tutorial", "update the migration manual", "generate workshop guide", "add tutorial section", or mentions "바이브코딩 매뉴얼" or "튜토리얼". Manages the vibe coding migration manual document.
version: 0.1.0
---

# Vibe Coding Tutorial Management

Generate and maintain the vibe coding migration manual (`docs/vibe-coding-migration-manual.md`) that guides teams through converting legacy projects for AI-assisted development.

## Document Structure

The manual follows this structure:

1. **개요** - Purpose, prerequisites, expected outcomes
2. **Phase 1: 프로젝트 분석 및 문서화** - CLAUDE.md, OpenSpec setup
3. **Phase 2: 테스트 인프라 구축** - Unit/Integration/E2E tests, coverage
4. **Phase 3: CI/CD 파이프라인** - GitHub Actions, git hooks, pre-commit
5. **Phase 4: 이슈 관리 체계** - GitHub issues, labels, skills
6. **Phase 5: 보안 및 성능 개선** - Critical fixes, parallel execution
7. **부록** - Prompt reference, troubleshooting

## Content Guidelines

### Prompt Documentation Pattern

Each phase includes actual prompts used and their outcomes:

```markdown
### Step N: [작업명]

**Prompt:**

> [실제 사용된 프롬프트]

**Result:**

- [변경된 파일 목록]
- [핵심 결과 요약]

**Tip:** [주의사항이나 팁]
```

### Key Principles

- Write in Korean for the target audience
- Include actual prompts verbatim from session logs
- Summarize results concisely — focus on what changed and why
- Include troubleshooting tips for common issues encountered
- Reference file paths relative to project root
- Mark interactive prompts (requiring user input) with appropriate guidance

## Workflow

### Creating the Manual

1. Read session logs from `~/.claude/projects/<project-name>/`
2. Extract user prompts (type: "user", userType: "external")
3. Map prompts to phases chronologically
4. For each prompt, document: the prompt, files changed, result summary
5. Add troubleshooting from actual errors encountered
6. Write to `docs/vibe-coding-migration-manual.md`

### Updating the Manual

1. Read the existing manual
2. Identify which phase/step needs update
3. Add new content preserving existing structure
4. Update the table of contents if sections were added

## Reference Files

- **`references/prompt-catalog.md`** - Complete catalog of prompts organized by phase
