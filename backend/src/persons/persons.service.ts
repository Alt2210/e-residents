import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Person, PersonDocument } from '../schemas/person.schema';
import { CreatePersonDto } from './dto/create-person.dto';
import { NewbornDto } from './dto/newborn.dto';
import { MarkMovedDto } from './dto/mark-moved.dto';
import { MarkDeceasedDto } from './dto/mark-deceased.dto';
import { Household, HouseholdDocument } from '../schemas/household.schema';

@Injectable()
export class PersonsService {
  constructor(
    @InjectModel(Person.name) private personModel: Model<PersonDocument>,
    @InjectModel(Household.name) private householdModel: Model<HouseholdDocument>,
  ) {}

  /**
   * Thêm nhân khẩu mới (sinh con)
   * Sử dụng householdId là ID vật lý để liên kết chính xác
   */
  async addNewborn(newbornDto: NewbornDto): Promise<PersonDocument> {
    const household = await this.householdModel.findById(newbornDto.householdId).exec();
    if (!household) {
      throw new NotFoundException('Không tìm thấy hộ khẩu để thêm nhân khẩu mới');
    }

    const person = new this.personModel({
      ...newbornDto,
      householdId: new Types.ObjectId(newbornDto.householdId),
      diaChiThuongTruTruoc: 'Mới sinh',
      trangThai: 'THUONG_TRU',
      ngheNghiep: undefined,
      soCCCD: undefined,
    });

    return person.save();
  }

  /**
   * Thêm nhân khẩu thường (nhập hộ)
   * Cho phép truyền vào Số Hộ Khẩu (String) thay vì ID
   */
  async create(createPersonDto: any): Promise<PersonDocument> {
    // Lấy giá trị mã hộ khẩu từ trường householdId hoặc soHoKhau truyền lên
    const inputCode = String(createPersonDto.householdId || createPersonDto.soHoKhau); 

    // Tìm ID vật lý tương ứng với mã số hộ khẩu đó
    const household = await this.householdModel.findOne({ 
      soHoKhau: inputCode 
    }).lean().exec(); 

    if (!household) {
      throw new NotFoundException(`Hệ thống không tìm thấy hộ khẩu có số: ${inputCode}`);
    }

    // Kiểm tra trùng lặp CCCD nếu có cung cấp
    if (createPersonDto.soCCCD) {
      const existing = await this.personModel.findOne({ soCCCD: createPersonDto.soCCCD }).exec();
      if (existing) {
        throw new BadRequestException('Số CCCD này đã tồn tại trong hệ thống');
      }
    }

    // Tạo bản ghi mới, chuyển đổi mã hộ khẩu sang ID nội bộ của MongoDB
    const person = new this.personModel({
      ...createPersonDto,
      householdId: household._id, 
      trangThai: 'THUONG_TRU',
    });

    return person.save();
  }

  /**
   * Cập nhật thông tin chi tiết nhân khẩu
   */
  async update(id: string, updatePersonDto: Partial<CreatePersonDto>): Promise<PersonDocument> {
    if (updatePersonDto.soCCCD) {
      const existing = await this.personModel.findOne({
        soCCCD: updatePersonDto.soCCCD,
        _id: { $ne: id },
      }).exec();
      if (existing) {
        throw new BadRequestException('Số CCCD cập nhật bị trùng với người khác');
      }
    }

    const updated = await this.personModel.findByIdAndUpdate(id, updatePersonDto, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException('Không tìm thấy nhân khẩu để cập nhật');
    }
    return updated;
  }

  /**
   * Ghi nhận trạng thái nhân khẩu đã chuyển đi nơi khác
   */
  async markMoved(id: string, markMovedDto: MarkMovedDto): Promise<PersonDocument> {
    const person = await this.personModel.findById(id).exec();
    if (!person) throw new NotFoundException('Nhân khẩu không tồn tại');

    person.trangThai = 'DA_CHUYEN_DI';
    person.ngayChuyenDi = markMovedDto.moveDate;
    person.noiChuyenDen = markMovedDto.moveTo;
    person.ghiChu = markMovedDto.note || 'Đã làm thủ tục chuyển đi';

    return person.save();
  }

  /**
   * Ghi nhận trạng thái nhân khẩu đã qua đời
   */
  async markDeceased(id: string, markDeceasedDto: MarkDeceasedDto): Promise<PersonDocument> {
    const person = await this.personModel.findById(id).exec();
    if (!person) throw new NotFoundException('Nhân khẩu không tồn tại');

    person.trangThai = 'DA_QUA_DOI';
    person.ngayQuaDoi = markDeceasedDto.date;
    person.ghiChu = markDeceasedDto.note || 'Đã qua đời';

    return person.save();
  }

  /**
   * Ngừng quản lý hồ sơ nhân khẩu (Soft delete)
   */
  async delete(id: string): Promise<void> {
    const person = await this.personModel.findById(id).exec();
    if (!person) throw new NotFoundException('Nhân khẩu không tồn tại');

    person.trangThai = 'DA_CHUYEN_DI';
    person.ghiChu = 'Đã xóa khỏi danh sách quản lý trực tiếp';
    await person.save();
  }

