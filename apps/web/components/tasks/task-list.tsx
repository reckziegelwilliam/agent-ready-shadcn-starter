"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  optimisticAddTask,
  rollbackAddTask,
  optimisticUpdateTask,
  rollbackUpdateTask,
  optimisticDeleteTask,
  rollbackDeleteTask,
  nanoid,
} from "@/features/tasks/tasksSlice";
import type { Task } from "@/features/tasks/tasksSlice";
import { TaskItem } from "./task-item";
import { TaskFormDialog } from "./task-form-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { TaskListLoading } from "./task-list-loading";
import { TaskListEmpty } from "./task-list-empty";

export function TaskList() {
  const dispatch = useAppDispatch();
  const { tasks, status, error } = useAppSelector((state) => state.tasks);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  // --- Create ---
  const handleCreate = useCallback(
    (values: { title: string; description: string; priority: "low" | "medium" | "high" }) => {
      const tempId = `temp-${nanoid()}`;
      const tempTask: Task = {
        id: tempId,
        title: values.title,
        description: values.description,
        priority: values.priority,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      // Optimistic: add immediately
      dispatch(optimisticAddTask(tempTask));

      dispatch(createTask({ ...values, tempId }))
        .unwrap()
        .then(() => {
          toast.success("Task created.");
        })
        .catch((err) => {
          // Rollback
          dispatch(rollbackAddTask(tempId));
          toast.error(typeof err === "string" ? err : "Failed to create task. Changes have been reverted.");
        });
    },
    [dispatch],
  );

  // --- Edit ---
  const handleEdit = useCallback(
    (values: { title: string; description: string; priority: "low" | "medium" | "high" }) => {
      if (!editingTask) return;
      const previousTask = { ...editingTask };
      const changes = {
        title: values.title,
        description: values.description,
        priority: values.priority,
      };

      // Optimistic: apply changes immediately
      dispatch(optimisticUpdateTask({ id: editingTask.id, changes }));
      setEditingTask(null);

      dispatch(updateTask({ id: previousTask.id, changes }))
        .unwrap()
        .then(() => {
          toast.success("Task updated.");
        })
        .catch((err) => {
          // Rollback
          dispatch(rollbackUpdateTask(previousTask));
          toast.error(typeof err === "string" ? err : "Failed to update task. Changes have been reverted.");
        });
    },
    [dispatch, editingTask],
  );

  // --- Toggle Complete ---
  const handleToggleComplete = useCallback(
    (task: Task) => {
      const previousTask = { ...task };
      const changes = { completed: !task.completed };

      // Optimistic: toggle immediately
      dispatch(optimisticUpdateTask({ id: task.id, changes }));

      dispatch(updateTask({ id: task.id, changes }))
        .unwrap()
        .catch((err) => {
          // Rollback
          dispatch(rollbackUpdateTask(previousTask));
          toast.error(typeof err === "string" ? err : "Failed to update task. Changes have been reverted.");
        });
    },
    [dispatch],
  );

  // --- Delete ---
  const handleDeleteConfirm = useCallback(() => {
    if (!deletingTask) return;
    const taskToDelete = { ...deletingTask };
    setDeletingTask(null);

    // Optimistic: remove immediately
    dispatch(optimisticDeleteTask(taskToDelete.id));

    dispatch(deleteTask(taskToDelete.id))
      .unwrap()
      .then(() => {
        toast.success("Task deleted.");
      })
      .catch((err) => {
        // Rollback
        dispatch(rollbackDeleteTask(taskToDelete));
        toast.error(typeof err === "string" ? err : "Failed to delete task. Changes have been reverted.");
      });
  }, [dispatch, deletingTask]);

  // --- Retry fetch ---
  const handleRetry = useCallback(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  // --- Loading ---
  if (status === "loading") {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
            <p className="text-sm text-muted-foreground">
              Manage your tasks with optimistic updates.
            </p>
          </div>
        </div>
        <TaskListLoading />
      </div>
    );
  }

  // --- Error ---
  if (status === "failed") {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
            <p className="text-sm text-muted-foreground">
              Manage your tasks with optimistic updates.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div
            role="alert"
            className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error || "Something went wrong."}
          </div>
          <Button variant="outline" className="mt-4" onClick={handleRetry}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Manage your tasks with optimistic updates.
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <TaskListEmpty onCreateClick={() => setCreateDialogOpen(true)} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12" />
              <TableHead>Title</TableHead>
              <TableHead className="w-24">Priority</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onEdit={setEditingTask}
                onDelete={setDeletingTask}
              />
            ))}
          </TableBody>
        </Table>
      )}

      {/* Create dialog */}
      <TaskFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreate}
      />

      {/* Edit dialog */}
      <TaskFormDialog
        open={!!editingTask}
        onOpenChange={(open) => {
          if (!open) setEditingTask(null);
        }}
        task={editingTask}
        onSubmit={handleEdit}
      />

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        open={!!deletingTask}
        onOpenChange={(open) => {
          if (!open) setDeletingTask(null);
        }}
        taskTitle={deletingTask?.title ?? ""}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
