import {
  IsNotEmpty,
  IsEmail,
  IsStrongPassword,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { UserRole } from '../../users/enums/user-role.enum';

export class AuthCredentialsDto {
  // Email с полной валидацией
  @IsNotEmpty({ message: 'Email не может быть пустым' })
  @IsEmail({}, { message: 'Некорректный формат email' })
  email!: string;

  // Пароль с требованиями безопасности
  @IsStrongPassword()
  password!: string;

  @IsOptional()
  @IsEnum(UserRole, {
    message: 'Роль должна быть: user или admin',
  })
  role?: UserRole;
}
