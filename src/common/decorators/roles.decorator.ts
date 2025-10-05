import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/enums/user-role.enum';

export const ROLES_KEY = 'roles';

// Декоратор для указания требуемых ролей
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
