import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './transform/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ThrottlerExceptionFilter } from './common/filters/throttler-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Применяем ФИЛЬТР: Ловит ВСЕ ошибки и унифицирует их в JSON-контракт ошибки.
  app.useGlobalFilters(
    new ThrottlerExceptionFilter(),
    new HttpExceptionFilter(),
  );

  // 2. Применяем ИНТЕРЦЕПТОР: Ловит ВСЕ успешные ответы и оборачивает их в 'data'.
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Удалять поля, которых нет в DTO
      forbidNonWhitelisted: true, // Выбрасывать ошибку при лишних полях
      transform: true, // Автоматически преобразовывать типы
      transformOptions: {
        enableImplicitConversion: true, // '123' → 123 автоматически
      },
    }),
  );

  app.enableCors();

  // Применить миграции
  const dataSource = app.get(DataSource);
  await dataSource.runMigrations();
  console.log('Migrations applied');

  await app.listen(3000);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
