/**
 * DEMO MODE ONLY.
 *
 * In-memory port of the NestJS services in `apps/api/src/*`, used by the
 * route handlers in `app/api/` when `NEXT_PUBLIC_API_URL` is not set (see
 * `lib/api.ts`). Same seed data, same simulated latency and random failures,
 * same responses and error messages. Data lives in server memory: it resets
 * on restart and is not shared between serverless instances.
 *
 * If you change an endpoint in `apps/api`, change it here too.
 */
import { DemoHttpError } from "./http"

// ---------- Types (match apps/api) ----------

export interface Task {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  completed: boolean
  createdAt: string
}

export interface Settings {
  profile: { name: string; email: string; bio: string }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    marketingEmails: boolean
  }
  appearance: {
    theme: "light" | "dark" | "system"
    fontSize: "small" | "default" | "large"
  }
}

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: string
}

interface MockUser {
  id: string
  email: string
  password: string
  name: string
}

interface DemoState {
  users: MockUser[]
  tasks: Task[]
  nextTaskId: number
  settings: Settings
  files: UploadedFile[]
}

// ---------- Config (tests replace these) ----------

export const demoApiConfig = {
  sleep: (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms)),
  random: () => Math.random(),
}

const delay = (ms: number) => demoApiConfig.sleep(ms)
const between = (min: number, spread: number) =>
  delay(min + demoApiConfig.random() * spread)

// ---------- State ----------

function seed(): DemoState {
  return {
    users: [
      {
        id: "1",
        email: "demo@example.com",
        password: "password123",
        name: "Demo User",
      },
    ],
    tasks: [
      {
        id: "1",
        title: "Set up project structure",
        description: "Initialize the monorepo with Next.js and NestJS apps.",
        priority: "high",
        completed: true,
        createdAt: "2025-01-15T09:00:00.000Z",
      },
      {
        id: "2",
        title: "Design the database schema",
        description: "Define tables for users, tasks, and settings.",
        priority: "high",
        completed: true,
        createdAt: "2025-01-16T10:30:00.000Z",
      },
      {
        id: "3",
        title: "Implement authentication flow",
        description: "Add login, register, and forgot-password endpoints.",
        priority: "medium",
        completed: false,
        createdAt: "2025-01-17T14:00:00.000Z",
      },
      {
        id: "4",
        title: "Write unit tests for auth slice",
        description: "Cover pending, fulfilled, and rejected states.",
        priority: "medium",
        completed: false,
        createdAt: "2025-01-18T11:00:00.000Z",
      },
      {
        id: "5",
        title: "Add dark mode support",
        description: "Integrate next-themes with the appearance settings tab.",
        priority: "low",
        completed: false,
        createdAt: "2025-01-19T16:00:00.000Z",
      },
    ],
    nextTaskId: 6,
    settings: {
      profile: {
        name: "Demo User",
        email: "demo@example.com",
        bio: "Software developer who enjoys building great user experiences.",
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: false,
        marketingEmails: false,
      },
      appearance: { theme: "system", fontSize: "default" },
    },
    files: [
      {
        id: "demo-1",
        name: "project-proposal.pdf",
        size: 2_450_000,
        type: "application/pdf",
        uploadedAt: "2025-12-15T10:30:00Z",
      },
      {
        id: "demo-2",
        name: "team-photo.jpg",
        size: 1_800_000,
        type: "image/jpeg",
        uploadedAt: "2025-12-14T14:20:00Z",
      },
      {
        id: "demo-3",
        name: "quarterly-report.docx",
        size: 980_000,
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        uploadedAt: "2025-12-13T09:15:00Z",
      },
    ],
  }
}

// Kept on globalThis so every route handler in the same server process sees
// the same data, and dev hot reloads don't wipe it.
const globalForDemo = globalThis as typeof globalThis & {
  __demoApiState?: DemoState
}

function state(): DemoState {
  globalForDemo.__demoApiState ??= seed()
  return globalForDemo.__demoApiState
}

/** Restore the seed data (used by tests). */
export function resetDemoApi() {
  globalForDemo.__demoApiState = seed()
}

// ---------- Auth (apps/api/src/auth/auth.service.ts) ----------

export async function login(dto: { email?: string; password?: string }) {
  await delay(800)
  const user = state().users.find(
    (u) => u.email === dto.email && u.password === dto.password
  )
  if (!user) throw new DemoHttpError(401, "Invalid email or password")
  return {
    user: { id: user.id, email: user.email, name: user.name },
    token: "mock-jwt-token-" + user.id,
  }
}

export async function register(dto: {
  email?: string
  password?: string
  name?: string
}) {
  await delay(1000)
  const users = state().users
  if (users.find((u) => u.email === dto.email)) {
    throw new DemoHttpError(409, "Email already registered")
  }
  const newUser: MockUser = {
    id: String(users.length + 1),
    email: dto.email as string,
    password: dto.password as string,
    name: dto.name as string,
  }
  users.push(newUser)
  return {
    user: { id: newUser.id, email: newUser.email, name: newUser.name },
    token: "mock-jwt-token-" + newUser.id,
  }
}

