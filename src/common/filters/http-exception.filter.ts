// src/http-exception.filter.ts

import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
interface NestErrorResponse {
  statusCode: number;
  message: string | string[]; // Может быть строкой или массивом строк
  error: string;
}
// Ловим все стандартные HTTP-исключения NestJS
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    // Явно типизируем ответ, чтобы ESLint был доволен
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Получаем оригинальный ответ ошибки
    const errorResponse = exception.getResponse() as NestErrorResponse;

    // Формируем унифицированный ответ для ошибки (соответствует API контракту)
    response.status(status).json({
      data: null, // Для ошибок поле data всегда null
      error: {
        // Используем либо 'error' из ответа (например, 'Bad Request'), либо имя исключения
        code: errorResponse.error || exception.name,
        message: errorResponse.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
      statusCode: status,
      message: 'Request failed', // Унифицированное сообщение о неудаче
    });
  }
}
