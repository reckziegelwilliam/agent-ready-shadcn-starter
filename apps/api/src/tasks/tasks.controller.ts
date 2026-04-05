import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Post()
  create(
    @Body()
    body: {
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
    },
  ) {
    return this.tasksService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      priority?: 'low' | 'medium' | 'high';
      completed?: boolean;
    },
  ) {
    return this.tasksService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
