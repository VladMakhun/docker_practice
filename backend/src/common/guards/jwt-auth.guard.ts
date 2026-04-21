import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request>();

    const token = this.extractToken(request);
    
    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }

    try {
      // Верифікуємо токен. Якщо він невалідний або прострочений, 
      // виникне помилка, яка перехопиться блоком catch
      const payload = this.jwtService.verify(token);
      
      // Прикріплюємо дані користувача до запиту
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractToken(request: Request): string | undefined {
    // Отримуємо заголовок Authorization
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    // Перевіряємо, чи починається він з 'Bearer'
    return type === 'Bearer' ? token : undefined;
  }
}