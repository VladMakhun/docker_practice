import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Якщо передали ключ (наприклад, 'id'), повертаємо user.id, інакше весь об'єкт
    return data ? user?.[data] : user;
  },
);