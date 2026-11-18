import { afterEach, describe, expect, it, vi } from "vitest"

async function load(value: string | undefined) {
  vi.resetModules()
  if (value === undefined) vi.stubEnv("NEXT_PUBLIC_API_URL", "")
  else vi.stubEnv("NEXT_PUBLIC_API_URL", value)
  return import("@/lib/api")
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("API_URL", () => {
  it("uses the built-in demo API when NEXT_PUBLIC_API_URL is unset", async () => {
    const api = await load(undefined)
    expect(api.API_URL).toBe("/api")
    expect(api.IS_DEMO_API).toBe(true)
  })

  it("treats a same-origin path as demo mode", async () => {
    const api = await load("/api/")
    expect(api.API_URL).toBe("/api")
    expect(api.IS_DEMO_API).toBe(true)
  })

  it("uses a real API when NEXT_PUBLIC_API_URL is an absolute URL", async () => {
    const api = await load("http://localhost:4000/")
    expect(api.API_URL).toBe("http://localhost:4000")
    expect(api.IS_DEMO_API).toBe(false)
  })
})
