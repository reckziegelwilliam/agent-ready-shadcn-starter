import {
  FileText,
  BookOpen,
  MessageSquare,
  BarChart3,
  GitCompare,
} from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";

const pillars = [
  {
    icon: FileText,
    label: "Scaffold",
    description: "Generate feature structure with specs and state matrices",
  },
  {
    icon: BookOpen,
    label: "Spec",
    description:
      "Define every state, validation rule, and acceptance criterion",
  },
  {
    icon: MessageSquare,
    label: "Instruct",
    description: "Give agents structured prompts with project context",
  },
  {
    icon: BarChart3,
    label: "Evaluate",
    description:
      "Score output on accessibility, types, states, and consistency",
  },
  {
    icon: GitCompare,
    label: "Repair",
    description:
      "Compare AI output against production, document every fix",
  },
];

export function PillarsSection() {
  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Five pillars of AI code hardening
        </h2>
        <div className="mt-12 flex flex-wrap items-start justify-center gap-0">
          {pillars.map((p, i) => (
            <div key={p.label} className="flex items-start">
              <div className="flex w-40 flex-col items-center text-center md:w-48">
                <Badge
                  variant="secondary"
                  className="mb-3 h-8 w-8 items-center justify-center rounded-full p-0 text-sm font-semibold"
                >
                  {i + 1}
                </Badge>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-background">
                  <p.icon className="h-6 w-6 text-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {p.label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {p.description}
                </p>
              </div>
              {i < pillars.length - 1 && (
                <div className="mt-14 hidden w-8 border-t border-dashed border-border md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
