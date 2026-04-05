"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import type { Task } from "@/features/tasks/tasksSlice";

const taskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be under 100 characters"),
  description: z
    .string()
    .max(500, "Description must be under 500 characters"),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Priority is required",
  }),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  onSubmit: (values: TaskFormValues) => void;
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  onSubmit,
}: TaskFormDialogProps) {
  const isEditing = !!task;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    mode: "onBlur",
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
    },
  });

  useEffect(() => {
    if (open) {
      if (task) {
        reset({
          title: task.title,
          description: task.description,
          priority: task.priority,
        });
      } else {
        reset({ title: "", description: "", priority: "medium" });
      }
    }
  }, [open, task, reset]);

  function handleFormSubmit(data: TaskFormValues) {
    onSubmit(data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit task" : "Create task"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the task details below."
              : "Fill in the details to create a new task."}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="grid gap-4"
          noValidate
        >
          <div className="grid gap-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              placeholder="Enter task title"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
              {...register("title")}
            />
            {errors.title && (
              <p id="title-error" className="text-sm text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="task-description">Description</Label>
            <textarea
              id="task-description"
              placeholder="Enter task description (optional)"
              className="flex min-h-20 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30"
              aria-invalid={!!errors.description}
              aria-describedby={
                errors.description ? "description-error" : undefined
              }
              {...register("description")}
            />
            {errors.description && (
              <p id="description-error" className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="task-priority">Priority</Label>
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    if (val) field.onChange(val);
                  }}
                >
                  <SelectTrigger
                    id="task-priority"
                    className="w-full"
                    aria-invalid={!!errors.priority}
                  >
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.priority && (
              <p className="text-sm text-destructive">
                {errors.priority.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
