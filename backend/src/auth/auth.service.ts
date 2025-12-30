import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  // Kiểm tra thông tin đăng nhập
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user.toObject(); // Loại bỏ password khi trả về
      return result;
    }
    return null;
  }

  // Hàm login: Trả về Token
  async login(user: any) {
    const payload = { username: user.username, sub: user._id, role: user.role, soCCCD: user.soCCCD };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        soCCCD: user.soCCCD
      }
    };
  }
}