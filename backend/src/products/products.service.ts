import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async findAll(query: ProductQueryDto) {
    // 1. Створюємо унікальний ключ для кешу на основі параметрів запиту
    const cacheKey = `products:${JSON.stringify(query)}`;

    try {
      // 2. Спроба отримати дані з Redis
      const cachedData = await this.cacheManager.get(cacheKey);
      if (cachedData) {
        console.log('--- [REDIS] Дані отримано з кешу ---');
        return cachedData;
      }
    } catch (error: any) {
      console.error('Помилка при зчитуванні з кешу:', error.message);
    }

    // 3. Якщо в кеші порожньо — робимо запит до БД
    try {
      console.log('--- [DEBUG] Даних у кеші немає. Виконую SQL запит... ---');
      
      const { 
        page = 1, 
        pageSize = 10, 
        sort = 'id', 
        order = 'desc', 
        categoryId, 
        minPrice, 
        maxPrice, 
        search 
      } = query;

      const queryBuilder = this.productRepo.createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category');

      // Фільтрація по категорії
      if (categoryId) {
        queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
      }
      
      // Фільтрація по ціні
      if (minPrice !== undefined) {
        queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
      }
      if (maxPrice !== undefined) {
        queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
      }
      
      // Пошук за назвою
      if (search) {
        queryBuilder.andWhere('product.name ILIKE :search', { search: `%${search}%` });
      }

      // Валідація полів сортування
      const allowedSortFields = ['id', 'name', 'price', 'stock', 'isActive'];
      const validSort = allowedSortFields.includes(sort) ? sort : 'id';
      
      queryBuilder.orderBy(`product.${validSort}`, order.toUpperCase() as 'ASC' | 'DESC');
      
      const skip = (page - 1) * pageSize;
      queryBuilder.skip(skip).take(pageSize);

      const [items, total] = await queryBuilder.getManyAndCount();

      const result = {
        items,
        meta: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      };

      // 4. Зберігаємо результат у Redis на 60 секунд (60000 мс)
      try {
        await this.cacheManager.set(cacheKey, result, 300); // спробуй 300 замість 60_000 
        console.log('--- [REDIS] Дані успішно закешовано на 60 секунд ---');
      } catch (error: any) {
        console.error('Помилка при записі в кеш:', error.message);
      }

      return result;
    } catch (error: any) {
      console.error('ПОМИЛКА БАЗИ ДАНИХ:', error.message);
      throw error; 
    }
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create({
      ...dto,
      categoryId: dto.categoryId
    });
    const savedProduct = await this.productRepo.save(product);
    await this.clearProductsCache(); // Очищуємо кеш при зміні даних
    return savedProduct;
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    
    const updated = await this.productRepo.save(product);
    await this.clearProductsCache(); // Очищуємо кеш при зміні даних
    return updated;
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepo.remove(product);
    await this.clearProductsCache(); // Очищуємо кеш при зміні даних
  }

  private async clearProductsCache() {
    try {
      // Використовуємо (as any), щоб уникнути помилки типізації в cache-manager v5+
      await (this.cacheManager as any).reset(); 
      console.log('--- [REDIS] Кеш очищено успішно ---');
    } catch (error: any) {
      console.error('Не вдалося очистити кеш:', error.message);
    }
  }
}