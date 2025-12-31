import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; // Thông báo của ai

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ enum: ['INFO', 'WARNING', 'SUCCESS', 'ERROR'], default: 'INFO' })
  type: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  link?: string; // Link để chuyển hướng khi click (nếu cần)
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);