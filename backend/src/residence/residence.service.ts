import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TemporaryResidence, TemporaryResidenceDocument } from '../schemas/temporary-residence.schema';
import { Absence, AbsenceDocument } from '../schemas/absence.schema';
import { Person, PersonDocument } from '../schemas/person.schema';
import { IssueTemporaryResidenceDto, ExtendResidenceDto, CloseResidenceDto } from './dto/temporary-residence.dto';
import { IssueAbsenceDto, ExtendAbsenceDto, CloseAbsenceDto } from './dto/absence.dto';
import { TemporaryResidenceSearchDto, AbsenceSearchDto } from './dto/residence-search.dto';

@Injectable()
export class ResidenceService {
  constructor(
    @InjectModel(TemporaryResidence.name) private residenceModel: Model<TemporaryResidenceDocument>,
    @InjectModel(Absence.name) private absenceModel: Model<AbsenceDocument>,
    @InjectModel(Person.name) private personModel: Model<PersonDocument>,
  ) {}

  // ========== TẠM TRÚ ==========

  // Cấp giấy tạm trú
  async issueTemporaryResidence(dto: IssueTemporaryResidenceDto, issuedByUserId: Types.ObjectId): Promise<TemporaryResidenceDocument> {
    // Kiểm tra người có tồn tại
    const person = await this.personModel.findById(dto.personId).exec();
    if (!person) {
      throw new NotFoundException('Không tìm thấy nhân khẩu');
    }

    // Kiểm tra ngày hợp lệ
    if (new Date(dto.toDate) <= new Date(dto.fromDate)) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    }

    const residence = new this.residenceModel({
      ...dto,
      personId: new Types.ObjectId(dto.personId),
      tuNgay: dto.fromDate,
      denNgay: dto.toDate,
      diaChiTamTru: dto.stayingAddress,
      tuTinhThanh: dto.fromProvinceOrAddress,
      lyDo: dto.reason,
      issuedByUserId,
      trangThai: 'HIEU_LUC',
    });

    return residence.save();
  }

  // Gia hạn giấy tạm trú
  async extendResidence(recordId: string, dto: ExtendResidenceDto): Promise<TemporaryResidenceDocument> {
    const residence = await this.residenceModel.findById(recordId).exec();
    if (!residence) {
      throw new NotFoundException('Không tìm thấy giấy tạm trú');
    }

    if (residence.trangThai !== 'HIEU_LUC') {
      throw new BadRequestException('Chỉ có thể gia hạn giấy tạm trú đang hiệu lực');
    }

    residence.denNgay = dto.newToDate;
    if (dto.note) {
      residence.ghiChu = (residence.ghiChu || '') + `; Gia hạn: ${dto.note}`;
    }

    return residence.save();
  }

  // Kết thúc/đóng giấy tạm trú
  async closeResidence(recordId: string, dto: CloseResidenceDto): Promise<TemporaryResidenceDocument> {
    const residence = await this.residenceModel.findById(recordId).exec();
    if (!residence) {
      throw new NotFoundException('Không tìm thấy giấy tạm trú');
    }

    residence.trangThai = 'DA_DONG';
    if (dto.note) {
      residence.ghiChu = (residence.ghiChu || '') + `; Đóng: ${dto.note}`;
    }

    return residence.save();
  }

  // Tra cứu danh sách tạm trú
  async searchTemporaryResidence(searchDto: TemporaryResidenceSearchDto) {
    const { personId, fromDate, toDate, trangThai, page = 1, limit = 10 } = searchDto;
    const query: any = {};

    if (personId) {
      query.personId = new Types.ObjectId(personId);
    }

    if (trangThai) {
      query.trangThai = trangThai;
    } else {
      // Nếu không chỉ định, lọc tự động theo ngày hiệu lực
      const now = new Date();
      query.$or = [
        { trangThai: 'HIEU_LUC', denNgay: { $gte: now } },
        { trangThai: { $ne: 'HIEU_LUC' } },
      ];
    }

    if (fromDate || toDate) {
      query.$and = [];
      if (fromDate) {
        query.$and.push({ tuNgay: { $gte: new Date(fromDate) } });
      }
      if (toDate) {
        query.$and.push({ denNgay: { $lte: new Date(toDate) } });
      }
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.residenceModel.find(query).skip(skip).limit(limit).populate('personId', 'hoTen soCCCD').populate('issuedByUserId', 'username fullName').exec(),
      this.residenceModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ========== TẠM VẮNG ==========

  // Cấp giấy tạm vắng
  async issueAbsence(dto: IssueAbsenceDto, issuedByUserId: Types.ObjectId): Promise<AbsenceDocument> {
    const person = await this.personModel.findById(dto.personId).exec();
    if (!person) {
      throw new NotFoundException('Không tìm thấy nhân khẩu');
    }

    if (new Date(dto.toDate) <= new Date(dto.fromDate)) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    }

    const absence = new this.absenceModel({
      ...dto,
      personId: new Types.ObjectId(dto.personId),
      tuNgay: dto.fromDate,
      denNgay: dto.toDate,
      noiDen: dto.destination,
      lyDo: dto.reason,
      issuedByUserId,
      trangThai: 'HIEU_LUC',
    });

    return absence.save();
  }

  // Gia hạn giấy tạm vắng
  async extendAbsence(recordId: string, dto: ExtendAbsenceDto): Promise<AbsenceDocument> {
    const absence = await this.absenceModel.findById(recordId).exec();
    if (!absence) {
      throw new NotFoundException('Không tìm thấy giấy tạm vắng');
    }

    if (absence.trangThai !== 'HIEU_LUC') {
      throw new BadRequestException('Chỉ có thể gia hạn giấy tạm vắng đang hiệu lực');
    }

    absence.denNgay = dto.newToDate;
    if (dto.note) {
      absence.ghiChu = (absence.ghiChu || '') + `; Gia hạn: ${dto.note}`;
    }

    return absence.save();
  }

  // Kết thúc/đóng giấy tạm vắng
  async closeAbsence(recordId: string, dto: CloseAbsenceDto): Promise<AbsenceDocument> {
    const absence = await this.absenceModel.findById(recordId).exec();
    if (!absence) {
      throw new NotFoundException('Không tìm thấy giấy tạm vắng');
    }

    absence.trangThai = 'DA_DONG';
    if (dto.note) {
      absence.ghiChu = (absence.ghiChu || '') + `; Đóng: ${dto.note}`;
    }

    return absence.save();
  }

  // Tra cứu danh sách tạm vắng
  async searchAbsence(searchDto: AbsenceSearchDto) {
    const { personId, fromDate, toDate, trangThai, page = 1, limit = 10 } = searchDto;
    const query: any = {};

    if (personId) {
      query.personId = new Types.ObjectId(personId);
    }

    if (trangThai) {
      query.trangThai = trangThai;
    } else {
      const now = new Date();
      query.$or = [
        { trangThai: 'HIEU_LUC', denNgay: { $gte: now } },
        { trangThai: { $ne: 'HIEU_LUC' } },
      ];
    }

    if (fromDate || toDate) {
      query.$and = [];
      if (fromDate) {
        query.$and.push({ tuNgay: { $gte: new Date(fromDate) } });
      }
      if (toDate) {
        query.$and.push({ denNgay: { $lte: new Date(toDate) } });
      }
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.absenceModel.find(query).skip(skip).limit(limit).populate('personId', 'hoTen soCCCD').populate('issuedByUserId', 'username fullName').exec(),
      this.absenceModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

