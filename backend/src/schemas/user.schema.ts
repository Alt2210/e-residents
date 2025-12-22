import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string; // Lưu hash, không lưu plain text

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, enum: ['TO_TRUONG', 'TO_PHO', 'CAN_BO'] })
  role: string;

  @Prop([String])
  assignedModules: string[]; // Ví dụ: ['HK', 'NK', 'PHAN_ANH']
  
  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);