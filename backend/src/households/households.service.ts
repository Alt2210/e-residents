import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Household, HouseholdDocument } from '../schemas/household.schema';
import { Person, PersonDocument } from '../schemas/person.schema';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { UpdateHouseholdDto } from './dto/update-household.dto';
import { ChangeHeadDto } from './dto/change-head.dto';
import { SplitHouseholdDto } from './dto/split-household.dto';
import { HouseholdSearchDto } from './dto/household-search.dto';

@Injectable()
export class HouseholdsService {
  constructor(
    @InjectModel(Household.name) private householdModel: Model<HouseholdDocument>,
    @InjectModel(Person.name) private personModel: Model<PersonDocument>,
  ) {}

  // Tạo sổ hộ khẩu mới
  async create(createHouseholdDto: CreateHouseholdDto, performedBy?: Types.ObjectId): Promise<HouseholdDocument> {
    // Kiểm tra số hộ khẩu đã tồn tại
    const existing = await this.householdModel.findOne({ soHoKhau: createHouseholdDto.soHoKhau }).exec();
    if (existing) {
      throw new BadRequestException('Số hộ khẩu đã tồn tại');
    }

    const household = new this.householdModel({
      ...createHouseholdDto,
      chuHoId: createHouseholdDto.chuHoId ? new Types.ObjectId(createHouseholdDto.chuHoId) : undefined,
      history: performedBy ? [{
        action: 'TAO_MOI',
        date: new Date(),
        content: 'Tạo sổ hộ khẩu mới',
        performedBy,
      }] : [], 
    });

    return household.save();
  }

  // Cập nhật thông tin hộ khẩu
  async update(householdId: string, updateHouseholdDto: UpdateHouseholdDto, performedBy?: Types.ObjectId): Promise<HouseholdDocument> {
    const household = await this.householdModel.findByIdAndUpdate(
      householdId,
      updateHouseholdDto,
      { new: true }
    ).exec();

    if (!household) {
      throw new NotFoundException('Không tìm thấy hộ khẩu');
    }

    // Ghi log
    if (performedBy) {
      household.history.push({
        action: 'CAP_NHAT',
        date: new Date(),
        content: 'Cập nhật thông tin hộ khẩu',
        performedBy,
        detail: updateHouseholdDto,
      });
      await household.save();
    }

    return household;
  }

  // Xóa/đóng sổ hộ khẩu
  async delete(householdId: string, performedBy?: Types.ObjectId): Promise<void> {
    const household = await this.householdModel.findById(householdId).exec();
    if (!household) {
      throw new NotFoundException('Không tìm thấy hộ khẩu');
    }

    household.isActive = false;
    if (performedBy) {
      household.history.push({
        action: 'DONG_SO',
        date: new Date(),
        content: 'Đóng sổ hộ khẩu',
        performedBy,
      });
    }
    await household.save();
  }

  // Đổi chủ hộ
  async changeHead(householdId: string, changeHeadDto: ChangeHeadDto, performedBy?: Types.ObjectId): Promise<HouseholdDocument> {
    const household = await this.householdModel.findById(householdId).exec();
    if (!household) {
      throw new NotFoundException('Không tìm thấy hộ khẩu');
    }

    // Kiểm tra người mới có trong hộ không
    const newHead = await this.personModel.findOne({
      _id: changeHeadDto.newHeadPersonId,
      householdId: new Types.ObjectId(householdId),
    }).exec();

    if (!newHead) {
      throw new BadRequestException('Người này không thuộc hộ khẩu này');
    }

    const oldHeadId = household.chuHoId;
    household.chuHoId = new Types.ObjectId(changeHeadDto.newHeadPersonId);

    // Cập nhật quan hệ của chủ hộ cũ và mới
    if (oldHeadId) {
      await this.personModel.updateOne(
        { _id: oldHeadId },
        { $set: { quanHeVoiChuHo: 'KHAC' } }
      );
    }
    await this.personModel.updateOne(
      { _id: changeHeadDto.newHeadPersonId },
      { $set: { quanHeVoiChuHo: 'CHỦ HỘ' } }
    );

    // Ghi log
    if (performedBy) {
      household.history.push({
        action: 'DOI_CHU_HO',
        date: changeHeadDto.changeDate,
        content: `Đổi chủ hộ từ ${oldHeadId} sang ${changeHeadDto.newHeadPersonId}`,
        performedBy,
        detail: { note: changeHeadDto.note },
      });
    }

    return household.save();
  }

