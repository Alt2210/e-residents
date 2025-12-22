import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../../schemas/audit-log.schema';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(@InjectModel(AuditLog.name) private logModel: Model<AuditLogDocument>) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;

    // Chỉ log các thao tác thay đổi dữ liệu
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle().pipe(
        tap(async () => {
          // Ghi vào DB sau khi request xử lý thành công
          await this.logModel.create({
            method,
            url,
            username: user ? user.username : 'Guest',
            body: body, // Cẩn thận lọc field password nếu log login
            timestamp: new Date(),
          });
        }),
      );
    }
    return next.handle();
  }
}