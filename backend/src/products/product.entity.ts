import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Category } from '../categories/category.entity';

// Додано ім'я таблиці явно, щоб уникнути помилки 500 (relation "product" does not exist)
@Entity('products') 
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  // Використовуємо ?, бо поле nullable
  @Column({ nullable: true })
  description?: string; 

  @Column('decimal')
  price!: number;

  @Column({ default: 0 })
  stock!: number;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category?: Category; // Також краще ?, бо nullable: true
}