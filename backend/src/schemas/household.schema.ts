import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HouseholdDocument = Household & Document;

@Schema({ timestamps: true })
export class Household {
  @Prop({ required: true, unique: true })
  soHoKhau: string;

  @Prop({ type: Types.ObjectId, ref: 'Person' })
  chuHoId: Types.ObjectId; // Reference đến Person

  @Prop({ required: true })
  soNha: string;

  @Prop({ required: true })
  duongPho: string;

  @Prop({ required: true })
  phuong: string;

  @Prop({ required: true })
  quan: string;

  @Prop({ default: true })
  isActive: boolean; // Đóng/mở sổ hộ khẩu

  // Lịch sử biến động (Lưu dạng mảng embedded hoặc tách collection riêng nếu quá nhiều)
  @Prop([{
    action: String, // Tách hộ, đổi chủ hộ, thêm nhân khẩu, xóa nhân khẩu...
    date: Date,
    content: String,
    performedBy: { type: Types.ObjectId, ref: 'User' },
    detail: Object // Chi tiết thay đổi (JSON)
  }])
  history: Record<string, any>[];
}

export const HouseholdSchema = SchemaFactory.createForClass(Household);