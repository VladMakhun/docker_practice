// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TrimPipe } from './common/pipes/trim.pipe';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Глобальні фільтри: перехоплення та стандартизація помилок
  app.useGlobalFilters(new HttpExceptionFilter());

  // 2. Глобальні інтерцептори: логування та перетворення успішних відповідей
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // 3. Глобальні пайпи: очищення даних та валідація
  app.useGlobalPipes(
    new TrimPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 4. Swagger документація
  const config = new DocumentBuilder()
    .setTitle('MiniShop API')
    .setDescription('REST API для навчального інтернет-магазину. Автентифікація через JWT Bearer token.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.APP_PORT || 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();