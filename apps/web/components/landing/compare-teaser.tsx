"use client";

import Link from "next/link";
import { buttonVariants } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

const diffLines = [
  { type: "comment", text: "// AI Generated (missing error reset)" },
  { type: "removed", text: "export function LoginForm() {" },
  { type: "removed", text: "  const dispatch = useAppDispatch();" },
  { type: "blank", text: "" },
  { type: "comment", text: "// Production (clears stale errors on mount)" },
  { type: "added", text: "export function LoginForm() {" },
  { type: "added", text: "  const dispatch = useAppDispatch();" },
  {
    type: "added",
    text: "  useEffect(() => { dispatch(clearError()); }, [dispatch]);",
  },
] as const;

export function CompareTeaser() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          See what AI gets wrong &mdash; and how to fix it
        </h2>
        <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-lg border border-border">
          <div className="bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
            login-form.tsx
          </div>
          <pre className="overflow-x-auto p-4 text-sm leading-relaxed font-mono">
            {diffLines.map((line, i) => {
              let className = "text-muted-foreground";
              let prefix = "  ";
              if (line.type === "removed") {
                className =
                  "bg-red-500/10 text-red-400 block -mx-4 px-4";
                prefix = "- ";
              } else if (line.type === "added") {
                className =
                  "bg-green-500/10 text-green-400 block -mx-4 px-4";
                prefix = "+ ";
              } else if (line.type === "comment") {
                className = "text-muted-foreground/70";
                prefix = "  ";
              } else if (line.type === "blank") {
                return <br key={i} />;
              }
              return (
                <code key={i} className={className}>
                  {prefix}
                  {line.text}
                  {"\n"}
                </code>
              );
            })}
          </pre>
        </div>
        <div className="mt-8 text-center">
          <Link href="/compare" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            View All Repairs &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
