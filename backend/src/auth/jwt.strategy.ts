// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service'; // Import UserService

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService, // Inject UserService
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    // Dùng ID (sub) từ payload để tìm user trong database
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      // Nếu không tìm thấy user (ví dụ: user đã bị xóa)
      throw new UnauthorizedException('User không tồn tại.');
    } // Best practice: Trả về thông tin user nhưng loại bỏ mật khẩu
    // eslint-disable-next-line @typescript-eslint/no-unused-vars

    const { password, ...result } = user.toObject(); // Đối tượng trả về từ đây sẽ được NestJS đính kèm vào request.user

    return result;
  }
}
