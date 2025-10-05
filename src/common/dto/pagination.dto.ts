import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number) // Преобразует строку в число
  @IsInt({ message: 'Страница должна быть целым числом' })
  @Min(1, { message: 'Номер страницы должен быть минимум 1' })
  page?: number = 1; // По умолчанию страница 1

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Лимит должен быть целым числом' })
  @Min(1, { message: 'Лимит должен быть минимум 1' })
  @Max(100, { message: 'Максимальный лимит - 100 элементов' })
  limit?: number = 20; // По умолчанию 20 элементов
}
