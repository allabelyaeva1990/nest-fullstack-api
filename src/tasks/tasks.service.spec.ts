import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { TaskNotFoundException } from '../common/exceptions/task-not-found.exception';

describe('TasksService', () => {
  let service: TasksService;
  let repository: Repository<Task>;

  // Мок пользователя
  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    role: UserRole.USER,
    tasks: Promise.resolve([]),
  };

  // Мок задачи
  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    is_done: false,
    userId: 1,
    user: mockUser,
    priority: 1,
    created_at: new Date(),
    deleted_at: null,
  };

  // Мок репозитория
  const mockTasksRepository = {
    find: jest.fn() as jest.MockedFunction<Repository<Task>['find']>,
    findAndCount: jest.fn() as jest.MockedFunction<
      Repository<Task>['findAndCount']
    >,
    findOne: jest.fn() as jest.MockedFunction<Repository<Task>['findOne']>,
    findOneBy: jest.fn() as jest.MockedFunction<Repository<Task>['findOneBy']>,
    create: jest.fn() as jest.MockedFunction<Repository<Task>['create']>,
    save: jest.fn() as jest.MockedFunction<Repository<Task>['save']>,
    remove: jest.fn() as jest.MockedFunction<Repository<Task>['remove']>,
    softRemove: jest.fn() as jest.MockedFunction<
      Repository<Task>['softRemove']
    >,
    recover: jest.fn() as jest.MockedFunction<Repository<Task>['recover']>,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTasksRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get<Repository<Task>>(getRepositoryToken(Task));

    // Очищаем все моки перед каждым тестом
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated tasks for user', async () => {
      const mockTasks = [mockTask];
      mockTasksRepository.findAndCount.mockResolvedValue([mockTasks, 1]);

      const result = await service.findAll(mockUser, {
        page: 1,
        limit: 20,
      });

      expect(result.data).toEqual(mockTasks);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(mockTasksRepository.findAndCount).toHaveBeenCalled();
    });

    it('should filter tasks by is_done', async () => {
      mockTasksRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(mockUser, {
        page: 1,
        limit: 20,
        is_done: true,
      });

      expect(mockTasksRepository.findAndCount).toHaveBeenCalled();
    });

    it('should search tasks by title', async () => {
      mockTasksRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(mockUser, {
        page: 1,
        limit: 20,
        search: 'test',
      });

      expect(mockTasksRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTask);

      const result = await service.findOne(1);

      expect(result).toEqual(mockTask);
    });

    it('should throw TaskNotFoundException if task not found', async () => {
      mockTasksRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(TaskNotFoundException);
    });

    it('should throw TaskNotFoundException if user tries to access another user task', async () => {
      const anotherUserTask = { ...mockTask, userId: 2 };
      mockTasksRepository.findOneBy.mockResolvedValue(anotherUserTask);

      await expect(service.findOne(1)).rejects.toThrow(TaskNotFoundException);
    });

    it('should allow user to access own task', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTask);

      const result = await service.findOne(1);

      expect(result).toEqual(mockTask);
    });
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const createTaskDto = {
        title: 'New Task',
        description: 'New Description',
      };

      const newTask = { ...mockTask, ...createTaskDto };
      mockTasksRepository.create.mockReturnValue(newTask);
      mockTasksRepository.save.mockResolvedValue(newTask);

      const result = await service.create(createTaskDto, mockUser);

      expect(result).toEqual(newTask);
      expect(mockTasksRepository.create).toHaveBeenCalledWith({
        ...createTaskDto,
        userId: mockUser.id,
        is_done: false,
      });
      expect(mockTasksRepository.save).toHaveBeenCalledWith(newTask);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateTaskDto = { title: 'Updated Title' };
      const updatedTask = { ...mockTask, ...updateTaskDto };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockTask);
      mockTasksRepository.save.mockResolvedValue(updatedTask);

      const result = await service.update(1, updateTaskDto, mockUser);

      expect(result).toEqual(updatedTask);
      expect(mockTasksRepository.save).toHaveBeenCalled();
    });

    it('should throw TaskNotFoundException if user tries to update another user task', async () => {
      const anotherUserTask = { ...mockTask, userId: 2 };
      mockTasksRepository.findOneBy.mockResolvedValue(anotherUserTask);

      await expect(
        service.update(1, { title: 'Hacked' }, mockUser),
      ).rejects.toThrow(TaskNotFoundException);
    });
  });

  describe('remove (soft delete)', () => {
    it('should soft delete a task', async () => {
      // Мокируем метод findOne сервиса напрямую
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTask);
      mockTasksRepository.softRemove.mockResolvedValue(mockTask);

      await service.remove(1, mockUser);

      expect(mockTasksRepository.softRemove).toHaveBeenCalledWith(mockTask);

      // Восстанавливаем оригинальную реализацию
      jest.restoreAllMocks();
    });

    it('should throw ForbiddenException if user tries to delete another user task', async () => {
      const anotherUserTask = { ...mockTask, userId: 2 };
      mockTasksRepository.findOneBy.mockResolvedValue(anotherUserTask);

      await expect(service.remove(1, mockUser)).rejects.toThrow(
        TaskNotFoundException,
      );
    });

    it('should throw TaskNotFoundException if task not found', async () => {
      mockTasksRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(999, mockUser)).rejects.toThrow(
        TaskNotFoundException,
      );
    });
  });

  describe('permanentlyRemove', () => {
    it('should permanently delete a task', async () => {
      mockTasksRepository.findOne.mockResolvedValue(mockTask);
      mockTasksRepository.remove.mockResolvedValue(mockTask);

      await service.permanentlyRemove(1, { ...mockUser, role: UserRole.ADMIN });

      expect(mockTasksRepository.remove).toHaveBeenCalledWith(mockTask);
    });
  });
});
