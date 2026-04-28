import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;
    const now = Date.now(); // Засікаємо час початку

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const ms = Date.now() - now; // Рахуємо різницю після виконання
        
        // Виводимо гарний лог: Метод Шлях — Статус — Час
        this.logger.log(
          `${method} ${url} — ${res.statusCode} — ${ms}ms`,
        );
      }),
    );
  }
}