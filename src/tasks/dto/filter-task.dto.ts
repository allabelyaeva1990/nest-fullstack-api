import { IsOptional, IsBoolean, IsString, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FilterTaskDto {
  // Фильтр по статусу выполнения
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value as boolean;
  })
  is_done?: boolean;

  // Поиск по названию
  @IsOptional()
  @IsString({ message: 'search должен быть строкой' })
  search?: string;

  // Сортировка
  @IsOptional()
  @IsIn(['created_at', 'title', 'is_done'], {
    message: 'sortBy может быть: created_at, title, is_done',
  })
  sortBy?: 'created_at' | 'title' | 'is_done' = 'created_at';

  @IsOptional()
  @IsIn(['ASC', 'DESC'], {
    message: 'sortOrder может быть: ASC или DESC',
  })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
