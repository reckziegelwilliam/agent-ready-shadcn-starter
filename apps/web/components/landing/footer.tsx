import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Separator } from "@workspace/ui/components/separator";
import { Badge } from "@workspace/ui/components/badge";

const techStack = [
  "Next.js 16",
  "shadcn/ui",
  "Tailwind v4",
  "Redux Toolkit",
  "NestJS",
  "TypeScript",
];

export function Footer() {
  return (
    <footer className="py-12">
      <div className="mx-auto max-w-6xl px-4">
        <Separator className="mb-10" />
        <p className="text-center text-lg font-medium text-foreground">
          Built for engineers who use AI to ship &mdash; and refuse to ship
          mistakes.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="https://github.com/reckziegelwilliam/agent-ready-shadcn-starter"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            GitHub
          </Link>
          <Badge variant="secondary" className="text-xs">
            MIT License
          </Badge>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {techStack.map((tech) => (
            <Badge
              key={tech}
              variant="outline"
              className="text-xs font-normal text-muted-foreground"
            >
              {tech}
            </Badge>
          ))}
        </div>
      </div>
    </footer>
  );
}
