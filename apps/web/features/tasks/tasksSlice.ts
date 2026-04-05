import { createSlice, createAsyncThunk, nanoid, PayloadAction } from '@reduxjs/toolkit';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
}

export interface TasksState {
  tasks: Task[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  status: 'idle',
  error: null,
};

// --- Async Thunks ---

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/tasks`);
  } catch {
    throw new Error(
      'Unable to connect. Please check your internet connection and try again.',
    );
  }
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to fetch tasks');
  }
  return res.json() as Promise<Task[]>;
});

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (
    task: { title: string; description: string; priority: 'low' | 'medium' | 'high'; tempId: string },
    { rejectWithValue },
  ) => {
    let res: Response;
    try {
      res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          priority: task.priority,
        }),
      });
    } catch {
      return rejectWithValue('Unable to connect. Please try again.');
    }
    if (!res.ok) {
      const data = await res.json();
      return rejectWithValue(data.message || 'Failed to create task');
    }
    return { serverTask: (await res.json()) as Task, tempId: task.tempId };
  },
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async (
    payload: { id: string; changes: Partial<Pick<Task, 'title' | 'description' | 'priority' | 'completed'>> },
    { rejectWithValue },
  ) => {
    let res: Response;
    try {
      res = await fetch(`${API_URL}/tasks/${payload.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload.changes),
      });
    } catch {
      return rejectWithValue('Unable to connect. Please try again.');
    }
    if (!res.ok) {
      const data = await res.json();
      return rejectWithValue(data.message || 'Failed to update task');
    }
    return res.json() as Promise<Task>;
  },
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, { rejectWithValue }) => {
    let res: Response;
    try {
      res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
      });
    } catch {
      return rejectWithValue('Unable to connect. Please try again.');
    }
    if (!res.ok) {
      const data = await res.json();
      return rejectWithValue(data.message || 'Failed to delete task');
    }
    return id;
  },
);

// --- Slice ---

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTasksError(state) {
      state.error = null;
      state.status = 'idle';
    },
    // Optimistic: add a temp task before API responds
    optimisticAddTask(state, action: PayloadAction<Task>) {
      state.tasks.unshift(action.payload);
    },
    // Rollback: remove temp task on create failure
    rollbackAddTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },
    // Optimistic: apply changes to a task before API responds
    optimisticUpdateTask(
      state,
      action: PayloadAction<{ id: string; changes: Partial<Task> }>,
    ) {
      const task = state.tasks.find((t) => t.id === action.payload.id);
      if (task) {
        Object.assign(task, action.payload.changes);
      }
    },
    // Rollback: restore a task to its previous state
    rollbackUpdateTask(state, action: PayloadAction<Task>) {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    // Optimistic: remove task before API responds
    optimisticDeleteTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },
    // Rollback: re-insert a task on delete failure
    rollbackDeleteTask(state, action: PayloadAction<Task>) {
      state.tasks.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // --- fetchTasks ---
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch tasks';
      })

      // --- createTask ---
      .addCase(createTask.fulfilled, (state, action) => {
        // Replace the temp task with the real server-generated task
        const { serverTask, tempId } = action.payload;
        const index = state.tasks.findIndex((t) => t.id === tempId);
        if (index !== -1) {
          state.tasks[index] = serverTask;
        }
      })

      // --- updateTask ---
      .addCase(updateTask.fulfilled, (state, action) => {
        // Confirm server state
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })

      // --- deleteTask ---
      .addCase(deleteTask.fulfilled, () => {
        // Already removed optimistically -- nothing to do
      });
  },
});

export const {
  clearTasksError,
  optimisticAddTask,
  rollbackAddTask,
  optimisticUpdateTask,
  rollbackUpdateTask,
  optimisticDeleteTask,
  rollbackDeleteTask,
} = tasksSlice.actions;

export { nanoid };
export default tasksSlice.reducer;
