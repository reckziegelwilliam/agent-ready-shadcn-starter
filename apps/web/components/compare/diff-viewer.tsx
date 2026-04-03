"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import type { ComparisonFile } from "@/lib/comparisons";
import { CodeBlock } from "./code-block";
import { AnnotationPanel } from "./annotation-panel";

interface DiffViewerProps {
  file: ComparisonFile;
}

export function DiffViewer({ file }: DiffViewerProps) {
  const aiHighlights = file.aiAnnotations.map((a) => ({
    lineStart: a.lineStart,
    lineEnd: a.lineEnd,
    type: "issue" as const,
  }));

  const prodHighlights = file.prodAnnotations.map((a) => ({
    lineStart: a.lineStart,
    lineEnd: a.lineEnd,
    type: "fix" as const,
  }));

  const allAnnotations = [
    ...file.aiAnnotations,
    ...file.prodAnnotations,
  ];

  return (
    <div className="grid gap-4">
      {/* Desktop: side-by-side */}
      <div className="hidden gap-4 md:grid md:grid-cols-2">
        <CodeBlock
          code={file.aiGenerated}
          highlights={aiHighlights}
          label="AI Generated"
        />
        <CodeBlock
          code={file.production}
          highlights={prodHighlights}
          label="Production"
        />
      </div>

      {/* Mobile: tabs */}
      <div className="md:hidden">
        <Tabs defaultValue="ai">
          <TabsList className="w-full">
            <TabsTrigger value="ai" className="flex-1">
              AI Generated
            </TabsTrigger>
            <TabsTrigger value="prod" className="flex-1">
              Production
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ai" className="mt-3">
            <CodeBlock
              code={file.aiGenerated}
              highlights={aiHighlights}
              label="AI Generated"
            />
          </TabsContent>
          <TabsContent value="prod" className="mt-3">
            <CodeBlock
              code={file.production}
              highlights={prodHighlights}
              label="Production"
            />
          </TabsContent>
        </Tabs>
      </div>

      <AnnotationPanel annotations={allAnnotations} />
    </div>
  );
}
