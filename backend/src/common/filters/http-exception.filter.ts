import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Генеруємо випадковий traceId, щоб уникнути проблем з crypto
    const traceId = Math.random().toString(36).substring(2, 10);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      message = typeof body === 'string' ? body : (body as any).message || 'Error occurred';
    }

    this.logger.error(`[${traceId}] ${request.method} ${request.url} — ${status} — ${message}`);

    response.status(status).json({
      error: {
        code: status,
        message,
        traceId,
      },
      timestamp: new Date().toISOString(),
    });
  }
}