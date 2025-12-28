import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop()
  method: string; // POST, PUT, DELETE, GET

  @Prop()
  url: string; // /api/households/...

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop()
  username: string; // Người thực hiện

  @Prop()
  action: string; // CREATE_HOUSEHOLD, UPDATE_PERSON, DELETE_FEEDBACK...

  @Prop({ type: Types.ObjectId })
  entityId: Types.ObjectId; // ID của entity bị thay đổi

  @Prop()
  entityType: string; // 'Household', 'Person', 'Feedback'...

  @Prop({ type: Object })
  oldValue: any; // Giá trị cũ (optional)

  @Prop({ type: Object })
  newValue: any; // Giá trị mới (optional)

  @Prop({ type: Object }) 
  body: any;

  @Prop({ type: Object })
  detail: any; // Chi tiết thêm

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });