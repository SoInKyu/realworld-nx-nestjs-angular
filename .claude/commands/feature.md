Guide me through extending an existing feature in this RealWorld NX monorepo.

Follow the Fat Controller / Thin Service pattern:

- Services are thin BaseService<T> wrappers (no custom logic except UserService)
- Controllers contain ALL business logic

Steps:

1. Identify the affected domain (user or article) and NX libraries
2. Modify entity if adding new fields (libs/{domain}/api/shared/)
3. Update DTOs if needed (libs/{domain}/api-interfaces/)
4. Extend controller logic (libs/{domain}/api/handlers/) — this is where business logic goes
5. Write tests following project patterns:
   - UserService changes → test service directly (mock Repository)
   - Controller changes → test controller directly (mock services, no TestingModule)
   - Add @nestjs/typeorm mock at top of test files
6. Verify: npx nx affected:test && npx nx affected:lint

Use the feature-dev skill from .agent/skills/feature-dev/ for detailed architecture reference.

The feature I want to extend: $ARGUMENTS
