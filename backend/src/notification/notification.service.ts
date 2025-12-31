import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from '../schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(@InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>) {}

  // Lấy danh sách thông báo của user
  async getUserNotifications(userId: string) {
    return this.notificationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 }) // Mới nhất lên đầu
      .exec();
  }

  // Đánh dấu đã đọc
  async markAsRead(id: string, userId: string) {
    const notif = await this.notificationModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId) },
      { isRead: true },
      { new: true }
    );
    if (!notif) throw new NotFoundException('Không tìm thấy thông báo');
    return notif;
  }

  // Đánh dấu tất cả đã đọc
  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true }
    );
    return { success: true };
  }

  // Hàm tạo thông báo (để gọi từ các module khác)
  async create(userId: string, title: string, message: string, type: string = 'INFO') {
    return this.notificationModel.create({
      userId: new Types.ObjectId(userId),
      title,
      message,
      type
    });
  }
}