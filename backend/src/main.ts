// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TrimPipe } from './common/pipes/trim.pipe'; // Імпорт твого нового пайпа

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Підключення глобальних пайпів
  // TrimPipe має йти ПЕРЕД ValidationPipe
  app.useGlobalPipes(
    new TrimPipe(),
    new ValidationPipe({
      whitelist: true,          // Видаляє властивості, які не описані в DTO
      forbidNonWhitelisted: true, // Викидає помилку, якщо в запиті є зайві поля
      transform: true,          // Автоматично перетворює типи даних
    }),
  );

  const port = process.env.APP_PORT || 3000;

  await app.listen(port, '0.0.0.0');
}
bootstrap();