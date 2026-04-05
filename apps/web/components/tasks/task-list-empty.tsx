"use client";

import { ClipboardList } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

interface TaskListEmptyProps {
  onCreateClick: () => void;
}

export function TaskListEmpty({ onCreateClick }: TaskListEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <ClipboardList className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-medium">No tasks yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating your first task.
      </p>
      <Button className="mt-6" onClick={onCreateClick}>
        Create your first task
      </Button>
    </div>
  );
}
