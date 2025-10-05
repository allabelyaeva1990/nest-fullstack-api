import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Response } from 'express';

export interface ApiResponse<T> {
  data: T | null;
  message: string;
  statusCode: number;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    // 1. Явно указываем, что это объект Response из Express
    const response = context.switchToHttp().getResponse<Response>();

    // 2. Теперь statusCode гарантированно имеет тип 'number'
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data: T) => ({
        data: data,
        message: 'Success',
        statusCode: statusCode,
      })),
    );
  }
}
