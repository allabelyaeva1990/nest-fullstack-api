import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateTaskDto {
  // @IsNotEmpty() - поле не может быть пустым
  // @IsString() - поле должно быть строкой
  @IsNotEmpty({ message: 'Название не может быть пустым' })
  @IsString({ message: 'Название должно быть строкой' })
  @MaxLength(255, { message: 'Название не может быть длиннее 255 символов' })
  title!: string;

  // @IsOptional() - поле не обязательно
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;
}
