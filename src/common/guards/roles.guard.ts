import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/enums/user-role.enum';
import type { RequestWithUser } from '../interfaces/request.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Получаем требуемые роли из metadata
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Если роли не указаны - доступ разрешен
    if (!requiredRoles) {
      return true;
    }

    // Получаем пользователя из request с правильной типизацией
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // Если пользователя нет (AuthGuard не сработал) - запрещаем доступ
    if (!user) {
      return false;
    }

    // Проверяем, есть ли у пользователя нужная роль
    return requiredRoles.some((role) => user.role === role);
  }
}
