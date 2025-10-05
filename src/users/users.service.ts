import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    // Инжектируем репозиторий User для взаимодействия с таблицей users
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Создает нового пользователя в базе данных.
   * @param email - Электронная почта пользователя (должна быть уникальной).
   * @param password - Хешированный пароль пользователя (хеширование происходит в AuthService).
   * @returns Созданный объект пользователя.
   */
  async create(email: string, password: string, role: UserRole): Promise<User> {
    // 1. Проверяем, существует ли пользователь с таким email
    const existingUser = await this.findOneByEmail(email);

    if (existingUser) {
      // Если пользователь уже существует, кидаем ConflictException (409 Conflict)
      throw new ConflictException('Пользователь с таким email уже существует.');
    }

    // 2. Создаем и сохраняем нового пользователя
    const user = this.usersRepository.create({
      email,
      password,
      role,
    });

    try {
      await this.usersRepository.save(user);
      return user;
    } catch (error) {
      // Если вдруг возникла другая ошибка БД (хотя мы уже проверили email), можно ее обработать
      throw new Error('Не удалось сохранить пользователя.');
    }
  }

  /**
   * Находит пользователя по email. Критически важно для процесса входа (signIn).
   * @param email - Электронная почта для поиска.
   * @returns Найденный объект User или null.
   */
  async findOneByEmail(email: string): Promise<User | null> {
    // Используем .findOne() с условием, чтобы получить хеш пароля.
    // По умолчанию в entity мы установили { select: false } для поля password,
    // но для аутентификации нам нужно его получить.
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role'], // Явно указываем, что нам нужно поле password
    });
  }

  /**
   * Находит пользователя по ID. Используется в JwtStrategy.
   * @param id - ID пользователя.
   * @returns Найденный объект User.
   */
  async findOneById(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден.`);
    }
    return user;
  }
}
