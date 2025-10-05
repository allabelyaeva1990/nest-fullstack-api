import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  ParseIntPipe,
  Req,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from '@nestjs/passport';
import { Task } from './entities/task.entity';
import type { RequestWithUser } from '../common/interfaces/request.interface';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { QueryTaskDto } from './dto/query-task.dto';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Req() req: RequestWithUser,
  ): Promise<Task> {
    const user = req.user;
    return this.tasksService.create(createTaskDto, user); // Передаем пользователя в сервис
  }

  @Get()
  findAll(
    @Req() req: RequestWithUser,
    @Query() queryDto: QueryTaskDto,
  ): Promise<PaginatedResponse<Task>> {
    const user = req.user;
    return this.tasksService.findAll(user, queryDto);
  }

  @Get('deleted')
  findDeleted(
    @Req() req: RequestWithUser,
    @Query() queryDto: QueryTaskDto,
  ): Promise<PaginatedResponse<Task>> {
    const user = req.user;
    return this.tasksService.findDeleted(user, queryDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string): Promise<Task> {
    return this.tasksService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: RequestWithUser,
  ): Promise<Task> {
    const user = req.user;
    return this.tasksService.update(+id, updateTaskDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: string,
    @Req() req: RequestWithUser,
  ): Promise<void> {
    const user = req.user;
    return this.tasksService.remove(+id, user);
  }

  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: string): Promise<Task> {
    return this.tasksService.restore(+id);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  permanentlyRemove(
    @Param('id', ParseIntPipe) id: string,
    @Req() req: RequestWithUser,
  ): Promise<void> {
    const user = req.user;
    return this.tasksService.permanentlyRemove(+id, user);
  }
}
