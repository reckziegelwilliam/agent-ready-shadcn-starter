# Spec to API

> Target spec: the spec file provided as input
> Difficulty: Medium

## Context

- **Stack:** NestJS 11, TypeScript
- **API app location:** `apps/api/` within the monorepo
- **Module pattern:** Each feature gets its own NestJS module with controller and service
- **Existing reference:** `apps/api/src/auth/` (and `tasks/`, `settings/`, `uploads/`, `onboarding/`) demonstrate the established patterns for controllers, services, and error handling
- **Data:** The existing modules keep data in memory inside the service (no database). Follow that unless the spec says otherwise.
- **Error responses:** Use NestJS built-in exceptions (`BadRequestException`, `NotFoundException`, `ConflictException`, `UnauthorizedException`) for predictable HTTP status codes
- **Validation:** There is no `class-validator`, `ValidationPipe`, DTO folder, database or `@nestjs/config` in the API today. Request bodies are typed inline in the controller (or as interfaces in the service), and the service checks required fields itself and throws `BadRequestException` (see `apps/api/src/onboarding/onboarding.service.ts`). Only add class-validator, a database or config if the spec needs it, and then as an explicit, separate step.
- **Demo mode:** The web app can run without this API. `apps/web/lib/demo-api/store.ts` mirrors every service in memory and `apps/web/app/api/**/route.ts` exposes the same paths. Every endpoint you add or change here must be mirrored there.
- **Tests:** Vitest, in `apps/api/src/<feature>/__tests__/` (see `apps/api/src/auth/__tests__/auth.service.test.ts`).

## Input

1. Read the product spec file provided by the user (e.g., `packages/specs/<feature>.md`).
2. Review an existing module for patterns: `apps/api/src/tasks/tasks.module.ts`, `tasks.controller.ts`, `tasks.service.ts` (CRUD) and `apps/api/src/onboarding/onboarding.service.ts` (validation).
3. Review the app module: `apps/api/src/app.module.ts` to understand how modules are registered.
4. Review the demo-mode mirror: `apps/web/lib/demo-api/store.ts` and `apps/web/app/api/tasks/`.

## Instructions

### 1. Define the Request/Response Types

- Declare interfaces for the entity and each request body at the top of `apps/api/src/<feature>/<feature>.service.ts` (e.g. `interface CreateTaskDto`), matching the spec's API Contracts exactly. Export the entity interface.

### 2. Create the Service

Create `apps/api/src/<feature>/<feature>.service.ts`.

- `@Injectable()` class holding data in memory (seed a few realistic records).
- Add a small `delay()` helper so the UI's loading states are visible, like the other services.
- Implement one async method per operation defined in the spec.
- Validate required fields and enums yourself and throw NestJS exceptions: `BadRequestException` for invalid input, `NotFoundException` for missing resources, `ConflictException` for duplicates, `UnauthorizedException` for bad credentials. Messages are what the UI shows, so make them human-readable.
- Return plain objects (the controller returns them as JSON).

### 3. Create the Controller

Create `apps/api/src/<feature>/<feature>.controller.ts`.

- Use `@Controller('<feature>')` decorator with the resource name as the route prefix.
- Create one handler method per endpoint: `@Get()`, `@Post()`, `@Patch()`, `@Delete()`.
- Use `@Body()` with the inline/interface body type, `@Param()` for URL parameters, `@Query()` for query strings.
- NestJS returns 201 for `@Post()` and 200 otherwise; only add `@HttpCode()` if the spec requires something different.
- Keep handlers thin: delegate to the service and return the result.

### 4. Create the Module

Create `apps/api/src/<feature>/<feature>.module.ts`.

- Register the controller and the service as a provider.
- Export the service only if other modules need it.

### 5. Register in App Module

Modify `apps/api/src/app.module.ts`.

- Import the new feature module in the `imports` array.

### 6. Mirror the Endpoints for Demo Mode

- Port the service logic into `apps/web/lib/demo-api/store.ts` (same seed data, same messages; throw `DemoHttpError(status, message)` where the service throws a Nest exception).
- Add route handlers at `apps/web/app/api/<feature>/route.ts` (and `[id]/route.ts` for item routes) using `handle()` and `readJson()` from `apps/web/lib/demo-api/http.ts`. Use status 201 for POST handlers, like NestJS.
- Add cases to `apps/web/lib/demo-api/__tests__/routes.test.ts`.

### 7. Test the Endpoints

- Add service tests in `apps/api/src/<feature>/__tests__/<feature>.service.test.ts`.
- Use `curl` against `http://localhost:4000/<feature>` (NestJS) and `http://localhost:3000/api/<feature>` (demo mode) and compare responses.
- Verify valid requests return the expected status code and response shape.
- Verify invalid input returns 400 with NestJS's error body: `{ "message": "...", "error": "Bad Request", "statusCode": 400 }`.
- Verify missing resources return 404 and duplicates return 409.

## Output

| File | Action | Description |
| ---- | ------ | ----------- |
| `apps/api/src/<feature>/<feature>.service.ts` | Create | Types, in-memory data, business logic and validation |
| `apps/api/src/<feature>/<feature>.controller.ts` | Create | REST endpoints |
| `apps/api/src/<feature>/<feature>.module.ts` | Create | NestJS module wiring controller + service |
| `apps/api/src/app.module.ts` | Modify | Register the new feature module |
| `apps/api/src/<feature>/__tests__/<feature>.service.test.ts` | Create | Service tests |
| `apps/web/lib/demo-api/store.ts` | Modify | Demo-mode mirror of the service |
| `apps/web/app/api/<feature>/route.ts` (+ `[id]/route.ts`) | Create | Demo-mode route handlers |
| `apps/web/lib/demo-api/__tests__/routes.test.ts` | Modify | Route handler tests |

## Verification

1. **Type check:** Run `pnpm typecheck` from the monorepo root. Zero errors.
2. **Lint:** Run `pnpm lint`. Zero errors.
3. **Tests:** Run `pnpm test`. All pass.
4. **POST with valid body:** Returns 201 with correct response shape.
5. **POST with invalid body:** Returns 400 with a human-readable `message`.
6. **GET existing resource:** Returns 200 with full resource data.
7. **GET/PATCH/DELETE missing resource:** Returns 404 with descriptive message.
8. **PATCH with partial update:** Returns 200 with only the sent fields changed.
9. **Conflict operation:** Returns 409 (e.g., creating duplicate email).
10. **Parity:** The same requests against the demo API (`/api/<feature>`) return the same status codes and bodies.
