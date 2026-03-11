---
name: feature-dev
description: This skill should be used when the user asks to "add a field", "extend an endpoint", "add filtering", "modify an entity", "add a new column", "extend the API", or needs guidance on expanding existing NestJS backend features in this RealWorld (Conduit) NX monorepo following the Fat Controller / Thin Service pattern.
version: 0.1.0
---

# Feature Development Guide

Extend existing backend features in this RealWorld NX monorepo.

## Core Rule: Fat Controller / Thin Service

- **Services**: thin `BaseService<T>` CRUD wrappers — NO business logic (except `UserService`)
- **Controllers**: ALL business logic (auth checks, query building, response mapping)
- **Entities**: extend `BaseEntity` (UUID, timestamps, soft delete)

## Workflow

### 1. Identify Scope

Determine affected domain (`user` or `article`) and NX libraries:

- Entity/Service changes → `libs/{domain}/api/shared/`
- Controller changes → `libs/{domain}/api/handlers/`
- DTO changes → `libs/{domain}/api-interfaces/`

### 2. Modify Entity → DTO → Controller

1. Add `@Column()` to entity if adding fields
2. Update DTOs for request/response shape
3. Extend controller with business logic (NOT the service)
4. Wrap responses: `ActionSuccessResponse`, `DetailSuccessResponse`, `ListSuccessResponse`

### 3. Write Tests

Choose test target based on where logic lives:

| Logic Location | Test Target         |
| -------------- | ------------------- |
| UserService    | Service directly    |
| Any Controller | Controller directly |

Required: `@nestjs/typeorm` mock at top of every test file (before imports).

### 4. Verify

```bash
npx nx affected:test --base=origin/master
npx nx affected:lint --base=origin/master
```

## Reference Documents

For detailed information, read these project docs:

- **`docs/architecture.md`** — Domain structure, entity model, BaseService API, response wrappers, authentication
- **`docs/testing-guide.md`** — Test patterns, mock setup examples, coverage thresholds, full test case inventory
- **`docs/api-routes.md`** — All API endpoints (public/protected), request/response formats, error codes
