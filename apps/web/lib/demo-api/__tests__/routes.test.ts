// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { demoApiConfig, resetDemoApi } from "@/lib/demo-api/store"
import * as health from "@/app/api/health/route"
import * as login from "@/app/api/auth/login/route"
import * as register from "@/app/api/auth/register/route"
import * as forgotPassword from "@/app/api/auth/forgot-password/route"
import * as tasks from "@/app/api/tasks/route"
import * as task from "@/app/api/tasks/[id]/route"
import * as settings from "@/app/api/settings/route"
import * as profile from "@/app/api/settings/profile/route"
import * as notifications from "@/app/api/settings/notifications/route"
import * as appearance from "@/app/api/settings/appearance/route"
import * as onboarding from "@/app/api/onboarding/submit/route"
import * as uploads from "@/app/api/uploads/route"
import * as upload from "@/app/api/uploads/[id]/route"

const realConfig = { ...demoApiConfig }
let randomValue = 0.99 // above every simulated failure threshold

function req(method: string, body?: unknown, raw?: string) {
  return new Request("http://localhost/api", {
    method,
    headers: { "content-type": "application/json" },
    body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
  })
}
const ctx = (id: string) => ({ params: Promise.resolve({ id }) })

beforeEach(() => {
  resetDemoApi()
  randomValue = 0.99
  demoApiConfig.sleep = async () => {}
  demoApiConfig.random = () => randomValue
})
afterEach(() => {
  Object.assign(demoApiConfig, realConfig)
})

describe("demo API: health", () => {
  it("reports ok", async () => {
    const res = health.GET()
    expect(res.status).toBe(200)
    expect(res.headers.get("x-demo-api")).toBe("true")
    expect(await res.json()).toMatchObject({ status: "ok", demo: true })
  })
})

describe("demo API: auth", () => {
  it("logs in the demo user and returns a mock token", async () => {
    const res = await login.POST(
      req("POST", { email: "demo@example.com", password: "password123" })
    )
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({
      user: { id: "1", email: "demo@example.com", name: "Demo User" },
      token: "mock-jwt-token-1",
    })
  })

  it("rejects bad credentials with a NestJS-style 401", async () => {
    const res = await login.POST(
      req("POST", { email: "demo@example.com", password: "nope" })
    )
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({
      message: "Invalid email or password",
      error: "Unauthorized",
      statusCode: 401,
    })
  })

  it("returns 400 for malformed JSON", async () => {
    const res = await login.POST(req("POST", undefined, "{not json"))
    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({
      statusCode: 400,
      error: "Bad Request",
    })
  })

  it("registers a new user, then the new user can log in", async () => {
    const res = await register.POST(
      req("POST", {
        email: "new@example.com",
        password: "secret123",
        name: "New",
      })
    )
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({
      user: { id: "2", email: "new@example.com", name: "New" },
      token: "mock-jwt-token-2",
    })
    const again = await login.POST(
      req("POST", { email: "new@example.com", password: "secret123" })
    )
    expect(again.status).toBe(201)
  })

  it("rejects a duplicate email with 409", async () => {
    const res = await register.POST(
      req("POST", { email: "demo@example.com", password: "x", name: "Dup" })
    )
    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({
      message: "Email already registered",
      error: "Conflict",
      statusCode: 409,
    })
  })

  it("answers forgot-password without revealing accounts", async () => {
    const res = await forgotPassword.POST(req("POST", { email: "a@b.co" }))
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({
      message: "If an account exists for a@b.co, a reset link has been sent.",
    })
  })
})

