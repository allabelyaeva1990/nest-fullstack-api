// src/auth/auth.controller.ts

import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto'; // <-- ИМПОРТ DTO
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '../users/enums/user-role.enum';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 попытки в минуту
  async signUp(
    // Используем DTO и Pipe для валидации входящего тела запроса
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ message: string }> {
    await this.authService.signUp(
      authCredentialsDto.email,
      authCredentialsDto.password,
      authCredentialsDto.role ?? UserRole.USER,
    );
    return { message: 'Пользователь успешно зарегистрирован' };
  }

  // POST /auth/signin (Вход)
  @Post('/signin')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 попыток в минуту
  signIn(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(
      authCredentialsDto.email,
      authCredentialsDto.password,
    );
  }
}
