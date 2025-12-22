import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TemporaryResidenceDocument = TemporaryResidence & Document;

@Schema({ timestamps: true })
export class TemporaryResidence {
  @Prop({ type: Types.ObjectId, ref: 'Person', required: true })
  personId: Types.ObjectId;

  @Prop({ required: true })
  tuNgay: Date;

  @Prop({ required: true })
  denNgay: Date;

  @Prop()
  lyDo: string;

  @Prop()
  diaChiTamTru: string;

  @Prop()
  tuTinhThanh: string; // Tỉnh/Thành phố nơi đến từ

  @Prop({ type: Types.ObjectId, ref: 'User' })
  issuedByUserId: Types.ObjectId; // Người cấp giấy

  @Prop({ enum: ['HIEU_LUC', 'HET_HAN', 'DA_HUY', 'DA_DONG'], default: 'HIEU_LUC' })
  trangThai: string;

  @Prop()
  ghiChu: string;
}

export const TemporaryResidenceSchema = SchemaFactory.createForClass(TemporaryResidence);

TemporaryResidenceSchema.index({ personId: 1 });
TemporaryResidenceSchema.index({ tuNgay: 1, denNgay: 1 });