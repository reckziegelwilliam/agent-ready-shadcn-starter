"use client";

import Link from "next/link";
import { buttonVariants } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";

const examples = [
  {
    name: "Auth Flow",
    grade: "A",
    scores: [
      { label: "Accessibility", value: 92 },
      { label: "Type Safety", value: 95 },
      { label: "State Coverage", value: 88 },
    ],
  },
  {
    name: "Dashboard Table",
    grade: "A",
    scores: [
      { label: "Accessibility", value: 90 },
      { label: "Type Safety", value: 93 },
      { label: "State Coverage", value: 91 },
    ],
  },
];

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-24 text-muted-foreground">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-foreground/70"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-8 text-right font-mono text-muted-foreground">
        {value}
      </span>
    </div>
  );
}

export function QualityTeaser() {
  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Every example is scored
        </h2>
        <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
          {examples.map((ex) => (
            <Card key={ex.name} className="border-border bg-card">
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">{ex.name}</CardTitle>
                <Badge variant="secondary" className="text-sm font-bold">
                  {ex.grade}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {ex.scores.map((s) => (
                  <ScoreBar key={s.label} label={s.label} value={s.value} />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/quality" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            View Quality Dashboard &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
