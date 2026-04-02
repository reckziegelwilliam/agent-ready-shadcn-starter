# API Endpoint Review Checklist

Use this checklist when reviewing API route handlers (Next.js route handlers in `app/api/` or server actions).

## Input Validation

- [ ] All request body fields are validated before use (using `zod` or equivalent).
- [ ] Query parameters are validated and coerced to correct types (strings from URL params parsed to numbers, etc.).
- [ ] Validation errors return 422 with a structured error response that identifies which fields failed.
- [ ] Unexpected fields in the request body are stripped or rejected (no pass-through of unvalidated data).
- [ ] Array inputs are bounded (maximum length) to prevent abuse.
- [ ] String inputs have maximum length constraints.

## Error Handling

- [ ] Every code path that can fail is wrapped in a try/catch or equivalent error boundary.
- [ ] Errors return appropriate HTTP status codes:
  - 400 for malformed requests
  - 401 for missing authentication
  - 403 for insufficient permissions
  - 404 for resources not found
  - 409 for conflicts (duplicate records)
  - 422 for validation failures
  - 429 for rate limiting
  - 500 for unexpected server errors
- [ ] Error responses follow a consistent shape: `{ error: { code: string, message: string } }`.
- [ ] Internal error details (stack traces, database errors) are never exposed in responses.
- [ ] Server errors are logged with enough context to debug (request path, relevant IDs).

## Authentication and Authorization

- [ ] The endpoint checks for a valid authentication token/session before processing.
- [ ] The endpoint verifies the authenticated user has permission to perform the requested action.
- [ ] Resource-level authorization is enforced (user can only access their own data, or admin-only endpoints check admin role).
- [ ] Authentication failures return 401, not 403.
- [ ] Authorization failures return 403 with a generic message (no information leakage about what resources exist).

## Response Shape

- [ ] Success responses follow a consistent structure across the API.
- [ ] Paginated responses include pagination metadata: `{ data: [], pagination: { page, pageSize, totalCount, totalPages } }`.
- [ ] Dates are returned as ISO 8601 strings.
- [ ] IDs are returned as strings (even if stored as numbers or UUIDs).
- [ ] Null fields are explicitly included (not omitted) for consistency.
- [ ] Response shapes match the TypeScript interfaces defined in the spec.

## Edge Cases

- [ ] Empty arrays are returned as `[]`, not `null` or omitted.
- [ ] Not-found resources return 404, not an empty 200 response.
- [ ] Concurrent modifications are handled (optimistic locking or last-write-wins, depending on the spec).
- [ ] Bulk operations handle partial failures gracefully (report which items succeeded and which failed).
- [ ] The endpoint handles the case where referenced resources have been deleted.

## Security

- [ ] User input is never interpolated directly into SQL queries or shell commands.
- [ ] Rate limiting is applied to endpoints that accept user input (login, registration, search).
- [ ] Sensitive data (passwords, tokens) is never included in response bodies or logs.
- [ ] The forgot-password endpoint does not reveal whether an email exists in the system.
- [ ] CORS headers are configured appropriately (not `*` in production).

## Performance

- [ ] Database queries use appropriate indexes (or the query design supports them).
- [ ] Paginated endpoints do not load all records into memory before slicing.
- [ ] N+1 query patterns are avoided (use joins or batch loading).
- [ ] Large response payloads are paginated or streamed.
- [ ] Expensive operations that do not need to block the response are handled asynchronously.
