import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PersonDocument = Person & Document;

@Schema({ timestamps: true })
export class Person {
  @Prop({ required: true })
  hoTen: string;

  @Prop()
  biDanh: string;

  @Prop({ required: true })
  ngaySinh: Date;

  @Prop({ required: true, enum: ['Nam', 'Nữ', 'Khác'] })
  gioiTinh: string;

  @Prop()
  noiSinh: string;

  @Prop()
  nguyenQuan: string;

  @Prop()
  danToc: string;

  @Prop()
  tonGiao: string;

  @Prop({ default: 'Việt Nam' })
  quocTich: string;

  @Prop({ unique: true, sparse: true })
  soCCCD: string; // Unique index, có thể null

  @Prop()
  ngayCapCCCD: Date;

  @Prop()
  noiCapCCCD: string;

  @Prop()
  ngheNghiep: string;

  @Prop()
  noiLamViec: string;

  // Quan hệ với Hộ khẩu
  @Prop({ type: Types.ObjectId, ref: 'Household' })
  householdId: Types.ObjectId;

  @Prop()
  quanHeVoiChuHo: string; // Chủ hộ, Vợ, Con, ...

  @Prop({ type: Date })
  ngayDangKyThuongTru: Date;

  @Prop()
  diaChiThuongTruTruoc: string; // "Mới sinh" hoặc địa chỉ cũ

  // Trạng thái cư trú
  @Prop({ enum: ['THUONG_TRU', 'TAM_TRU', 'TAM_VANG', 'DA_CHUYEN_DI', 'DA_QUA_DOI'], default: 'THUONG_TRU' })
  trangThai: string;

  // Thông tin chuyển đi / qua đời
  @Prop({ type: Date })
  ngayChuyenDi: Date;

  @Prop()
  noiChuyenDen: string;

  @Prop({ type: Date })
  ngayQuaDoi: Date;
  
  @Prop()
  ghiChu: string;
}

export const PersonSchema = SchemaFactory.createForClass(Person);

// Tạo index cho tìm kiếm nhanh
PersonSchema.index({ hoTen: 'text', soCCCD: 1 });
PersonSchema.index({ householdId: 1 });