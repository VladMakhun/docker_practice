import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../categories/category.entity';

@Entity('products') 
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string; 

  @Column('decimal')
  price!: number;

  @Column({ default: 0 })
  stock!: number;

  @Column({ default: true })
  isActive!: boolean;

  // Зв'язок з категорією
  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoryId' }) // Явно вказуємо назву колонки в базі
  category?: Category;

  // Додаємо саму колонку для ключів (це допоможе уникнути помилки databaseName)
  @Column({ nullable: true })
  categoryId?: number;
}