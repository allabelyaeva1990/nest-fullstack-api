// src/users/users.controller.ts

import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // Встроенный Guard для JWT
import { UsersService } from './users.service';
import { Request } from 'express'; // Используем Express Request для получения объекта user
import { User } from './entities/user.entity';

// Интерфейс для расширения объекта запроса, который возвращает JWT Guard
interface RequestWithUser extends Request {
  user: User;
}

@Controller('users') // Базовый путь: /users
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/me
   * Получает информацию о текущем аутентифицированном пользователе.
   * Защищен JWT Guard. Объект пользователя добавляется в request.user
   * после успешной проверки токена.
   */
  @UseGuards(AuthGuard('jwt')) // Защищаем маршрут
  @Get('me') // Полный маршрут: GET /users/me
  async getMe(@Req() req: RequestWithUser): Promise<Omit<User, 'password'>> {
    const userId = req.user.id;

    // Явно загружаем свежие данные из БД
    const user = await this.usersService.findOneById(userId);
    const { password, ...result } = user;

    return result;
  }
}
