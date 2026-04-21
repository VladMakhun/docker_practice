import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Отримуємо список ролей, дозволених для цього методу/класу
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. Якщо @Roles() не встановлений, доступ дозволено (для всіх авторизованих)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 3. Отримуємо користувача з запиту (якого туди поклав JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // 4. Перевіряємо, чи має користувач одну з потрібних ролей
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}