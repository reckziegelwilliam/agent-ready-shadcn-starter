import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";

const examples = [
  {
    title: "Auth Flow",
    href: "/login",
    description:
      "Login, signup, forgot password with validation, loading states, and error handling.",
    status: "Done" as const,
  },
  {
    title: "Dashboard Table",
    href: "/dashboard",
    description:
      "Sortable, filterable, paginated data table with skeleton loading.",
    status: "Done" as const,
  },
  {
    title: "Settings Page",
    href: "/settings",
    description:
      "Profile form with dirty state tracking, notification toggles with optimistic updates.",
    status: "Done" as const,
  },
  {
    title: "Multi-step Wizard",
    href: "/wizard",
    description:
      "Step validation, progress indicator, review step with edit buttons.",
    status: "Done" as const,
  },
  {
    title: "Optimistic CRUD",
    href: null,
    description: "",
    status: "Planned" as const,
  },
  {
    title: "File Upload",
    href: null,
    description: "",
    status: "Planned" as const,
  },
];

export function ExamplesSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Production-grade examples you can copy
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {examples.map((ex) => {
            const content = (
              <Card
                key={ex.title}
                className={
                  ex.status === "Planned"
                    ? "border-border bg-muted/40 opacity-60"
                    : "border-border bg-card"
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{ex.title}</CardTitle>
                    <Badge
                      variant={
                        ex.status === "Done" ? "default" : "secondary"
                      }
                    >
                      {ex.status}
                    </Badge>
                  </div>
                  {ex.description && (
                    <CardDescription className="mt-1 text-sm text-muted-foreground">
                      {ex.description}
                    </CardDescription>
                  )}
                </CardHeader>
              </Card>
            );

            if (ex.href) {
              return (
                <Link key={ex.title} href={ex.href} className="group">
                  {content}
                </Link>
              );
            }
            return <div key={ex.title}>{content}</div>;
          })}
        </div>
      </div>
    </section>
  );
}
