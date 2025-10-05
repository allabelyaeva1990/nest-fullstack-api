import { IntersectionType } from '@nestjs/mapped-types';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { FilterTaskDto } from './filter-task.dto';

// Объединяем два DTO в один
export class QueryTaskDto extends IntersectionType(
  PaginationDto,
  FilterTaskDto,
) {}
