import { describe, it, expect } from 'vitest';
import tasksReducer, {
  TasksState,
  Task,
  clearTasksError,
  optimisticAddTask,
  rollbackAddTask,
  optimisticUpdateTask,
  rollbackUpdateTask,
  optimisticDeleteTask,
  rollbackDeleteTask,
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../tasksSlice';

const mockTask: Task = {
  id: '1',
  title: 'Test task',
  description: 'A test task',
  priority: 'medium',
  completed: false,
  createdAt: '2025-01-15T09:00:00.000Z',
};

const mockTask2: Task = {
  id: '2',
  title: 'Second task',
  description: 'Another task',
  priority: 'high',
  completed: true,
  createdAt: '2025-01-16T10:00:00.000Z',
};

const initialState: TasksState = {
  tasks: [],
  status: 'idle',
  error: null,
};

const stateWithTasks: TasksState = {
  tasks: [mockTask, mockTask2],
  status: 'succeeded',
  error: null,
};

describe('tasksSlice', () => {
  // --- Initial state ---
  it('should return the initial state', () => {
    expect(tasksReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  // --- clearTasksError ---
  it('clearTasksError should reset error and status to idle', () => {
    const stateWithError: TasksState = {
      ...initialState,
      error: 'Something went wrong',
      status: 'failed',
    };
    const result = tasksReducer(stateWithError, clearTasksError());
    expect(result.error).toBeNull();
    expect(result.status).toBe('idle');
  });

  // --- fetchTasks ---
  it('fetchTasks.pending should set loading status and clear error', () => {
    const stateWithError: TasksState = {
      ...initialState,
      error: 'Previous error',
      status: 'failed',
    };
    const result = tasksReducer(stateWithError, fetchTasks.pending(''));
    expect(result.status).toBe('loading');
    expect(result.error).toBeNull();
  });

  it('fetchTasks.fulfilled should set tasks and succeeded status', () => {
    const tasks = [mockTask, mockTask2];
    const result = tasksReducer(
      { ...initialState, status: 'loading' },
      fetchTasks.fulfilled(tasks, ''),
    );
    expect(result.status).toBe('succeeded');
    expect(result.tasks).toEqual(tasks);
  });

  it('fetchTasks.rejected should set error and failed status', () => {
    const result = tasksReducer(
      { ...initialState, status: 'loading' },
      fetchTasks.rejected(new Error('Network error'), ''),
    );
    expect(result.status).toBe('failed');
    expect(result.error).toBe('Network error');
  });

  // --- Optimistic create ---
  it('optimisticAddTask should add a task to the beginning of the list', () => {
    const tempTask: Task = {
      id: 'temp-abc',
      title: 'New task',
      description: 'Description',
      priority: 'low',
      completed: false,
      createdAt: '2025-01-20T09:00:00.000Z',
    };
    const result = tasksReducer(stateWithTasks, optimisticAddTask(tempTask));
    expect(result.tasks).toHaveLength(3);
    expect(result.tasks[0]).toEqual(tempTask);
  });

  it('rollbackAddTask should remove the temp task on create failure', () => {
    const stateWithTemp: TasksState = {
      ...stateWithTasks,
      tasks: [
        { id: 'temp-abc', title: 'Temp', description: '', priority: 'low', completed: false, createdAt: '' },
        ...stateWithTasks.tasks,
      ],
    };
    const result = tasksReducer(stateWithTemp, rollbackAddTask('temp-abc'));
    expect(result.tasks).toHaveLength(2);
    expect(result.tasks.find((t) => t.id === 'temp-abc')).toBeUndefined();
  });

  it('createTask.fulfilled should replace temp task with server task', () => {
    const stateWithTemp: TasksState = {
      ...stateWithTasks,
      tasks: [
        { id: 'temp-abc', title: 'Temp', description: '', priority: 'low', completed: false, createdAt: '' },
        ...stateWithTasks.tasks,
      ],
    };
    const serverTask: Task = {
      id: '99',
      title: 'Temp',
      description: '',
      priority: 'low',
      completed: false,
      createdAt: '2025-01-20T09:00:00.000Z',
    };
    const result = tasksReducer(
      stateWithTemp,
      createTask.fulfilled(
        { serverTask, tempId: 'temp-abc' },
        '',
        { title: 'Temp', description: '', priority: 'low', tempId: 'temp-abc' },
      ),
    );
    expect(result.tasks).toHaveLength(3);
    expect(result.tasks[0]!.id).toBe('99');
  });

  // --- Optimistic update ---
  it('optimisticUpdateTask should apply changes to the task', () => {
    const result = tasksReducer(
      stateWithTasks,
      optimisticUpdateTask({ id: '1', changes: { title: 'Updated title', completed: true } }),
    );
    expect(result.tasks[0]!.title).toBe('Updated title');
    expect(result.tasks[0]!.completed).toBe(true);
  });

  it('rollbackUpdateTask should restore the previous task state', () => {
    const modifiedState: TasksState = {
      ...stateWithTasks,
      tasks: [
        { ...mockTask, title: 'Wrong title' },
        mockTask2,
      ],
    };
    const result = tasksReducer(modifiedState, rollbackUpdateTask(mockTask));
    expect(result.tasks[0]!.title).toBe('Test task');
  });

  it('updateTask.fulfilled should confirm server state', () => {
    const serverTask: Task = { ...mockTask, title: 'Server confirmed title' };
    const result = tasksReducer(
      stateWithTasks,
      updateTask.fulfilled(serverTask, '', { id: '1', changes: { title: 'Server confirmed title' } }),
    );
    expect(result.tasks[0]!.title).toBe('Server confirmed title');
  });

  // --- Optimistic delete ---
  it('optimisticDeleteTask should remove the task from the list', () => {
    const result = tasksReducer(stateWithTasks, optimisticDeleteTask('1'));
    expect(result.tasks).toHaveLength(1);
    expect(result.tasks.find((t) => t.id === '1')).toBeUndefined();
  });

  it('rollbackDeleteTask should re-insert the task on delete failure', () => {
    const stateAfterDelete: TasksState = {
      ...stateWithTasks,
      tasks: [mockTask2],
    };
    const result = tasksReducer(stateAfterDelete, rollbackDeleteTask(mockTask));
    expect(result.tasks).toHaveLength(2);
    expect(result.tasks.find((t) => t.id === '1')).toBeDefined();
  });

  it('deleteTask.fulfilled should not change state (already removed optimistically)', () => {
    const stateAfterDelete: TasksState = {
      ...stateWithTasks,
      tasks: [mockTask2],
    };
    const result = tasksReducer(
      stateAfterDelete,
      deleteTask.fulfilled('1', '', '1'),
    );
    expect(result.tasks).toHaveLength(1);
  });
});
