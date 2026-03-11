# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RealWorld (Conduit) — a Medium.com clone built as an NX monorepo with NestJS v7 (backend) + Angular v11 (frontend). NPM scope: `@realworld`.

## Common Commands

```bash
# Serve
npm run serve:api              # Backend (port 3333)
npm run serve:conduit          # Frontend (port 4200)
npm run serve:api-conduit      # Both concurrently

# Test (single project)
npx nx test user-api-shared          # UserService tests
npx nx test article-api-handlers     # ArticleController tests
npx nx affected:test                 # Test affected projects only

# Lint & Format
npm run lint                   # Full workspace lint
npx nx affected:lint           # Lint affected only
npm run format:check           # Check Prettier formatting

# Build
npm run build-prod:api         # Production API build
npm run build-prod:conduit     # Production frontend build

# Database
npm run migration:run          # Compile & run TypeORM migrations
```

## Architecture

### Domain Structure (libs/)

The codebase is organized by **domain** with a consistent sub-library pattern:

```
libs/{domain}/
  api/shared/       # Entities + services (backend)
  api/handlers/     # Controllers (backend)
  api-interfaces/   # DTOs shared between client/server
  feature/          # Angular lazy-loaded feature module (frontend)
  shared/           # Frontend services
```

Two domains exist: `user` and `article`. Shared utilities live in `libs/shared/`.

### Fat Controller / Thin Service Pattern

This is the most important architectural detail:

- **Services** extend `BaseService<T>` (generic CRUD: `findAll`, `findOne`, `insert`, `update`, `softDelete`, `count`). Most services have **zero custom methods** — they are constructor-only wrappers.
- **UserService** is the sole exception with real business logic (login, register, JWT, password hashing).
- **Controllers** contain the business logic: authorization checks, query composition, response mapping, tag upserts, favorite toggles.

When writing tests: test `UserService` directly, but for article domain test the **controller** (not the empty services).

### BaseService<T> Interface

```typescript
abstract class BaseService<T> {
  public repository: Repository<T>
  findAll(options?), count(options?), findOne(conditions?, options?),
  insert(data), update(condition, data), softDelete(condition)
}
```

### Entity Base

All entities extend `BaseEntity`: `id` (UUID), `createdAt`, `updatedAt`, `deletedDate` (soft delete).

### Response Wrappers

API responses use `ActionSuccessResponse<T>` (create/update/delete), `DetailSuccessResponse<T>` (single item), `ListSuccessResponse<T>` (list + total) from `@realworld/shared/client-server`.

### Authentication

JWT via `@nestjs/passport`. Routes marked with `@SkipAuth()` decorator are public. The `req.user.sub` contains the authenticated user's ID.

## Testing Patterns

### Service Tests (mock Repository)

```typescript
const mockRepository = {
  findOne: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  find: jest.fn(),
};
const service = new UserService(
  mockRepository as any,
  mockJwtService as any,
  mockFollowService as any
);
```

### Controller Tests (mock Services, no TestingModule needed)

```typescript
const mockArticleService = { findAll: jest.fn(), findOne: jest.fn(), insert: jest.fn(), ... };
const controller = new ArticleApiHandlersController(mockArticleService as any, ...);
const mockReq = { user: { sub: 'user-id' }, headers: { authorization: 'Bearer token' } };
```

### Node 23 Compatibility

`@nestjs/typeorm@7` uses the removed `util.isNullOrUndefined`. Add this mock at the **top** of every test file (before imports):

```typescript
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => {},
  TypeOrmModule: { forFeature: () => ({ module: class {} }) },
}));
```

## Work Rules

- 독립적인 작업은 반드시 병렬로 수행한다 (예: 서로 다른 라이브러리의 테스트 작성, 독립된 파일 읽기/검색, 관련 없는 서브태스크 동시 실행)
- Agent 도구 사용 시 의존성이 없는 작업은 하나의 메시지에서 여러 Agent를 동시에 dispatch한다
- Bash 도구도 독립적인 명령어는 병렬로 호출한다 (예: 여러 프로젝트의 테스트를 동시에 실행)
- Pre-commit hook (Husky v9)이 staged 파일에 Prettier 자동 포맷팅 적용

## Conventions

- TypeScript, 2-space indent, single quotes, no strict mode
- Soft delete pattern (never hard delete)
- UUID primary keys
- MySQL with TypeORM migrations (`/migrations/`)
- PR to `master` triggers CI (lint → test → build via GitHub Actions)
- NX `affected` commands for efficient CI on changed projects only

## API Routes

Public (`@SkipAuth()`): `POST /api/users/login`, `POST /api/users`, `GET /api/profiles/:username`, `GET /api/articles`, `GET /api/articles/:slug`, `GET /api/articles/:slug/comments`, `GET /api/tags`

Protected: `PUT /api/users`, `GET /api/user`, `POST /api/articles`, `PUT /api/articles/:slug`, `DELETE /api/articles/:slug`, `GET /api/articles/feed`, `POST|DELETE /api/articles/:slug/favorite`, `POST /api/articles/:slug/comments`, `DELETE /api/articles/:slug/comments/:id`, `POST|DELETE /api/profiles/:username/follow`
