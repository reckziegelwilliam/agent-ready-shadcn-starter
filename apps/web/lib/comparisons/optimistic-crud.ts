import type { ComparisonExample } from "./types";

export const optimisticCrudComparison: ComparisonExample = {
  slug: "optimistic-crud",
  title: "Optimistic CRUD",
  description:
    "Task list with create, edit, delete, and toggle. AI output waited for server responses instead of updating optimistically, had no rollback on failure, and skipped confirmation dialogs. The production version fixes all six issues found in review.",
  issueCount: 6,
  files: [
    {
      filename: "task-list.tsx",
      aiGenerated: `export function TaskList() {
  const dispatch = useAppDispatch();
  const { tasks, status, error } = useAppSelector((s) => s.tasks);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // --- Create ---
  const handleCreate = useCallback(
    (values: { title: string; description: string; priority: "low" | "medium" | "high" }) => {
      dispatch(createTask(values))
        .unwrap()
        .then(() => {
          toast.success("Task created.");
        })
        .catch(() => {
          toast.error("Failed to create task.");
        });
    },
    [dispatch],
  );

  // --- Edit ---
  const handleEdit = useCallback(
    (task: Task, values: Partial<Task>) => {
      dispatch(updateTask({ id: task.id, changes: values }))
        .unwrap()
        .then(() => {
          toast.success("Task updated.");
        })
        .catch(() => {
          toast.error("Failed to update task.");
        });
    },
    [dispatch],
  );

  // --- Delete (no confirmation) ---
  const handleDelete = useCallback(
    (taskId: string) => {
      dispatch(deleteTask(taskId))
        .unwrap()
        .then(() => {
          toast.success("Task deleted.");
        })
        .catch(() => {
          toast.error("Failed to delete task.");
        });
    },
    [dispatch],
  );

  if (status === "loading") return <div>Loading...</div>;

  return (
    <div>
      <Button onClick={() => setCreateDialogOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Add Task
      </Button>
      <Table>
        <TableBody>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}`,
      production: `export function TaskList() {
  const dispatch = useAppDispatch();
  const { tasks, status, error } = useAppSelector((s) => s.tasks);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  // --- Create (optimistic) ---
  const handleCreate = useCallback(
    (values: { title: string; description: string; priority: "low" | "medium" | "high" }) => {
      const tempId = \`temp-\${nanoid()}\`;
      const tempTask: Task = {
        id: tempId, ...values,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      // Add immediately before API responds
      dispatch(optimisticAddTask(tempTask));

      dispatch(createTask({ ...values, tempId }))
        .unwrap()
        .then(() => toast.success("Task created."))
        .catch((err) => {
          dispatch(rollbackAddTask(tempId));
          toast.error(typeof err === "string" ? err : "Failed to create task. Changes reverted.");
        });
    },
    [dispatch],
  );

  // --- Delete (with confirmation dialog) ---
  const handleDeleteConfirm = useCallback(() => {
    if (!deletingTask) return;
    const taskToDelete = { ...deletingTask };
    setDeletingTask(null);

    dispatch(optimisticDeleteTask(taskToDelete.id));

    dispatch(deleteTask(taskToDelete.id))
      .unwrap()
      .then(() => toast.success("Task deleted."))
      .catch((err) => {
        dispatch(rollbackDeleteTask(taskToDelete));
        toast.error(typeof err === "string" ? err : "Failed to delete. Restored.");
      });
  }, [dispatch, deletingTask]);

  if (status === "loading") return <TaskListLoading />;
  if (status === "failed") {
    return (
      <div role="alert" className="text-destructive">
        {error || "Something went wrong."}
        <Button variant="outline" onClick={() => dispatch(fetchTasks())}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      {tasks.length === 0 ? (
        <TaskListEmpty onCreateClick={() => setCreateDialogOpen(true)} />
      ) : (
        <Table>
          <TableBody>
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task}
                onToggleComplete={handleToggleComplete}
                onEdit={setEditingTask}
                onDelete={setDeletingTask} />
            ))}
          </TableBody>
        </Table>
      )}
      <DeleteConfirmDialog
        open={!!deletingTask}
        taskTitle={deletingTask?.title ?? ""}
        onConfirm={handleDeleteConfirm} />
    </div>
  );
}`,
      aiAnnotations: [
        {
          lineStart: 14,
          lineEnd: 24,
          type: "fix",
          title: "No optimistic update — waits for server",
          description:
            "The AI dispatches createTask and waits for the server response before the task appears in the UI. Users see a loading spinner for 500-800ms. The pattern should add the task to the list immediately via a synchronous reducer, then reconcile when the server responds.",
        },
        {
          lineStart: 40,
          lineEnd: 50,
          type: "fix",
          title: "Delete has no confirmation dialog",
          description:
            "Clicking delete immediately removes the task with no user confirmation. Destructive actions need a confirmation dialog. The AI dispatched the thunk directly from the button handler.",
        },
        {
          lineStart: 56,
          lineEnd: 56,
          type: "fix",
          title: "No skeleton loading state",
          description:
            'The loading branch renders a plain "Loading..." div instead of a skeleton component. This causes layout shift and briefly shows an empty page before the content loads.',
        },
      ],
      prodAnnotations: [
        {
          lineStart: 12,
          lineEnd: 30,
          type: "fix",
          title: "Optimistic create with rollback",
          description:
            "A temporary task is added to the list immediately via optimisticAddTask before the API call. If the server rejects it, rollbackAddTask removes it and an error toast fires. Users see instant feedback.",
        },
        {
          lineStart: 33,
          lineEnd: 49,
          type: "fix",
          title: "Delete uses confirmation dialog with rollback",
          description:
            "The delete button sets deletingTask state which opens a confirmation dialog. Only after confirmation does the optimistic delete and thunk fire. On failure, rollbackDeleteTask restores the task.",
        },
        {
          lineStart: 52,
          lineEnd: 60,
          type: "fix",
          title: "Skeleton loading and error state with retry",
          description:
            "Loading renders a TaskListLoading skeleton component. Error state shows the API error message in a role=alert container with a retry button, preventing false empty states.",
        },
      ],
    },
    {
      filename: "tasksSlice.ts",
      aiGenerated: `const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch tasks";
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.tasks[idx] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      })
      // Rejected handlers are empty — no rollback
      .addCase(createTask.rejected, () => {})
      .addCase(updateTask.rejected, () => {})
      .addCase(deleteTask.rejected, () => {});
  },
});`,
      production: `const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    // Optimistic: add temp task before API responds
    optimisticAddTask(state, action: PayloadAction<Task>) {
      state.tasks.unshift(action.payload);
    },
    // Rollback: remove temp task on create failure
    rollbackAddTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },
    // Optimistic: apply changes before API responds
    optimisticUpdateTask(
      state,
      action: PayloadAction<{ id: string; changes: Partial<Task> }>,
    ) {
      const task = state.tasks.find((t) => t.id === action.payload.id);
      if (task) Object.assign(task, action.payload.changes);
    },
    // Rollback: restore task to previous snapshot
    rollbackUpdateTask(state, action: PayloadAction<Task>) {
      const idx = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (idx !== -1) state.tasks[idx] = action.payload;
    },
    // Optimistic: remove task before API responds
    optimisticDeleteTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },
    // Rollback: re-insert task on delete failure
    rollbackDeleteTask(state, action: PayloadAction<Task>) {
      state.tasks.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch tasks";
      })
      .addCase(createTask.fulfilled, (state, action) => {
        // Replace temp task with server-generated task
        const { serverTask, tempId } = action.payload;
        const idx = state.tasks.findIndex((t) => t.id === tempId);
        if (idx !== -1) state.tasks[idx] = serverTask;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        // Confirm server state
        const idx = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.tasks[idx] = action.payload;
      })
      .addCase(deleteTask.fulfilled, () => {
        // Already removed optimistically — nothing to do
      });
  },
});`,
      aiAnnotations: [
        {
          lineStart: 4,
          lineEnd: 4,
          type: "fix",
          title: "No synchronous reducers for optimistic updates",
          description:
            "The reducers object is empty. All state changes happen in extraReducers on fulfilled, meaning the UI only updates after the server responds. Optimistic updates require synchronous reducers that the component dispatches before the async thunk.",
        },
        {
          lineStart: 28,
          lineEnd: 31,
          type: "fix",
          title: "Rejected handlers are empty — no rollback",
          description:
            "The rejected cases for create, update, and delete are no-ops. When the API returns a 500, the optimistic change (if it existed) would persist forever. Without rollback reducers, there is no way to revert the UI to its previous state.",
        },
      ],
      prodAnnotations: [
        {
          lineStart: 4,
          lineEnd: 33,
          type: "fix",
          title: "Full optimistic + rollback reducer set",
          description:
            "Six synchronous reducers handle the optimistic update lifecycle: optimisticAdd/Update/Delete apply changes instantly, and rollbackAdd/Update/Delete revert them on failure. The component dispatches the optimistic action first, then the async thunk.",
        },
        {
          lineStart: 47,
          lineEnd: 53,
          type: "improvement",
          title: "createTask.fulfilled replaces temp with server task",
          description:
            "On success, the fulfilled handler swaps the temporary task (with its temp ID) for the real server-generated task. This ensures the list uses the canonical server ID for subsequent operations.",
        },
      ],
    },
  ],
};
