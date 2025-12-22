import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FeedbackDocument = Feedback & Document;

@Schema({ timestamps: true })
export class Feedback {
  @Prop()
  reporterPersonId: Types.ObjectId; // ID nhân khẩu (nếu có trong hệ thống)

  @Prop({ required: true })
  nguoiPhanAnh: string; // Tên người dân

  @Prop({ required: true })
  noiDung: string;

  @Prop({ type: Date, default: Date.now })
  ngayPhanAnh: Date;

  @Prop()
  phanLoai: string; // Vệ sinh, An ninh, Giao thông, ...

  @Prop({ enum: ['MOI_GHI_NHAN', 'DANG_XU_LY', 'DA_GIAI_QUYET', 'TAM_DUNG'], default: 'MOI_GHI_NHAN' })
  trangThai: string;
  
  @Prop()
  ghiChu: string;
  // Danh sách phản hồi từ cơ quan (có thể nhiều phản hồi)
  @Prop([{
    noiDung: String,
    ngayPhanHoi: Date,
    donViPhanHoi: String,
    handlerUserId: { type: Types.ObjectId, ref: 'User' }
  }])
  phanHoi: Array<{
    noiDung: string;
    ngayPhanHoi: Date;
    donViPhanHoi: string;
    handlerUserId?: Types.ObjectId;
  }>;

  // Gộp kiến nghị trùng (lưu danh sách feedback bị gộp)
  @Prop([{ type: Types.ObjectId, ref: 'Feedback' }])
  mergedFrom: Types.ObjectId[]; // Danh sách feedback ID đã gộp vào

  @Prop({ type: Types.ObjectId, ref: 'Feedback' })
  mergedTo: Types.ObjectId; // Nếu bị gộp vào feedback khác

  @Prop({ default: 1 })
  soLanPhanAnh: number; // Số lần phản ánh (tăng khi gộp)
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);

FeedbackSchema.index({ nguoiPhanAnh: 'text', noiDung: 'text' });
FeedbackSchema.index({ ngayPhanAnh: 1 });
FeedbackSchema.index({ trangThai: 1 });