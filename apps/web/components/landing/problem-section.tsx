import { AlertTriangle, Bug, Shield } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@workspace/ui/components/card";

const problems = [
  {
    icon: AlertTriangle,
    title: "Only 68.3% of AI-generated projects run out of the box.",
    description:
      "Hidden dependency gaps and setup drift break real environments.",
  },
  {
    icon: Bug,
    title: "AI is better at generation than verification.",
    description:
      "Models produce code faster than they can check it. Review burden shifts to you.",
  },
  {
    icon: Shield,
    title: "Consistency drifts across multi-file changes.",
    description:
      "Naming, patterns, state handling, and accessibility degrade over multiple features.",
  },
];

export function ProblemSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          AI generates code fast.
          <br />
          The output isn&rsquo;t production-safe.
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((p) => (
            <Card key={p.title} className="border-border bg-card">
              <CardHeader>
                <p.icon className="mb-2 h-8 w-8 text-muted-foreground" />
                <CardTitle className="text-lg leading-snug">
                  {p.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">
                  {p.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
