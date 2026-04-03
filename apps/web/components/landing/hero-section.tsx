"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { buttonVariants } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/30 py-24 md:py-36">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/40 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-6xl px-4 text-center">
        <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          Ship AI-generated UI without shipping AI-generated mistakes.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          A hardening framework for turning AI-generated code into
          production-safe features. Specs, prompts, evals, and a repair
          workflow for Next.js + shadcn/ui + NestJS.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="https://github.com/reckziegelwilliam/agent-ready-shadcn-starter"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            <ExternalLink className="mr-2 h-5 w-5" />
            View on GitHub
          </Link>
          <Link
            href="/compare"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            See the Repairs &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
