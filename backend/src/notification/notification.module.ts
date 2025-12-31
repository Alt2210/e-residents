import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notification.service';
import { NotificationsController } from './notification.controller';
import { Notification, NotificationSchema } from '../schemas/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService], // Export để các module khác có thể dùng để bắn thông báo
})
export class NotificationsModule {}