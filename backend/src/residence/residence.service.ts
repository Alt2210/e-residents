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

  // ========== TẠM TRÚ (TEMPORARY RESIDENCE) ==========

  async issueTemporaryResidence(dto: IssueTemporaryResidenceDto, issuedByUserId: Types.ObjectId): Promise<TemporaryResidenceDocument> {
    const person = await this.personModel.findById(dto.personId).exec();
    if (!person) throw new NotFoundException('Không tìm thấy nhân khẩu');

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
      trangThai: dto.trangThai || 'CHO_DUYET',
    });

    return residence.save();
  }

  async extendResidence(recordId: string, dto: ExtendResidenceDto): Promise<TemporaryResidenceDocument> {
    const residence = await this.residenceModel.findById(recordId).exec();
    if (!residence) throw new NotFoundException('Không tìm thấy giấy tạm trú');

    if (residence.trangThai !== 'HIEU_LUC') {
      throw new BadRequestException('Chỉ có thể gia hạn giấy tạm trú đang hiệu lực');
    }

    residence.denNgay = dto.newToDate;
    if (dto.note) residence.ghiChu = (residence.ghiChu || '') + `; Gia hạn: ${dto.note}`;

    return residence.save();
  }

  async closeResidence(recordId: string, dto: CloseResidenceDto): Promise<TemporaryResidenceDocument> {
    const residence = await this.residenceModel.findById(recordId).exec();
    if (!residence) throw new NotFoundException('Không tìm thấy giấy tạm trú');

    residence.trangThai = 'DA_DONG';
    if (dto.note) residence.ghiChu = (residence.ghiChu || '') + `; Đóng: ${dto.note}`;

    return residence.save();
  }

  async searchTemporaryResidence(searchDto: TemporaryResidenceSearchDto) {
    const { personId, fromDate, toDate, trangThai, keyword, page = 1, limit = 10 } = searchDto;
    const query: any = {};

    if (keyword) {
      const isObjectId = Types.ObjectId.isValid(keyword);

      if (isObjectId) {
        // Kiểm tra xem keyword có phải là ID của chính bản ghi Tạm trú không
        const directRecord = await this.residenceModel.findById(keyword).exec();
        if (directRecord) {
          query._id = new Types.ObjectId(keyword);
        } else {
          // Nếu không phải ID bản ghi, tìm nhân khẩu có ID hoặc thông tin khớp keyword
          const persons = await this.personModel.find({
            $or: [
              { hoTen: { $regex: keyword, $options: 'i' } },
              { soCCCD: { $regex: keyword, $options: 'i' } },
              { _id: new Types.ObjectId(keyword) }
            ]
          }).select('_id').exec();
          query.personId = { $in: persons.map(p => p._id) };
        }
      } else {
        // Keyword là text bình thường (Tên hoặc CCCD)
        const persons = await this.personModel.find({
          $or: [
            { hoTen: { $regex: keyword, $options: 'i' } },
            { soCCCD: { $regex: keyword, $options: 'i' } }
          ]
        }).select('_id').exec();
        query.personId = { $in: persons.map(p => p._id) };
      }
    } else if (personId) {
      query.personId = new Types.ObjectId(personId);
    }

    if (trangThai) {
      query.trangThai = trangThai;
    }

    if (fromDate || toDate) {
      const dateQuery: any = {};
      if (fromDate) dateQuery.$gte = new Date(fromDate);
      if (toDate) dateQuery.$lte = new Date(toDate);
      query.tuNgay = dateQuery;
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.residenceModel.find(query).skip(skip).limit(limit)
        .populate('personId', 'hoTen soCCCD')
        .populate('issuedByUserId', 'username fullName').exec(),
      this.residenceModel.countDocuments(query).exec(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ========== TẠM VẮNG (ABSENCE) ==========

  async issueAbsence(dto: IssueAbsenceDto, issuedByUserId: Types.ObjectId): Promise<AbsenceDocument> {
    const person = await this.personModel.findById(dto.personId).exec();
    if (!person) throw new NotFoundException('Không tìm thấy nhân khẩu');

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
      trangThai: dto.trangThai || 'CHO_DUYET',
    });

    return absence.save();
  }

  async extendAbsence(recordId: string, dto: ExtendAbsenceDto): Promise<AbsenceDocument> {
    const absence = await this.absenceModel.findById(recordId).exec();
    if (!absence) throw new NotFoundException('Không tìm thấy giấy tạm vắng');

    if (absence.trangThai !== 'HIEU_LUC') {
      throw new BadRequestException('Chỉ có thể gia hạn giấy tạm vắng đang hiệu lực');
    }

    absence.denNgay = dto.newToDate;
    if (dto.note) absence.ghiChu = (absence.ghiChu || '') + `; Gia hạn: ${dto.note}`;

    return absence.save();
  }

  async closeAbsence(recordId: string, dto: CloseAbsenceDto): Promise<AbsenceDocument> {
    const absence = await this.absenceModel.findById(recordId).exec();
    if (!absence) throw new NotFoundException('Không tìm thấy giấy tạm vắng');

    absence.trangThai = 'DA_DONG';
    if (dto.note) absence.ghiChu = (absence.ghiChu || '') + `; Đóng: ${dto.note}`;

    return absence.save();
  }

  async searchAbsence(searchDto: AbsenceSearchDto) {
    const { personId, fromDate, toDate, trangThai, keyword, page = 1, limit = 10 } = searchDto;
    const query: any = {};

    if (keyword) {
      const isObjectId = Types.ObjectId.isValid(keyword);

      if (isObjectId) {
        // Kiểm tra xem keyword có phải là ID của chính bản ghi Tạm vắng không
        const directRecord = await this.absenceModel.findById(keyword).exec();
        if (directRecord) {
          query._id = new Types.ObjectId(keyword);
        } else {
          // Nếu không phải ID bản ghi, tìm nhân khẩu có ID hoặc thông tin khớp keyword
          const persons = await this.personModel.find({
            $or: [
              { hoTen: { $regex: keyword, $options: 'i' } },
              { soCCCD: { $regex: keyword, $options: 'i' } },
              { _id: new Types.ObjectId(keyword) }
            ]
          }).select('_id').exec();
          query.personId = { $in: persons.map(p => p._id) };
        }
      } else {
        // Keyword là text bình thường
        const persons = await this.personModel.find({
          $or: [
            { hoTen: { $regex: keyword, $options: 'i' } },
            { soCCCD: { $regex: keyword, $options: 'i' } }
          ]
        }).select('_id').exec();
        query.personId = { $in: persons.map(p => p._id) };
      }
    } else if (personId) {
      query.personId = new Types.ObjectId(personId);
    }

    if (trangThai) {
      query.trangThai = trangThai;
    }

    if (fromDate || toDate) {
      const dateQuery: any = {};
      if (fromDate) dateQuery.$gte = new Date(fromDate);
      if (toDate) dateQuery.$lte = new Date(toDate);
      query.tuNgay = dateQuery;
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.absenceModel.find(query).skip(skip).limit(limit)
        .populate('personId', 'hoTen soCCCD')
        .populate('issuedByUserId', 'username fullName').exec(),
      this.absenceModel.countDocuments(query).exec(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ========== CẬP NHẬT TRẠNG THÁI (DÙNG CHUNG) ==========

  async updateStatus(id: string, trangThai: string, type: 'temporary' | 'absence' = 'temporary') {
    const model = type === 'temporary' ? this.residenceModel : this.absenceModel;

    const record = await (model as Model<any>).findByIdAndUpdate(
      id,
      { $set: { trangThai } },
      { new: true },
    ).exec();

    if (!record) {
      throw new NotFoundException(`Không tìm thấy bản ghi ${type === 'temporary' ? 'tạm trú' : 'tạm vắng'}`);
    }

    return record;
  }
}