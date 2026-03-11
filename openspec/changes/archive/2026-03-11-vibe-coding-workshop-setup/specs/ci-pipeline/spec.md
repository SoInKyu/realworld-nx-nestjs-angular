## ADDED Requirements

### Requirement: GitHub Actions CI runs on pull requests
The repository SHALL have a GitHub Actions workflow that triggers on pull requests to the `master` branch.

#### Scenario: PR triggers CI
- **WHEN** a pull request is opened or updated against `master`
- **THEN** the CI pipeline SHALL execute automatically

#### Scenario: CI does not run on direct pushes
- **WHEN** code is pushed directly to `master` (not via PR)
- **THEN** the CI pipeline SHALL NOT trigger (PR-only trigger)

### Requirement: CI pipeline runs lint, test, and build in sequence
The CI pipeline SHALL execute three stages in order: lint, test, build — using NX affected commands.

#### Scenario: Lint stage
- **WHEN** the CI pipeline executes
- **THEN** it SHALL run `npx nx affected:lint --base=origin/master` to lint only affected projects

#### Scenario: Test stage
- **WHEN** the lint stage passes
- **THEN** it SHALL run `npx nx affected:test --base=origin/master` to test only affected projects

#### Scenario: Build stage
- **WHEN** the test stage passes
- **THEN** it SHALL run `npx nx affected:build --base=origin/master` to build only affected projects

#### Scenario: Stage failure stops pipeline
- **WHEN** any stage (lint, test, or build) fails
- **THEN** subsequent stages SHALL NOT execute

### Requirement: CI uses compatible Node.js version
The CI environment SHALL use Node.js 18 LTS for compatibility with project dependencies.

#### Scenario: bcrypt compatibility
- **WHEN** `npm ci` installs dependencies in CI
- **THEN** `bcrypt@5.0.1` SHALL compile successfully on Node 18

#### Scenario: Deterministic installs
- **WHEN** dependencies are installed in CI
- **THEN** the pipeline SHALL use `npm ci` (not `npm install`) for deterministic, cache-friendly installs

### Requirement: CI uses full git history for affected detection
The CI checkout SHALL fetch full git history for NX affected commands to work correctly.

#### Scenario: Affected detection works
- **WHEN** the CI pipeline checks out the repository
- **THEN** it SHALL use `fetch-depth: 0` to enable `git diff` comparison with `origin/master`

### Requirement: CI does not require database
All tests in the CI pipeline SHALL run without a database connection.

#### Scenario: Mock-based tests
- **WHEN** tests execute in CI
- **THEN** all tests SHALL use mock objects instead of real database connections
- **AND** no MySQL service container SHALL be required