  /**
   * TRA CỨU NHÂN KHẨU: CHỈ DÙNG STRING (SỐ HỘ KHẨU)
   * Không sử dụng ép kiểu ID trực tiếp để tránh lỗi CastError 500
   */
  async search(searchDto: any) {
    const {
      hoTen,
      soCCCD,
      householdId, // Đây là chuỗi văn bản "HK..." từ client
      diaChi,
      gioiTinh,
      ngheNghiep,
      trangThai,
      keyword,
      ageGroup,
      page = 1,
      limit = 10,
    } = searchDto;

    const query: any = {};

    // Tìm kiếm theo các thông tin định danh cá nhân
    if (hoTen) query.hoTen = { $regex: hoTen, $options: 'i' };
    if (soCCCD) query.soCCCD = soCCCD;
    if (gioiTinh) query.gioiTinh = gioiTinh;
    if (ngheNghiep) query.ngheNghiep = { $regex: ngheNghiep, $options: 'i' };
    if (trangThai) query.trangThai = trangThai;

    // XỬ LÝ TÌM THEO SỐ HỘ KHẨU (STRING)
    if (householdId) {
      // Tìm ID nội bộ từ mã số hộ khẩu văn bản
      const foundHousehold = await this.householdModel
        .findOne({ soHoKhau: householdId })
        .select('_id')
        .lean()
        .exec();
        
      if (foundHousehold) {
        query.householdId = foundHousehold._id; // Gán ID xịn để Mongoose query
      } else {
        // Nếu gõ sai mã hộ khẩu thì không có kết quả nào thỏa mãn
        return { data: [], total: 0, page, limit, totalPages: 0 };
      }
    }

    // XỬ LÝ TÌM THEO ĐỊA CHỈ (Thông qua bảng Household)
    if (diaChi) {
      const matchingHouseholds = await this.householdModel
        .find({
          $or: [
            { soHoKhau: { $regex: diaChi, $options: 'i' } },
            { soNha: { $regex: diaChi, $options: 'i' } },
            { duongPho: { $regex: diaChi, $options: 'i' } },
            { phuong: { $regex: diaChi, $options: 'i' } },
            { quan: { $regex: diaChi, $options: 'i' } },
          ],
        })
        .select('_id')
        .lean()
        .exec();

      const ids = matchingHouseholds.map(h => h._id);
      if (ids.length > 0) {
        // Kết hợp với điều kiện householdId đã có (nếu có)
        if (query.householdId) {
          const isMatched = ids.some(id => id.toString() === query.householdId.toString());
          if (!isMatched) return { data: [], total: 0, page, limit, totalPages: 0 };
        } else {
          query.householdId = { $in: ids };
        }
      } else {
        return { data: [], total: 0, page, limit, totalPages: 0 };
      }
    }

    // TÌM KIẾM TỔNG HỢP (Chỉ tìm trên các trường văn bản cá nhân)
    if (keyword) {
      query.$or = [
        { hoTen: { $regex: keyword, $options: 'i' } },
        { soCCCD: { $regex: keyword, $options: 'i' } },
        { biDanh: { $regex: keyword, $options: 'i' } },
      ];
    }

    // LỌC THEO NHÓM ĐỘ TUỔI
    if (ageGroup) {
      const now = new Date();
      let minAge = 0; let maxAge = 150;
      switch (ageGroup) {
        case '0-1': minAge = 0; maxAge = 1; break;
        case '1-5': minAge = 1; maxAge = 5; break;
        case '6-10': minAge = 6; maxAge = 10; break;
        case '11-14': minAge = 11; maxAge = 14; break;
        case '15-17': minAge = 15; maxAge = 17; break;
        case '18-60': minAge = 18; maxAge = 60; break;
        case '60+': minAge = 60; maxAge = 150; break;
      }
      const dateTo = new Date(); // Thời điểm muộn nhất (hôm nay)
      dateTo.setHours(23, 59, 59, 999);
      
      const dateFrom = new Date();
      dateFrom.setFullYear(now.getFullYear() - maxAge);
      dateFrom.setHours(0, 0, 0, 0);

      // Điều chỉnh chính xác cho minAge
      const exactDateTo = new Date();
      exactDateTo.setFullYear(now.getFullYear() - minAge);
      exactDateTo.setHours(23, 59, 59, 999);

      query.ngaySinh = { $gte: dateFrom, $lte: exactDateTo };
    }

    try {
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        this.personModel.find(query)
          .skip(skip)
          .limit(limit)
          .populate({
            path: 'householdId',
            select: 'soHoKhau soNha duongPho phuong quan',
            strictPopulate: false // Quan trọng: Bỏ qua các ID lỗi trong DB thay vì báo lỗi 500
          })
          .exec(),
        this.personModel.countDocuments(query).exec(),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("Lỗi thực thi truy vấn:", error);
      throw new BadRequestException('Yêu cầu tìm kiếm không thể thực hiện do sai định dạng dữ liệu');
    }
  }

  /**
   * Xem chi tiết thông tin một nhân khẩu
   */
  async getDetail(id: string): Promise<PersonDocument> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Mã định danh nội bộ không hợp lệ');
    const person = await this.personModel.findById(id).populate('householdId').exec();
    if (!person) throw new NotFoundException('Nhân khẩu không tồn tại');
    return person;
  }

  /**
   * Lấy toàn bộ danh sách (hỗ trợ lọc theo tên đơn giản)
   */
  async findAll(query: any) {
    const filter: any = {};
    if (query.hoTen) filter.hoTen = { $regex: query.hoTen, $options: 'i' };
    return this.personModel.find(filter).exec();
  }

  /**
   * Tìm nhân khẩu dựa trên số CCCD (Dùng cho CitizenController)
   */
  async getDetailByCCCD(soCCCD: string): Promise<PersonDocument> {
    const person = await this.personModel.findOne({ soCCCD }).populate('householdId').exec();
    if (!person) throw new NotFoundException('Không có nhân khẩu nào khớp với CCCD của tài khoản này');
    return person;
  }
}