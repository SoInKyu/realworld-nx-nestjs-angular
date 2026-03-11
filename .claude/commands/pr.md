Execute the full PR workflow for current changes. Automate all steps end-to-end:

1. Create feature branch (if on master): git checkout -b feature/<descriptive-name>
2. Stage changed files (exclude .agent/, .claude/, .omc/, .env)
3. Run affected tests: npx nx affected:test --base=origin/master
4. Run affected lint: npx nx affected:lint --base=origin/master
5. Commit with descriptive message (include Co-Authored-By)
6. Push: git push -u origin <branch>
7. Create PR via gh cli with summary + test plan
8. Watch CI: gh pr checks <number> --watch

Stop and fix if any step fails. Report final PR URL when complete.

Use the pr-workflow skill from .agent/skills/pr-workflow/ for conventions reference.

Additional context: $ARGUMENTS
