import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Response } from 'express';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(429).json({
      data: null,
      error: {
        code: 'TooManyRequests',
        message:
          'Слишком много запросов. Пожалуйста, подождите и попробуйте снова.',
        timestamp: new Date().toISOString(),
      },
      statusCode: 429,
      message: 'Request failed',
    });
  }
}
