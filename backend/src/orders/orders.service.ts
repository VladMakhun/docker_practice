import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from 'src/products/product.entity';
import { User } from 'src/users/user.entity';

import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { OrderStatus } from 'src/common/enums/order-status.enum'; 
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  // ==========================================
  // ВПРАВА 4: ТРАНЗАКЦІЙНЕ СТВОРЕННЯ ЗАМОВЛЕННЯ
  // ==========================================
  async create(dto: CreateOrderDto, user: User): Promise<Order> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      let totalPrice = 0;
      const orderItems: OrderItem[] = [];

      for (const item of dto.items) {
        const product = await qr.manager.findOne(Product, {
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`Продукт #${item.productId} не знайдено`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Недостатньо товару "${product.name}" на складі: доступно ${product.stock}, запитувано ${item.quantity}`,
          );
        }

        product.stock -= item.quantity;
        await qr.manager.save(product);

        const orderItem = qr.manager.create(OrderItem, {
          product,
          quantity: item.quantity,
          price: product.price,
        });
        orderItems.push(orderItem);

        totalPrice += Number(product.price) * item.quantity;
      }

      const order = qr.manager.create(Order, {
        user,
        items: orderItems,
        totalPrice,
        status: OrderStatus.PENDING,
      });

      const savedOrder = await qr.manager.save(order);
      await qr.commitTransaction();
      await this.clearProductsCache();

      return savedOrder;
    } catch (error) {
      await qr.rollbackTransaction();
      throw error;
    } finally {
      await qr.release();
    }
  }

  // ==========================================
  // ВПРАВА 5: OWNERSHIP CHECK & QUERY BUILDER
  // ==========================================
  async findAll(
    query: OrderQueryDto,
    userId: number,
    userRole: Role,
  ): Promise<Order[]> {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.product', 'product')
      .leftJoinAndSelect('order.user', 'user');

    if (userRole !== Role.ADMIN) {
      qb.andWhere('order.userId = :userId', { userId });
    }

    if (query.status) {
      qb.andWhere('order.status = :status', { status: query.status });
    }

    qb.orderBy('order.createdAt', 'DESC');

    const queryAny = query as any;
    const page = queryAny.page ? Number(queryAny.page) : 1;
    const limit = queryAny.limit ? Number(queryAny.limit) : 10;
    const skip = (page - 1) * limit;

    qb.skip(skip).take(limit);

    return qb.getMany();
  }

  async findOne(
    id: number,
    userId: number,
    userRole: Role,
  ): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'items.product', 'user'],
    });

    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    if (userRole !== Role.ADMIN && order.user.id !== userId) {
      throw new ForbiddenException('You can only view your own orders');
    }

    return order;
  }

  // ==========================================
  // ВПРАВА 6: ЗМІНА СТАТУСУ ТА ПОВЕРНЕННЯ СТОКУ
  // ==========================================
  async updateStatus(id: number, dto: UpdateOrderStatusDto): Promise<Order> {
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    // Завантажуємо замовлення разом із позиціями (items)
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(`Замовлення №${id} не знайдено`);
    }

    const currentStatus = order.status;
    const nextStatus = dto.status;

    if (currentStatus === nextStatus) {
      return order;
    }

    const allowed = allowedTransitions[currentStatus] || [];
    if (!allowed.includes(nextStatus)) {
      throw new BadRequestException(
        `Зміна статусу з "${currentStatus}" на "${nextStatus}" заборонена. Дозволені варіанти: ${allowed.join(', ') || 'немає'}`,
      );
    }

    // БОНУС: Повернення товару на склад при скасуванні (CANCELLED)
    if (nextStatus === OrderStatus.CANCELLED) {
      const qr = this.dataSource.createQueryRunner();
      await qr.connect();
      await qr.startTransaction();

      try {
        // Проходимо по кожному item та шукаємо продукт за його productId згідно структури сутності
        for (const item of order.items) {
          const itemAny = item as any;
          const pId = itemAny.productId || (itemAny.product ? itemAny.product.id : null);

          if (pId) {
            const product = await qr.manager.findOne(Product, { where: { id: pId } });
            if (product) {
              product.stock += item.quantity;
              await qr.manager.save(product);
            }
          }
        }

        order.status = nextStatus;
        const savedOrder = await qr.manager.save(order);

        await qr.commitTransaction();
        await this.clearProductsCache();

        return savedOrder;
      } catch (error) {
        await qr.rollbackTransaction();
        throw error;
      } finally {
        await qr.release();
      }
    }

    order.status = nextStatus;
    return this.orderRepo.save(order);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const order = await this.orderRepo.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Замовлення №${id} не знайдено`);
    }

    await this.orderRepo.remove(order);
    return { deleted: true };
  }

  private async clearProductsCache() {
    try {
      const cacheManagerAny = this.cacheManager as any;
      let keys: string[] = [];

      if (typeof cacheManagerAny.keys === 'function') {
        keys = await cacheManagerAny.keys();
      } 
      else if (cacheManagerAny.store && typeof cacheManagerAny.store.keys === 'function') {
        keys = await cacheManagerAny.store.keys('products:*');
        if (keys && keys.length > 0) {
          await Promise.all(keys.map((k) => this.cacheManager.del(k)));
          return;
        }
      }

      const productKeys = keys.filter(key => key.startsWith('products:'));

      if (productKeys.length > 0) {
        await Promise.all(productKeys.map((k) => this.cacheManager.del(k)));
      }
    } catch (err) {
      console.error('Помилка при очищенні кешу продуктів:', err);
    }
  }
}