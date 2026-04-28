// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TrimPipe } from './common/pipes/trim.pipe';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter'; // Додано імпорт

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Підключення глобальних фільтрів (перехоплення помилок)
  app.useGlobalFilters(new HttpExceptionFilter());

  // Підключення глобальних інтерцепторів
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Підключення глобальних пайпів
  // TrimPipe має йти ПЕРЕД ValidationPipe
  app.useGlobalPipes(
    new TrimPipe(),
    new ValidationPipe({
      whitelist: true,           // Видаляє властивості, які не описані в DTO
      forbidNonWhitelisted: true, // Викидає помилку, якщо в запиті є зайві поля
      transform: true,           // Автоматично перетворює типи даних
    }),
  );

  const port = process.env.APP_PORT || 3000;

  await app.listen(port, '0.0.0.0');
}
bootstrap();