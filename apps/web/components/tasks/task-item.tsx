"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { TableCell, TableRow } from "@workspace/ui/components/table";
import { cn } from "@workspace/ui/lib/utils";
import type { Task } from "@/features/tasks/tasksSlice";

interface TaskItemProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const priorityVariant: Record<Task["priority"], "default" | "secondary" | "destructive"> = {
  low: "secondary",
  medium: "default",
  high: "destructive",
};

export function TaskItem({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskItemProps) {
  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task)}
          aria-label={`Mark "${task.title}" as ${task.completed ? "incomplete" : "complete"}`}
        />
      </TableCell>
      <TableCell>
        <span
          className={cn(
            "font-medium",
            task.completed && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </span>
        {task.description && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
            {task.description}
          </p>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={priorityVariant[task.priority]}>
          {task.priority}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(task)}
            aria-label={`Edit "${task.title}"`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(task)}
            aria-label={`Delete "${task.title}"`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
