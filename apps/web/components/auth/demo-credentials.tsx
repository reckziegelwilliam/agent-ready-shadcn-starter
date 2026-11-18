import { IS_DEMO_API } from "@/lib/api"

/** Shown only when the app uses the built-in demo API (no NEXT_PUBLIC_API_URL). */
export function DemoCredentials() {
  if (!IS_DEMO_API) return null
  return (
    <p className="mt-6 rounded-md border border-dashed px-3 py-2 text-center text-xs text-muted-foreground">
      Demo mode: data is mock and resets. Sign in with{" "}
      <span className="font-medium text-foreground">demo@example.com</span> /{" "}
      <span className="font-medium text-foreground">password123</span>
    </p>
  )
}
