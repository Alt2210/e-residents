import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Person, PersonDocument } from '../schemas/person.schema';
import { TemporaryResidence, TemporaryResidenceDocument } from '../schemas/temporary-residence.schema';
import { Absence, AbsenceDocument } from '../schemas/absence.schema';
import { Feedback, FeedbackDocument } from '../schemas/feedback.schema';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Person.name) private personModel: Model<PersonDocument>,
    @InjectModel(TemporaryResidence.name) private residenceModel: Model<TemporaryResidenceDocument>,
    @InjectModel(Absence.name) private absenceModel: Model<AbsenceDocument>,
    @InjectModel(Feedback.name) private feedbackModel: Model<FeedbackDocument>,
  ) {}

  // Thống kê nhân khẩu theo giới tính
  async getPopulationByGender(asOfDate?: Date) {
    const query: any = { trangThai: { $in: ['THUONG_TRU', 'TAM_TRU'] } };

    const result = await this.personModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$gioiTinh',
          count: { $sum: 1 },
        },
      },
    ]);

    const stats: any = { male: 0, female: 0, other: 0, total: 0 };

    result.forEach((item) => {
      if (item._id === 'Nam') {
        stats.male = item.count;
      } else if (item._id === 'Nữ') {
        stats.female = item.count;
      } else {
        stats.other += item.count;
      }
      stats.total += item.count;
    });

    return stats;
  }

  // Thống kê theo nhóm tuổi
  async getPopulationByAgeGroup(asOfDate?: Date) {
    const date = asOfDate || new Date();
    const query: any = { trangThai: { $in: ['THUONG_TRU', 'TAM_TRU'] } };

    const result = await this.personModel.aggregate([
      { $match: query },
      {
        $addFields: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [date, '$ngaySinh'] },
                365.25 * 24 * 60 * 60 * 1000,
              ],
            },
          },
        },
      },
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [0, 3, 6, 11, 15, 18, 60, 100],
          default: 'Other',
          output: {
            count: { $sum: 1 },
          },
        },
      },
    ]);

    // Map kết quả thành tên nhóm
    const ageGroups: any = {
      '0-2': 0, // Mầm non
      '3-5': 0, // Mẫu giáo
      '6-10': 0, // Cấp 1
      '11-14': 0, // Cấp 2
      '15-17': 0, // Cấp 3
      '18-59': 0, // Lao động
      '60+': 0, // Nghỉ hưu
    };

    result.forEach((item) => {
      if (item._id >= 0 && item._id < 3) ageGroups['0-2'] += item.count;
      else if (item._id >= 3 && item._id < 6) ageGroups['3-5'] += item.count;
      else if (item._id >= 6 && item._id < 11) ageGroups['6-10'] += item.count;
      else if (item._id >= 11 && item._id < 15) ageGroups['11-14'] += item.count;
      else if (item._id >= 15 && item._id < 18) ageGroups['15-17'] += item.count;
      else if (item._id >= 18 && item._id < 60) ageGroups['18-59'] += item.count;
      else if (item._id >= 60) ageGroups['60+'] += item.count;
    });

    return ageGroups;
  }

  // Thống kê biến động nhân khẩu theo khoảng thời gian
  async getChangesInPeriod(fromDate: Date, toDate: Date) {
    // Đếm nhân khẩu mới sinh (ngayDangKyThuongTru trong khoảng thời gian)
    const bornAdded = await this.personModel.countDocuments({
      ngayDangKyThuongTru: { $gte: fromDate, $lte: toDate },
      diaChiThuongTruTruoc: 'Mới sinh',
    });

    // Đếm nhân khẩu chuyển đi
    const movedOut = await this.personModel.countDocuments({
      ngayChuyenDi: { $gte: fromDate, $lte: toDate },
      trangThai: 'DA_CHUYEN_DI',
    });

    // Đếm nhân khẩu qua đời
    const deceased = await this.personModel.countDocuments({
      ngayQuaDoi: { $gte: fromDate, $lte: toDate },
      trangThai: 'DA_QUA_DOI',
    });

    // Đếm số hộ tách
    const households = await this.personModel.db.collection('households').find({
      'history.action': 'TACH_HO',
      'history.date': { $gte: fromDate, $lte: toDate },
    }).toArray();

    const splitHousehold = households.length;

    // Đếm số hộ đổi chủ hộ
    const headChanged = await this.personModel.db.collection('households').countDocuments({
      'history.action': 'DOI_CHU_HO',
      'history.date': { $gte: fromDate, $lte: toDate },
    });

    return {
      bornAdded,
      movedOut,
      deceased,
      splitHousehold,
      headChanged,
    };
  }

  // Thống kê tạm trú / tạm vắng
  async getAbsenceResidenceStats(fromDate: Date, toDate: Date) {
    const absencesIssued = await this.absenceModel.countDocuments({
      tuNgay: { $gte: fromDate, $lte: toDate },
    });

    const absencesActive = await this.absenceModel.countDocuments({
      trangThai: 'HIEU_LUC',
      denNgay: { $gte: new Date() },
    });

    const residencesIssued = await this.residenceModel.countDocuments({
      tuNgay: { $gte: fromDate, $lte: toDate },
    });

    const residencesActive = await this.residenceModel.countDocuments({
      trangThai: 'HIEU_LUC',
      denNgay: { $gte: new Date() },
    });

    return {
      absencesIssued,
      absencesActive,
      residencesIssued,
      residencesActive,
    };
  }

  // Thống kê kiến nghị theo trạng thái
  async getFeedbackByStatus(fromDate: Date, toDate: Date) {
    const result = await this.feedbackModel.aggregate([
      {
        $match: {
          ngayPhanAnh: { $gte: fromDate, $lte: toDate },
          mergedTo: { $exists: false },
        },
      },
      {
        $group: {
          _id: '$trangThai',
          count: { $sum: 1 },
        },
      },
    ]);

    const stats: any = {};
    result.forEach((item) => {
      stats[item._id] = item.count;
    });

    return stats;
  }
}
