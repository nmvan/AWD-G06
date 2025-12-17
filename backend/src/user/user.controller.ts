import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user') // Định nghĩa route prefix là /user
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register') // Endpoint là POST /user/register
  @HttpCode(HttpStatus.CREATED) // Trả về status 201 Created
  async register(@Body() registerUserDto: RegisterUserDto) {
    await this.userService.register(registerUserDto);
  }

  @UseGuards(JwtAuthGuard) // <-- 1. Áp dụng Guard
  @Get('me')
  getProfile(@Request() req) {
    // 2. Lấy user từ request (đã được JwtStrategy đính kèm)
    // req.user chính là object 'result' bạn trả về từ hàm validate()
    return req.user;
  }
}
