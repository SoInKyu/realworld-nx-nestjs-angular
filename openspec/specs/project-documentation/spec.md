# project-documentation Specification

## Purpose
TBD - created by archiving change vibe-coding-workshop-setup. Update Purpose after archive.
## Requirements
### Requirement: CLAUDE.md provides project context for AI coding assistants
The project SHALL have a `CLAUDE.md` file at the repository root that provides Claude Code CLI with sufficient context to understand and modify the codebase.

#### Scenario: Claude Code reads project context
- **WHEN** Claude Code CLI is invoked in this repository
- **THEN** it SHALL read `CLAUDE.md` and understand the project structure, tech stack, and conventions

#### Scenario: CLAUDE.md documents architecture pattern
- **WHEN** a developer or AI reads CLAUDE.md
- **THEN** it SHALL describe the "Fat Controller / Thin Service" pattern and explain that business logic resides in controllers, not services

#### Scenario: CLAUDE.md includes development commands
- **WHEN** a developer needs to serve, test, lint, or build the project
- **THEN** CLAUDE.md SHALL list all common commands with their exact syntax

### Requirement: CLAUDE.md documents testing patterns
The documentation SHALL include two distinct test patterns used in this codebase.

#### Scenario: Service test pattern documentation
- **WHEN** a developer needs to write a test for a service with business logic (e.g., UserService)
- **THEN** CLAUDE.md SHALL show how to mock Repository, JwtService, and other dependencies using plain object mocks

#### Scenario: Controller test pattern documentation
- **WHEN** a developer needs to write a test for a controller (e.g., ArticleApiHandlersController)
- **THEN** CLAUDE.md SHALL show how to instantiate the controller with mock services (no TestingModule) and how to construct the `req` mock object with `user.sub` and `headers.authorization`

### Requirement: CLAUDE.md includes PR contribution guide
The documentation SHALL guide workshop participants through the PR workflow.

#### Scenario: PR workflow steps
- **WHEN** a participant wants to contribute a new feature
- **THEN** CLAUDE.md SHALL describe: branch creation, making changes, running tests, running lint, committing, pushing, and opening a PR to master

#### Scenario: CI integration awareness
- **WHEN** a participant opens a PR
- **THEN** CLAUDE.md SHALL explain that GitHub Actions CI will automatically run lint, test, and build checks