  // Tách hộ
  async splitHousehold(sourceHouseholdId: string, splitDto: SplitHouseholdDto, performedBy?: Types.ObjectId) {
    const session = await this.householdModel.db.startSession();
    session.startTransaction();
    try {
      // Validate: Chủ hộ mới phải nằm trong danh sách tách
      if (!splitDto.selectedPersonIds.includes(splitDto.newHeadPersonId)) {
        throw new BadRequestException('Chủ hộ mới phải thuộc danh sách người chuyển đi');
      }

      // Kiểm tra số hộ khẩu mới chưa tồn tại
      const existing = await this.householdModel.findOne({ soHoKhau: splitDto.newSoHoKhau }).session(session).exec();
      if (existing) {
        throw new BadRequestException('Số hộ khẩu mới đã tồn tại');
      }

      // Kiểm tra các người được chọn có thuộc hộ cũ không
      const persons = await this.personModel.find({
        _id: { $in: splitDto.selectedPersonIds },
        householdId: new Types.ObjectId(sourceHouseholdId),
      }).session(session).exec();

      if (persons.length !== splitDto.selectedPersonIds.length) {
        throw new BadRequestException('Một số người không thuộc hộ khẩu này');
      }

      // Tạo hộ mới
      const newHousehold = new this.householdModel({
        soHoKhau: splitDto.newSoHoKhau,
        chuHoId: new Types.ObjectId(splitDto.newHeadPersonId),
        soNha: splitDto.newSoNha,
        duongPho: splitDto.newDuongPho,
        phuong: splitDto.newPhuong,
        quan: splitDto.newQuan,
        history: [{
          action: 'TAO_MOI_TU_TACH_HO',
          date: splitDto.splitDate || new Date(),
          content: `Tách từ hộ ${sourceHouseholdId}`,
          performedBy,
          detail: { note: splitDto.note },
        }],
      });
      await newHousehold.save({ session });

      // Cập nhật nhân khẩu: Đổi householdId sang hộ mới
      await this.personModel.updateMany(
        { _id: { $in: splitDto.selectedPersonIds } },
        { $set: { householdId: newHousehold._id } }
      ).session(session);

      // Cập nhật quan hệ của chủ hộ mới
      await this.personModel.updateOne(
        { _id: splitDto.newHeadPersonId },
        { $set: { quanHeVoiChuHo: 'CHỦ HỘ' } }
      ).session(session);

      // Ghi log vào hộ cũ
      await this.householdModel.updateOne(
        { _id: sourceHouseholdId },
        {
          $push: {
            history: {
              action: 'TACH_HO',
              date: splitDto.splitDate || new Date(),
              content: `Đã tách ${splitDto.selectedPersonIds.length} người sang hộ ${splitDto.newSoHoKhau}`,
              performedBy,
              detail: { newHouseholdId: newHousehold._id, note: splitDto.note },
            },
          },
        }
      ).session(session);

      await session.commitTransaction();
      return {
        success: true,
        newHouseholdId: newHousehold._id,
        movedPersonsCount: splitDto.selectedPersonIds.length,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Tra cứu hộ khẩu
  async search(searchDto: HouseholdSearchDto) {
    const { soHoKhau, chuHo, diaChi, keyword, page = 1, limit = 10 } = searchDto;
    const query: any = { isActive: true };

    if (soHoKhau) {
      query.soHoKhau = { $regex: soHoKhau, $options: 'i' };
    }

    if (diaChi) {
      query.$or = [
        { soNha: { $regex: diaChi, $options: 'i' } },
        { duongPho: { $regex: diaChi, $options: 'i' } },
        { phuong: { $regex: diaChi, $options: 'i' } },
        { quan: { $regex: diaChi, $options: 'i' } },
      ];
    }

    if (keyword) {
      query.$or = [
        { soHoKhau: { $regex: keyword, $options: 'i' } },
        { soNha: { $regex: keyword, $options: 'i' } },
        { duongPho: { $regex: keyword, $options: 'i' } },
        { phuong: { $regex: keyword, $options: 'i' } },
        { quan: { $regex: keyword, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    let households = await this.householdModel.find(query).skip(skip).limit(limit).exec();

    // Nếu có tìm theo tên chủ hộ
    if (chuHo) {
      const persons = await this.personModel.find({
        hoTen: { $regex: chuHo, $options: 'i' },
        quanHeVoiChuHo: 'CHỦ HỘ',
      }).exec();

      const householdIds = persons.map(p => p.householdId?.toString());
      households = households.filter(h => householdIds.includes(h._id.toString()));
    }

    const total = await this.householdModel.countDocuments(query).exec();

    // Populate thông tin chủ hộ
    households = await this.householdModel.populate(households, { path: 'chuHoId', select: 'hoTen' });

    return {
      data: households,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Xem chi tiết hộ khẩu
  async getDetail(householdId: string) {
    const household = await this.householdModel
      .findById(householdId)
      .populate('chuHoId')
      .exec();

    if (!household) {
      throw new NotFoundException('Không tìm thấy hộ khẩu');
    }

    // Lấy danh sách nhân khẩu trong hộ
    const persons = await this.personModel
      .find({ householdId: new Types.ObjectId(householdId) })
      .exec();

    return {
      household,
      persons,
    };
  }

  // Lấy lịch sử biến động của hộ
  async getHistory(householdId: string, fromDate?: Date, toDate?: Date) {
    const household = await this.householdModel.findById(householdId).exec();
    if (!household) {
      throw new NotFoundException('Không tìm thấy hộ khẩu');
    }

    let history = household.history || [];

    if (fromDate || toDate) {
      history = history.filter((item: any) => {
        const itemDate = new Date(item.date);
        if (fromDate && itemDate < fromDate) return false;
        if (toDate && itemDate > toDate) return false;
        return true;
      });
    }

    // Populate performedBy
    history = await this.householdModel.populate(history, { path: 'performedBy', select: 'username fullName' });

    return history;
  }
}