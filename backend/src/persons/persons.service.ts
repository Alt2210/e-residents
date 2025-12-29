import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Person, PersonDocument } from '../schemas/person.schema';
import { CreatePersonDto } from './dto/create-person.dto';
import { NewbornDto } from './dto/newborn.dto';
import { MarkMovedDto } from './dto/mark-moved.dto';
import { MarkDeceasedDto } from './dto/mark-deceased.dto';
import { PersonSearchDto } from './dto/person-search.dto';
import { Household, HouseholdDocument } from '../schemas/household.schema';

@Injectable()
export class PersonsService {
  constructor(
    @InjectModel(Person.name) private personModel: Model<PersonDocument>,
    @InjectModel(Household.name) private householdModel: Model<HouseholdDocument>,
  ) {}

  // Thêm nhân khẩu mới (sinh con)
  async addNewborn(newbornDto: NewbornDto): Promise<PersonDocument> {
    // Kiểm tra hộ khẩu tồn tại
    const household = await this.householdModel.findById(newbornDto.householdId).exec();
    if (!household) {
      throw new NotFoundException('Không tìm thấy hộ khẩu');
    }

    const person = new this.personModel({
      ...newbornDto,
      householdId: new Types.ObjectId(newbornDto.householdId),
      diaChiThuongTruTruoc: 'Mới sinh',
      trangThai: 'THUONG_TRU',
      // Không có nghề nghiệp và CCCD cho trẻ mới sinh
      ngheNghiep: undefined,
      soCCCD: undefined,
    });

    return person.save();
  }

  // Thêm nhân khẩu thường (nhập hộ)
  async create(createPersonDto: any): Promise<PersonDocument> {
    // 1. Tìm hộ khẩu dựa trên số hộ khẩu (soHoKhau) thay vì ID
    const household = await this.householdModel.findOne({ 
      soHoKhau: createPersonDto.householdId 
    }).exec();

    if (!household) {
      throw new NotFoundException(`Không tìm thấy hộ khẩu có số: ${createPersonDto.householdId}`);
    }

    // 2. Kiểm tra CCCD unique
    if (createPersonDto.soCCCD) {
      const existing = await this.personModel.findOne({ soCCCD: createPersonDto.soCCCD }).exec();
      if (existing) {
        throw new BadRequestException('Số CCCD đã tồn tại');
      }
    }

    // 3. Gán lại ID thực sự của MongoDB vào dữ liệu trước khi lưu
    const person = new this.personModel({
      ...createPersonDto,
      householdId: household._id, // Lấy ID hệ thống từ hộ khẩu vừa tìm được
      trangThai: 'THUONG_TRU',
    });

    return person.save();
  }

  // Cập nhật thông tin nhân khẩu
  async update(id: string, updatePersonDto: Partial<CreatePersonDto>): Promise<PersonDocument> {
    // Nếu cập nhật CCCD, kiểm tra unique
    if (updatePersonDto.soCCCD) {
      const existing = await this.personModel.findOne({
        soCCCD: updatePersonDto.soCCCD,
        _id: { $ne: id },
      }).exec();
      if (existing) {
        throw new BadRequestException('Số CCCD đã tồn tại');
      }
    }

    const updated = await this.personModel.findByIdAndUpdate(id, updatePersonDto, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException('Không tìm thấy nhân khẩu');
    }
    return updated;
  }

  // Ghi nhận nhân khẩu chuyển đi
  async markMoved(id: string, markMovedDto: MarkMovedDto): Promise<PersonDocument> {
    const person = await this.personModel.findById(id).exec();
    if (!person) {
      throw new NotFoundException('Không tìm thấy nhân khẩu');
    }

    person.trangThai = 'DA_CHUYEN_DI';
    person.ngayChuyenDi = markMovedDto.moveDate;
    person.noiChuyenDen = markMovedDto.moveTo;
    person.ghiChu = markMovedDto.note || 'Đã chuyển đi';

    return person.save();
  }

  // Ghi nhận nhân khẩu qua đời
  async markDeceased(id: string, markDeceasedDto: MarkDeceasedDto): Promise<PersonDocument> {
    const person = await this.personModel.findById(id).exec();
    if (!person) {
      throw new NotFoundException('Không tìm thấy nhân khẩu');
    }

    person.trangThai = 'DA_QUA_DOI';
    person.ngayQuaDoi = markDeceasedDto.date;
    person.ghiChu = markDeceasedDto.note || 'Đã qua đời';

    return person.save();
  }

  // Xóa/đóng hồ sơ nhân khẩu (soft delete - không thực sự xóa)
  async delete(id: string): Promise<void> {
    const person = await this.personModel.findById(id).exec();
    if (!person) {
      throw new NotFoundException('Không tìm thấy nhân khẩu');
    }

    // Có thể đánh dấu là không còn quản lý hoặc xóa khỏi hộ
    // Tùy vào yêu cầu nghiệp vụ, có thể xóa khỏi householdId
    person.trangThai = 'DA_CHUYEN_DI';
    person.ghiChu = 'Ngừng quản lý';
    await person.save();
  }

  // Tra cứu/tìm kiếm nhân khẩu
  async search(searchDto: PersonSearchDto) {
    const {
      hoTen,
      soCCCD,
      householdId,
      diaChi,
      gioiTinh,
      ngheNghiep,
      trangThai,
      keyword,
      page = 1,
      limit = 10,
    } = searchDto;

    const query: any = {};

    if (hoTen) {
      query.hoTen = { $regex: hoTen, $options: 'i' };
    }

    if (soCCCD) {
      query.soCCCD = soCCCD;
    }

    if (householdId) {
      query.householdId = new Types.ObjectId(householdId);
    }

    if (gioiTinh) {
      query.gioiTinh = gioiTinh;
    }

    if (ngheNghiep) {
      query.ngheNghiep = { $regex: ngheNghiep, $options: 'i' };
    }

    if (trangThai) {
      query.trangThai = trangThai;
    }

    if (keyword) {
      query.$or = [
        { hoTen: { $regex: keyword, $options: 'i' } },
        { soCCCD: { $regex: keyword, $options: 'i' } },
        { biDanh: { $regex: keyword, $options: 'i' } },
      ];
    }

    // Nếu tìm theo địa chỉ, cần join với Household
    let persons;
    if (diaChi) {
      const households = await this.householdModel.find({
        $or: [
          { soNha: { $regex: diaChi, $options: 'i' } },
          { duongPho: { $regex: diaChi, $options: 'i' } },
          { phuong: { $regex: diaChi, $options: 'i' } },
          { quan: { $regex: diaChi, $options: 'i' } },
        ],
      }).exec();

      const householdIds = households.map(h => h._id);
      query.householdId = { $in: householdIds };
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.personModel.find(query).skip(skip).limit(limit).populate('householdId', 'soHoKhau soNha duongPho phuong quan').exec(),
      this.personModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Xem chi tiết nhân khẩu
  async getDetail(id: string): Promise<PersonDocument> {
    const person = await this.personModel
      .findById(id)
      .populate('householdId')
      .exec();

    if (!person) {
      throw new NotFoundException('Không tìm thấy nhân khẩu');
    }

    return person;
  }

  // Lấy danh sách (đơn giản)
  async findAll(query: any) {
    const filter: any = {};
    if (query.hoTen) filter.hoTen = { $regex: query.hoTen, $options: 'i' };
    return this.personModel.find(filter).exec();
  }
}
