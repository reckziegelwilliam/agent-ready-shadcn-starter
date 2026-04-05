import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
}

interface CreateTaskDto {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay() {
  return delay(500 + Math.random() * 300);
}

function maybeFailMutation() {
  if (Math.random() < 0.1) {
    throw new InternalServerErrorException(
      'Random server error (simulated). Please try again.',
    );
  }
}

let nextId = 6;

@Injectable()
export class TasksService {
  private tasks: Task[] = [
    {
      id: '1',
      title: 'Set up project structure',
      description: 'Initialize the monorepo with Next.js and NestJS apps.',
      priority: 'high',
      completed: true,
      createdAt: '2025-01-15T09:00:00.000Z',
    },
    {
      id: '2',
      title: 'Design the database schema',
      description: 'Define tables for users, tasks, and settings.',
      priority: 'high',
      completed: true,
      createdAt: '2025-01-16T10:30:00.000Z',
    },
    {
      id: '3',
      title: 'Implement authentication flow',
      description: 'Add login, register, and forgot-password endpoints.',
      priority: 'medium',
      completed: false,
      createdAt: '2025-01-17T14:00:00.000Z',
    },
    {
      id: '4',
      title: 'Write unit tests for auth slice',
      description: 'Cover pending, fulfilled, and rejected states.',
      priority: 'medium',
      completed: false,
      createdAt: '2025-01-18T11:00:00.000Z',
    },
    {
      id: '5',
      title: 'Add dark mode support',
      description: 'Integrate next-themes with the appearance settings tab.',
      priority: 'low',
      completed: false,
      createdAt: '2025-01-19T16:00:00.000Z',
    },
  ];

  async findAll(): Promise<Task[]> {
    await randomDelay();
    return [...this.tasks];
  }

  async create(dto: CreateTaskDto): Promise<Task> {
    await randomDelay();
    maybeFailMutation();

    const task: Task = {
      id: String(nextId++),
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    this.tasks.push(task);
    return task;
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    await randomDelay();
    maybeFailMutation();

    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new NotFoundException(`Task with id "${id}" not found`);
    }

    const existing = this.tasks[index]!;
    const updated = { ...existing, ...dto };
    this.tasks[index] = updated;
    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    await randomDelay();
    maybeFailMutation();

    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new NotFoundException(`Task with id "${id}" not found`);
    }

    this.tasks.splice(index, 1);
    return { message: `Task "${id}" deleted` };
  }
}
