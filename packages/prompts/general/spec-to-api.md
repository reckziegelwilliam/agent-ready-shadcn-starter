# Spec to API

> Target spec: the spec file provided as input
> Difficulty: Medium

## Context

- **Stack:** NestJS 10, TypeScript, class-validator, class-transformer
- **API app location:** `apps/api/` within the monorepo
- **Module pattern:** Each feature gets its own NestJS module with controller, service, and DTOs
- **Existing reference:** `apps/api/src/auth/` module demonstrates the established patterns for controllers, services, DTOs, and error handling
- **Validation:** DTOs use `class-validator` decorators. The `ValidationPipe` is registered globally in `main.ts`.
- **Error responses:** Use NestJS built-in exceptions (`BadRequestException`, `NotFoundException`, `ConflictException`, `UnauthorizedException`) for predictable HTTP status codes
- **Database:** TypeORM entities in `apps/api/src/entities/` (or create if not present)
- **Config:** Environment variables accessed via `@nestjs/config` `ConfigService`

## Input

1. Read the product spec file provided by the user (e.g., `packages/specs/<feature>.md`).
2. Review the existing auth module for patterns: `apps/api/src/auth/auth.module.ts`, `apps/api/src/auth/auth.controller.ts`, `apps/api/src/auth/auth.service.ts`.
3. Review the app module: `apps/api/src/app.module.ts` to understand how modules are registered.
4. Check existing DTOs in `apps/api/src/auth/dto/` for naming and validation conventions.

## Instructions

### 1. Define DTOs

Create request and response DTOs in `apps/api/src/<feature>/dto/`.

- Create one DTO file per operation (e.g., `create-<feature>.dto.ts`, `update-<feature>.dto.ts`).
- Use `class-validator` decorators: `@IsString()`, `@IsEmail()`, `@IsOptional()`, `@MinLength()`, `@MaxLength()`, `@IsEnum()`, etc.
- Use `class-transformer` `@Exclude()` or `@Expose()` for response DTOs that should omit sensitive fields.
- Export each DTO class.

### 2. Create the Service

Create `apps/api/src/<feature>/<feature>.service.ts`.

- Inject any required dependencies (repository, config service, other services) via constructor.
- Implement one method per operation defined in the spec.
- Throw appropriate NestJS exceptions for error cases: `NotFoundException` for missing resources, `ConflictException` for duplicates, `BadRequestException` for invalid input that passed DTO validation.
- Return plain objects or entities, not HTTP responses (the controller handles that).

### 3. Create the Controller

Create `apps/api/src/<feature>/<feature>.controller.ts`.

- Use `@Controller('<feature>')` decorator with the resource name as the route prefix.
- Create one handler method per endpoint: `@Get()`, `@Post()`, `@Patch()`, `@Delete()`.
- Use `@Body()` for request DTOs, `@Param()` for URL parameters, `@Query()` for query strings.
- Apply `@HttpCode()` where needed (e.g., 204 for delete, 201 for create).
- Keep handlers thin: validate input shape via DTO, delegate to service, return result.

### 4. Create the Module

Create `apps/api/src/<feature>/<feature>.module.ts`.

- Import any required modules (e.g., `TypeOrmModule.forFeature([Entity])` if using a database).
- Register the controller and service as providers.
- Export the service if other modules need it.

### 5. Register in App Module

Modify `apps/api/src/app.module.ts`.

- Import the new feature module in the `imports` array.

### 6. Add Entity (if applicable)

If the spec defines a data model that should be persisted:

- Create `apps/api/src/entities/<feature>.entity.ts` with TypeORM decorators.
- Define columns matching the spec's data model, with appropriate types and constraints.
- Register the entity in the TypeORM module configuration.

### 7. Test the Endpoints

- Use `curl` or a REST client to test each endpoint.
- Verify that valid requests return the expected status code and response shape.
- Verify that invalid DTOs return 400 with a structured validation error array.
- Verify that missing resources return 404.
- Verify that duplicate/conflict operations return 409.

## Output

| File | Action | Description |
| ---- | ------ | ----------- |
| `apps/api/src/<feature>/dto/create-<feature>.dto.ts` | Create | Request DTO with class-validator decorators |
| `apps/api/src/<feature>/dto/update-<feature>.dto.ts` | Create | Update DTO (partial, uses `PartialType`) |
| `apps/api/src/<feature>/<feature>.service.ts` | Create | Business logic with error handling |
| `apps/api/src/<feature>/<feature>.controller.ts` | Create | REST endpoints with proper HTTP codes |
| `apps/api/src/<feature>/<feature>.module.ts` | Create | NestJS module wiring controller + service |
| `apps/api/src/entities/<feature>.entity.ts` | Create | TypeORM entity (if applicable) |
| `apps/api/src/app.module.ts` | Modify | Register the new feature module |

## Verification

1. **Type check:** Run `pnpm typecheck` from the monorepo root. Zero errors.
2. **Lint:** Run `pnpm lint`. Zero errors.
3. **POST with valid body:** Returns 201 with correct response shape.
4. **POST with invalid body:** Returns 400 with structured validation errors listing each invalid field.
5. **GET existing resource:** Returns 200 with full resource data.
6. **GET missing resource:** Returns 404 with descriptive message.
7. **PATCH with partial update:** Returns 200 with updated fields only changed.
8. **DELETE existing resource:** Returns 204 with empty body.
9. **Conflict operation:** Returns 409 (e.g., creating duplicate email).
10. **Module isolation:** Service can be injected in other modules if exported.
