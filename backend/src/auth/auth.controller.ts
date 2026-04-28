// backend/src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Реєстрація нового користувача' })
  @ApiResponse({ status: 201, description: 'Користувача успішно зареєстровано' })
  @ApiResponse({ status: 400, description: 'Помилка валідації або email вже зайнятий' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Авторизація та отримання JWT токена' })
  @ApiResponse({ status: 200, description: 'Успішний вхід, повертає токен' })
  @ApiResponse({ status: 401, description: 'Невірні дані для входу' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}