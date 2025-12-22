import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../../schemas/audit-log.schema';

@Injectable()
export class AuditLogService {
  constructor(@InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>) {}

  // Ghi log thao tác
  async createLog(
    entityType: string,
    entityId: Types.ObjectId | string,
    action: string,
    performedBy: Types.ObjectId,
    detail?: any,
    oldValue?: any,
    newValue?: any,
  ): Promise<void> {
    const log = new this.auditLogModel({
      entityType,
      entityId: typeof entityId === 'string' ? new Types.ObjectId(entityId) : entityId,
      action,
      userId: performedBy,
      username: '', // Có thể populate từ User nếu cần
      oldValue,
      newValue,
      detail,
      timestamp: new Date(),
    });

    await log.save();
  }

  // Xem lịch sử của một entity
  async getHistory(entityType: string, entityId: string, fromDate?: Date, toDate?: Date) {
    const query: any = {
      entityType,
      entityId: new Types.ObjectId(entityId),
    };

    if (fromDate || toDate) {
      query.timestamp = {};
      if (fromDate) query.timestamp.$gte = fromDate;
      if (toDate) query.timestamp.$lte = toDate;
    }

    return this.auditLogModel.find(query).sort({ timestamp: -1 }).populate('userId', 'username fullName').exec();
  }
}

