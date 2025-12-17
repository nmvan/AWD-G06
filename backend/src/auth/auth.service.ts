import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service'; // Changed from 'src/user/user.service'
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { InjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { LinkedAccount, LinkedAccountDocument } from './linked-account.schema';
import { Model } from 'mongoose';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService, // <--- 2. Inject UserService
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectModel(LinkedAccount.name)
    private linkedAccountModel: Model<LinkedAccountDocument>,
    private mailService: MailService,
  ) {}

  async login(loginDto: LoginUserDto) {
    // 1. Tìm user
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // 2. So sánh mật khẩu
    const isPasswordMatching = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    return this.generateTokens(user);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken,
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
        },
      );

      const accessTokenPayload = { sub: payload.sub, email: payload.email };
      const accessToken = await this.jwtService.signAsync(accessTokenPayload);
      return { accessToken };
    } catch (e) {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }
  }

  private async generateTokens(user: any) {
    const payload = { email: user.email, sub: user.id }; // 'sub' là viết tắt của 'subject', thường dùng để lưu ID

    const [accessToken, refreshToken] = await Promise.all([
      // Access Token
      this.jwtService.signAsync(payload), // Dùng secret và thời hạn mặc định (JWT_SECRET, 15m)

      // Refresh Token
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'), // Dùng secret riêng
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRATION'), // Dùng thời hạn riêng (7d)
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async loginWithGoogle(code: string) {
    if (!code) {
      throw new BadRequestException('Authorization code is required');
    }

    try {
      const tokenUrl = 'https://oauth2.googleapis.com/token';
      const googleRes = await axios.post(
        tokenUrl,
        {
          code,
          client_id: this.configService.get('GOOGLE_CLIENT_ID'),
          client_secret: this.configService.get('GOOGLE_CLIENT_SECRET'),
          redirect_uri: this.configService.get('GOOGLE_REDIRECT_URI'),
          grant_type: 'authorization_code',
        },
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      const { access_token, refresh_token, id_token } = googleRes.data;

      // Decode id_token để lấy info user
      const googleUser: any = jwtDecode(id_token);
      const { sub: googleId, email, name, picture } = googleUser;

      let linkedAccount = await this.linkedAccountModel.findOne({
        provider: 'google',
        providerId: googleId,
      });

      let user;

      if (linkedAccount) {
        // Case A: Đã link trước đó -> Lấy user ra
        user = await this.userService.findById(linkedAccount.user.toString());

        linkedAccount.accessToken = access_token;
        if (refresh_token) linkedAccount.refreshToken = refresh_token;
        await linkedAccount.save();
      } else {
        // Case B: Chưa link -> Check xem email đã có trong bảng User chưa
        user = await this.userService.findByEmail(email);

        if (!user) {
          user = await this.userService.createByGoogle(email, name, picture);
        }

        await this.linkedAccountModel.create({
          user: user._id,
          provider: 'google',
          providerId: googleId,
          accessToken: access_token,
          refreshToken: refresh_token,
        });
      }

      this.mailService
        .syncEmailsForUser(user._id.toString())
        .then(() =>
          console.log(`[Initial Sync] Started for user ${user.email}`),
        )
        .catch((err) => console.error(`[Initial Sync] Error:`, err));

      return this.generateTokens(user);
    } catch (error) {
      console.error('============ GOOGLE ERROR LOG ============');
      console.error('Status:', error.response?.status);
      console.error('Data:', JSON.stringify(error.response?.data));
      console.error(
        'Config Redirect URI:',
        this.configService.get('GOOGLE_REDIRECT_URI'),
      ); // In luôn cái URI đang dùng ra xem đúng không
      console.error('==========================================');
      throw new UnauthorizedException('Google authentication failed');
    }
  }
}
