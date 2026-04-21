import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { AuthModule } from '../auth/auth.module'; // 1. Додай імпорт AuthModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    AuthModule, // 2. Додай AuthModule сюди
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}