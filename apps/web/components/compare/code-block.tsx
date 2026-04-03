"use client";

import { cn } from "@workspace/ui/lib/utils";

interface Highlight {
  lineStart: number;
  lineEnd: number;
  type: "issue" | "fix";
}

interface CodeBlockProps {
  code: string;
  highlights: Highlight[];
  label: string;
}

export function CodeBlock({ code, highlights, label }: CodeBlockProps) {
  const lines = code.split("\n");

  function getHighlightClass(lineNumber: number): string | undefined {
    for (const h of highlights) {
      if (lineNumber >= h.lineStart && lineNumber <= h.lineEnd) {
        return h.type === "issue" ? "bg-red-500/10" : "bg-green-500/10";
      }
    }
    return undefined;
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div
        className={cn(
          "px-3 py-2 text-xs font-medium border-b",
          label === "AI Generated"
            ? "bg-red-500/5 text-red-700 dark:text-red-400"
            : "bg-green-500/5 text-green-700 dark:text-green-400"
        )}
      >
        {label}
      </div>
      <div className="overflow-x-auto bg-muted/50">
        <pre className="text-sm leading-relaxed">
          <code>
            {lines.map((line, i) => {
              const lineNum = i + 1;
              const hlClass = getHighlightClass(lineNum);
              return (
                <div
                  key={lineNum}
                  className={cn("flex", hlClass)}
                >
                  <span className="inline-block w-10 shrink-0 select-none pr-3 text-right font-mono text-xs leading-relaxed text-muted-foreground">
                    {lineNum}
                  </span>
                  <span className="font-mono whitespace-pre">{line}</span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}
