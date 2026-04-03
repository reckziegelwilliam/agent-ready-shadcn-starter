"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import type { Annotation } from "@/lib/comparisons";

interface AnnotationPanelProps {
  annotations: Annotation[];
}

const borderColorMap: Record<Annotation["type"], string> = {
  fix: "border-l-red-500",
  addition: "border-l-green-500",
  improvement: "border-l-blue-500",
};

const badgeClassMap: Record<Annotation["type"], string> = {
  fix: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  addition: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  improvement: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

export function AnnotationPanel({ annotations }: AnnotationPanelProps) {
  if (annotations.length === 0) return null;

  return (
    <div className="grid gap-2">
      {annotations.map((annotation, i) => (
        <div
          key={i}
          className={cn(
            "rounded-md border border-l-4 bg-muted/30 px-4 py-3",
            borderColorMap[annotation.type]
          )}
        >
          <div className="mb-1 flex items-center gap-2">
            <Badge
              variant="secondary"
              className={cn("text-xs capitalize", badgeClassMap[annotation.type])}
            >
              {annotation.type}
            </Badge>
            <span className="text-sm font-semibold text-foreground">
              {annotation.title}
            </span>
            <span className="ml-auto text-xs text-muted-foreground">
              L{annotation.lineStart}
              {annotation.lineEnd !== annotation.lineStart &&
                `\u2013${annotation.lineEnd}`}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {annotation.description}
          </p>
        </div>
      ))}
    </div>
  );
}
