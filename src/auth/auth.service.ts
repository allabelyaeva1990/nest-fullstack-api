// src/auth/auth.service.ts (Фрагмент)

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../users/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // 1. Регистрация
  async signUp(email: string, password: string, role: UserRole): Promise<void> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    await this.usersService.create(email, hashedPassword, role);
  }

  // 2. Вход (Login)
  async signIn(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.usersService.findOneByEmail(email);

    // Сравниваем хешированный пароль
    if (user && (await bcrypt.compare(password, user.password))) {
      // Создаем JWT payload
      const payload = { email, sub: user.id, role: user.role };
      const accessToken = this.jwtService.sign(payload);
      return { accessToken };
    } else {
      throw new UnauthorizedException('Неверные учетные данные');
    }
  }
}
