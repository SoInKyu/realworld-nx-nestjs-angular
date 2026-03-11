---
name: pr-workflow
description: This skill should be used when the user asks to "create a PR", "open a pull request", "submit my changes", "push and create PR", "prepare for review", or needs to execute the full PR workflow from branch creation through CI verification in this RealWorld NX monorepo.
version: 0.1.0
---

# PR Workflow Automation

Execute the complete PR workflow end-to-end. Halt and report if any step fails.

## Steps

### 1. Branch

```bash
git checkout -b feature/<descriptive-name>   # skip if already on feature branch
```

### 2. Stage

Stage modified files. **Exclude**: `.agent/`, `.claude/`, `.omc/`, `.env`, credentials.

### 3. Test

```bash
npx nx affected:test --base=origin/master
```

### 4. Lint

```bash
npx nx affected:lint --base=origin/master
```

### 5. Commit

```bash
git commit -m "$(cat <<'EOF'
<type>: <description>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

### 6. Push

```bash
git push -u origin <branch-name>
```

### 7. Create PR

```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
<bullet points>

## Test plan
- [ ] Tests pass (`npx nx affected:test`)
- [ ] Lint passes (`npx nx affected:lint`)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### 8. Verify CI

```bash
gh pr checks <number> --watch
```

If CI fails: check logs → fix → commit → push.

## Reference Documents

For project conventions and CI details, read these project docs:

- **`docs/contributing.md`** — PR workflow steps, coding conventions, new feature checklist
- **`docs/ci-pipeline.md`** — CI trigger conditions, pipeline stages, environment setup, concurrency control
