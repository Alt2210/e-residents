import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AbsenceDocument = Absence & Document;

@Schema({ timestamps: true })
export class Absence {
  @Prop({ type: Types.ObjectId, ref: 'Person', required: true })
  personId: Types.ObjectId;

  @Prop({ required: true })
  tuNgay: Date;

  @Prop({ required: true })
  denNgay: Date;

  @Prop()
  lyDo: string;

  @Prop()
  noiDen: string; // Nơi tạm vắng đến

  @Prop({ type: Types.ObjectId, ref: 'User' })
  issuedByUserId: Types.ObjectId; // Người cấp giấy

  @Prop({ enum: ['HIEU_LUC', 'HET_HAN', 'DA_HUY', 'DA_DONG', 'CHO_DUYET'], default: 'CHO_DUYET' })
  trangThai: string;

  @Prop()
  ghiChu: string;
}

export const AbsenceSchema = SchemaFactory.createForClass(Absence);

AbsenceSchema.index({ personId: 1 });
AbsenceSchema.index({ tuNgay: 1, denNgay: 1 });

