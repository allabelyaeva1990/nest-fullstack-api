import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { User } from '../users/entities/user.entity';
import { TaskNotFoundException } from '../common/exceptions/task-not-found.exception';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';
import { QueryTaskDto } from './dto/query-task.dto';
import { UserRole } from '../users/enums/user-role.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async findAll(
    user: User,
    queryDto: QueryTaskDto,
  ): Promise<PaginatedResponse<Task>> {
    const {
      page = 1,
      limit = 20,
      is_done,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = queryDto;

    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<Task> = {};
    if (user.role === UserRole.USER) {
      where.userId = user.id;
    }

    // Добавляем фильтр по is_done, если указан
    if (is_done !== undefined) {
      where.is_done = is_done;
    }

    // Добавляем поиск по названию, если указан
    if (search) {
      where.title = ILike(`%${search}%`); // ILIKE - регистронезависимый поиск
    }

    // Получаем задачи с фильтрами
    const [tasks, total] = await this.tasksRepository.findAndCount({
      where,
      take: limit,
      skip,
      order: {
        [sortBy]: sortOrder, // Динамическая сортировка
      },
    });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data: tasks,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };
  }

  async findOne(id: number, withDeleted = false): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      withDeleted, // Если true, вернет даже удаленную задачу
    });
    if (!task) {
      throw new TaskNotFoundException(id);
    }
    return task;
  }

  create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const task = this.tasksRepository.create({
      ...createTaskDto,
      userId: user.id,
      is_done: false,
    });
    return this.tasksRepository.save(task);
  }

  async update(
    id: number,
    updateTaskDto: UpdateTaskDto,
    user: User,
  ): Promise<Task> {
    const task = await this.findOne(id);
    if (task.userId !== user.id && user.role === UserRole.USER) {
      throw new TaskNotFoundException(id);
    }
    Object.assign(task, updateTaskDto);
    return this.tasksRepository.save(task);
  }

  async findDeleted(
    user: User,
    queryDto: QueryTaskDto,
  ): Promise<PaginatedResponse<Task>> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'deleted_at',
      sortOrder = 'DESC',
    } = queryDto;

    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Task> = {
      userId: user.id,
    };

    if (search) {
      where.title = ILike(`%${search}%`);
    }

    const [tasks, total] = await this.tasksRepository.findAndCount({
      where,
      take: limit,
      skip,
      order: {
        [sortBy]: sortOrder,
      },
      withDeleted: true,
    });

    // Фильтруем ТОЛЬКО удаленные
    const deletedTasks = tasks.filter((task) => task.deleted_at !== null);
    const deletedTotal = deletedTasks.length;

    const totalPages = Math.ceil(deletedTotal / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data: deletedTasks,
      meta: {
        total: deletedTotal,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };
  }

  async remove(id: number, user: User): Promise<void> {
    const task = await this.findOne(id);
    if (task.userId !== user.id && user.role === UserRole.USER) {
      throw new TaskNotFoundException(id);
    }
    // softRemove() устанавливает deleted_at вместо физического удаления
    await this.tasksRepository.softRemove(task);
  }

  async restore(id: number): Promise<Task> {
    const task = await this.findOne(id, true);

    if (!task.deleted_at) {
      throw new ForbiddenException('Задача не удалена');
    }
    await this.tasksRepository.recover(task);

    return task;
  }

  async permanentlyRemove(id: number, user: User): Promise<void> {
    const task = await this.findOne(id, true);
    if (user.role !== UserRole.ADMIN) {
      throw new TaskNotFoundException(id);
    }
    await this.tasksRepository.remove(task);
  }
}
