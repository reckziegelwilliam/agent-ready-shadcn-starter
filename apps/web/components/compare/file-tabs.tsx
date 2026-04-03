"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import type { ComparisonFile } from "@/lib/comparisons";
import { DiffViewer } from "./diff-viewer";

interface FileTabsProps {
  files: ComparisonFile[];
}

export function FileTabs({ files }: FileTabsProps) {
  return (
    <Tabs defaultValue={files[0]?.filename}>
      <TabsList>
        {files.map((file) => (
          <TabsTrigger key={file.filename} value={file.filename}>
            {file.filename}
          </TabsTrigger>
        ))}
      </TabsList>
      {files.map((file) => (
        <TabsContent key={file.filename} value={file.filename} className="mt-4">
          <DiffViewer file={file} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
