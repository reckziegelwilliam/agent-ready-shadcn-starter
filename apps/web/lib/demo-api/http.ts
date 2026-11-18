/**
 * Helpers that make the demo route handlers respond the way the NestJS API
 * does: JSON bodies, and NestJS's `{ message, error, statusCode }` error shape.
 */

const STATUS_TEXT: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  404: "Not Found",
  409: "Conflict",
  500: "Internal Server Error",
}

/** Mirrors NestJS built-in HTTP exceptions (NotFoundException, etc.). */
export class DemoHttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    /** Raw response body, for errors NestJS returns without the standard wrapper. */
    public readonly body?: Record<string, unknown>
  ) {
    super(message)
  }
}

export function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { "x-demo-api": "true", "cache-control": "no-store" },
  })
}

export function errorResponse(err: unknown): Response {
  if (err instanceof DemoHttpError) {
    return json(
      err.body ?? {
        message: err.message,
        error: STATUS_TEXT[err.statusCode] ?? "Error",
        statusCode: err.statusCode,
      },
      err.statusCode
    )
  }
  return json({ statusCode: 500, message: "Internal server error" }, 500)
}

/**
 * Parse a JSON request body like NestJS's body parser: an empty body becomes
 * `{}`, malformed JSON is a 400.
 */
export async function readJson<T>(request: Request): Promise<Partial<T>> {
  const text = await request.text()
  if (!text.trim()) return {}
  try {
    return JSON.parse(text) as Partial<T>
  } catch (e) {
    throw new DemoHttpError(
      400,
      e instanceof Error ? e.message : "Invalid JSON body"
    )
  }
}

/** Run a handler and turn thrown DemoHttpErrors into NestJS-style responses. */
export async function handle(fn: () => Promise<unknown>, status = 200) {
  try {
    return json(await fn(), status)
  } catch (err) {
    return errorResponse(err)
  }
}
