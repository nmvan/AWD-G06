import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './user.schema';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService, // 2. Inject JwtService
  ) { }

  async register(registerUserDto: RegisterUserDto): Promise<UserDocument> {
    const { email, password } = registerUserDto;

    // 1. Check for existing email
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      // 2. Error Handling: Trả về lỗi rõ ràng
      throw new ConflictException('Email already exists');
    }

    // 3. Hash passwords before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create new user
    const createdUser = new this.userModel({
      email,
      password: hashedPassword,
      // createdAt sẽ tự động thêm vào [cite: 13]
    });

    return createdUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async createByGoogle(email: string, name: string, avatar: string): Promise<UserDocument> {
    // random pass
    const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      name,
      avatar,
    });

    return newUser.save();
  }
}