export async function forgotPassword(dto: { email?: string }) {
  await delay(600)
  return {
    message: `If an account exists for ${dto.email}, a reset link has been sent.`,
  }
}

// ---------- Tasks (apps/api/src/tasks/tasks.service.ts) ----------

function maybeFailMutation() {
  if (demoApiConfig.random() < 0.1) {
    throw new DemoHttpError(
      500,
      "Random server error (simulated). Please try again."
    )
  }
}

export async function listTasks(): Promise<Task[]> {
  await between(500, 300)
  return [...state().tasks]
}

export async function createTask(dto: {
  title?: string
  description?: string
  priority?: Task["priority"]
}): Promise<Task> {
  await between(500, 300)
  maybeFailMutation()
  const s = state()
  const task: Task = {
    id: String(s.nextTaskId++),
    title: dto.title as string,
    description: dto.description as string,
    priority: dto.priority as Task["priority"],
    completed: false,
    createdAt: new Date().toISOString(),
  }
  s.tasks.push(task)
  return task
}

export async function updateTask(
  id: string,
  dto: Partial<Omit<Task, "id" | "createdAt">>
): Promise<Task> {
  await between(500, 300)
  maybeFailMutation()
  const tasks = state().tasks
  const index = tasks.findIndex((t) => t.id === id)
  if (index === -1) {
    throw new DemoHttpError(404, `Task with id "${id}" not found`)
  }
  const updated = { ...tasks[index]!, ...dto }
  tasks[index] = updated
  return updated
}

export async function deleteTask(id: string): Promise<{ message: string }> {
  await between(500, 300)
  maybeFailMutation()
  const tasks = state().tasks
  const index = tasks.findIndex((t) => t.id === id)
  if (index === -1) {
    throw new DemoHttpError(404, `Task with id "${id}" not found`)
  }
  tasks.splice(index, 1)
  return { message: `Task "${id}" deleted` }
}

// ---------- Settings (apps/api/src/settings/settings.service.ts) ----------

export async function getSettings(): Promise<Settings> {
  await between(600, 200)
  return { ...state().settings }
}

export async function updateProfile(data: {
  name?: string
  bio?: string
}): Promise<Settings> {
  await between(600, 200)
  const s = state()
  s.settings = {
    ...s.settings,
    profile: {
      ...s.settings.profile,
      name: data.name as string,
      bio: data.bio as string,
    },
  }
  return { ...s.settings }
}

export async function updateNotifications(
  data: Partial<Settings["notifications"]>
): Promise<Settings> {
  await between(600, 200)
  const s = state()
  s.settings = {
    ...s.settings,
    notifications: { ...data } as Settings["notifications"],
  }
  return { ...s.settings }
}

export async function updateAppearance(
  data: Partial<Settings["appearance"]>
): Promise<Settings> {
  await between(600, 200)
  const s = state()
  s.settings = {
    ...s.settings,
    appearance: { ...data } as Settings["appearance"],
  }
  return { ...s.settings }
}

// ---------- Onboarding (apps/api/src/onboarding/onboarding.service.ts) ----------

export async function submitOnboarding(dto: {
  personal?: Partial<{
    firstName: string
    lastName: string
    email: string
    phone: string
  }>
  preferences?: Partial<{
    industry: string
    companySize: string
    referralSource: string
  }>
  plan?: "free" | "pro" | "enterprise"
}) {
  await delay(1000)
  if (
    !dto.personal?.firstName ||
    !dto.personal?.lastName ||
    !dto.personal?.email
  ) {
    throw new DemoHttpError(400, "Missing required personal information")
  }
  if (
    !dto.preferences?.industry ||
    !dto.preferences?.companySize ||
    !dto.preferences?.referralSource
  ) {
    throw new DemoHttpError(400, "Missing required preferences")
  }
  if (!dto.plan) {
    throw new DemoHttpError(400, "Plan selection is required")
  }
  return {
    message: "Onboarding completed successfully",
    onboardingId: `onb_${Date.now()}`,
  }
}

// ---------- Uploads (apps/api/src/uploads/*) ----------

export async function listUploads(): Promise<UploadedFile[]> {
  await between(600, 200)
  return [...state().files]
}

export async function createUpload(data: {
  name?: string
  size?: number
  type?: string
}): Promise<UploadedFile> {
  await between(1000, 2000)
  // 15% random failure rate. The NestJS controller returns this body as-is.
  if (demoApiConfig.random() < 0.15) {
    throw new DemoHttpError(500, "Upload failed. Please try again.", {
      message: "Upload failed. Please try again.",
    })
  }
  const file: UploadedFile = {
    id: `upload-${Date.now()}-${demoApiConfig.random().toString(36).slice(2, 8)}`,
    name: data.name as string,
    size: data.size as number,
    type: data.type as string,
    uploadedAt: new Date().toISOString(),
  }
  state().files.unshift(file)
  return file
}

export async function deleteUpload(id: string): Promise<{ message: string }> {
  await between(400, 200)
  const files = state().files
  const index = files.findIndex((f) => f.id === id)
  if (index === -1) throw new DemoHttpError(404, "File not found.")
  files.splice(index, 1)
  return { message: "File deleted." }
}
