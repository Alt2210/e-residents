import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      // Thông báo lỗi chi tiết hơn
      if (info) {
        if (info.name === 'JsonWebTokenError') {
          throw new UnauthorizedException('Token không hợp lệ. Vui lòng đăng nhập lại.');
        }
        if (info.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Token đã hết hạn. Vui lòng đăng nhập lại.');
        }
        if (info.message === 'No auth token') {
          throw new UnauthorizedException('Chưa có token. Vui lòng đăng nhập và gửi kèm token trong header Authorization: Bearer <token>');
        }
      }
      throw err || new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
    }
    return user;
  }
}