describe("demo API: tasks", () => {
  it("lists the seed tasks", async () => {
    const res = await tasks.GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(5)
    expect(body[0]).toMatchObject({
      id: "1",
      title: "Set up project structure",
    })
  })

  it("creates, updates and deletes a task", async () => {
    const created = await tasks.POST(
      req("POST", { title: "T", description: "D", priority: "low" })
    )
    expect(created.status).toBe(201)
    const t = await created.json()
    expect(t).toMatchObject({
      id: "6",
      title: "T",
      priority: "low",
      completed: false,
    })

    const updated = await task.PATCH(
      req("PATCH", { completed: true }),
      ctx("6")
    )
    expect(updated.status).toBe(200)
    expect(await updated.json()).toMatchObject({ id: "6", completed: true })

    const deleted = await task.DELETE(req("DELETE"), ctx("6"))
    expect(await deleted.json()).toEqual({ message: 'Task "6" deleted' })
    expect(await (await tasks.GET()).json()).toHaveLength(5)
  })

  it("returns 404 for an unknown task", async () => {
    const res = await task.PATCH(req("PATCH", { title: "x" }), ctx("999"))
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({
      message: 'Task with id "999" not found',
      error: "Not Found",
      statusCode: 404,
    })
  })

  it("simulates the API's random mutation failure", async () => {
    randomValue = 0.05
    const res = await tasks.POST(
      req("POST", { title: "T", description: "D", priority: "low" })
    )
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({
      message: "Random server error (simulated). Please try again.",
      error: "Internal Server Error",
      statusCode: 500,
    })
  })
})

describe("demo API: settings", () => {
  it("reads and updates each section", async () => {
    const initial = await (await settings.GET()).json()
    expect(initial.profile.email).toBe("demo@example.com")

    const p = await (
      await profile.PATCH(req("PATCH", { name: "Liam", bio: "Hi" }))
    ).json()
    expect(p.profile).toEqual({
      name: "Liam",
      email: "demo@example.com",
      bio: "Hi",
    })

    const n = await (
      await notifications.PATCH(
        req("PATCH", {
          emailNotifications: false,
          pushNotifications: true,
          marketingEmails: true,
        })
      )
    ).json()
    expect(n.notifications.pushNotifications).toBe(true)

    const a = await (
      await appearance.PATCH(req("PATCH", { theme: "dark", fontSize: "large" }))
    ).json()
    expect(a.appearance).toEqual({ theme: "dark", fontSize: "large" })
    expect(a.profile.name).toBe("Liam")
  })
})

describe("demo API: onboarding", () => {
  const valid = {
    personal: { firstName: "A", lastName: "B", email: "a@b.co", phone: "" },
    preferences: { industry: "tech", companySize: "1-10", referralSource: "x" },
    plan: "pro",
  }

  it("accepts a complete submission", async () => {
    const res = await onboarding.POST(req("POST", valid))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.message).toBe("Onboarding completed successfully")
    expect(body.onboardingId).toMatch(/^onb_\d+$/)
  })

  it.each([
    [
      { ...valid, personal: { ...valid.personal, email: "" } },
      "Missing required personal information",
    ],
    [
      { ...valid, preferences: { ...valid.preferences, industry: "" } },
      "Missing required preferences",
    ],
    [{ ...valid, plan: undefined }, "Plan selection is required"],
  ])("validates like the API (%#)", async (body, message) => {
    const res = await onboarding.POST(req("POST", body))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({
      message,
      error: "Bad Request",
      statusCode: 400,
    })
  })
})

describe("demo API: uploads", () => {
  it("lists, uploads and deletes files", async () => {
    expect(await (await uploads.GET()).json()).toHaveLength(3)

    const res = await uploads.POST(
      req("POST", { name: "a.png", size: 10, type: "image/png" })
    )
    expect(res.status).toBe(201)
    const file = await res.json()
    expect(file).toMatchObject({ name: "a.png", size: 10, type: "image/png" })
    expect(file.id).toMatch(/^upload-/)

    const list = await (await uploads.GET()).json()
    expect(list[0].id).toBe(file.id)

    const del = await upload.DELETE(req("DELETE"), ctx(file.id))
    expect(await del.json()).toEqual({ message: "File deleted." })
  })

  it("returns 404 for an unknown file", async () => {
    const res = await upload.DELETE(req("DELETE"), ctx("nope"))
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({
      message: "File not found.",
      error: "Not Found",
      statusCode: 404,
    })
  })

  it("simulates the 15% upload failure with the API's bare body", async () => {
    randomValue = 0.1
    const res = await uploads.POST(
      req("POST", { name: "a", size: 1, type: "x" })
    )
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({
      message: "Upload failed. Please try again.",
    })
  })
})
