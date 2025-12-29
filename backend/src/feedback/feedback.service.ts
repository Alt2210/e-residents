import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Feedback, FeedbackDocument } from '../schemas/feedback.schema';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackResponseDto } from './dto/feedback-response.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { MergeFeedbackDto } from './dto/merge-feedback.dto';
import { FeedbackSearchDto } from './dto/feedback-search.dto';

@Injectable()
export class FeedbackService {
  constructor(@InjectModel(Feedback.name) private feedbackModel: Model<FeedbackDocument>) {}

  // Ghi nhận phản ánh/kiến nghị
  async create(createDto: CreateFeedbackDto): Promise<FeedbackDocument> {
    const feedback = new this.feedbackModel({
      ...createDto,
      reporterPersonId: createDto.reporterPersonId ? new Types.ObjectId(createDto.reporterPersonId) : undefined,
      ngayPhanAnh: createDto.ngayPhanAnh || new Date(),
      trangThai: 'MOI_GHI_NHAN',
      soLanPhanAnh: 1,
    });

    return feedback.save();
  }

  // Cập nhật trạng thái
  async updateStatus(id: string, updateStatusDto: UpdateStatusDto): Promise<FeedbackDocument> {
    const feedback = await this.feedbackModel.findById(id).exec();
    if (!feedback) {
      throw new NotFoundException('Không tìm thấy phản ánh/kiến nghị');
    }

    feedback.trangThai = updateStatusDto.newStatus;
    if (updateStatusDto.note) {
      feedback.ghiChu = updateStatusDto.note;
    }

    return feedback.save();
  }

  // Ghi nhận phản hồi từ cơ quan
  async addResponse(id: string, responseDto: FeedbackResponseDto, handlerUserId: Types.ObjectId): Promise<FeedbackDocument> {
    const feedback = await this.feedbackModel.findById(id).exec();
    if (!feedback) {
      throw new NotFoundException('Không tìm thấy phản ánh/kiến nghị');
    }

    // Thêm phản hồi vào mảng
    if (!feedback.phanHoi) {
      feedback.phanHoi = [];
    }

    feedback.phanHoi.push({
      noiDung: responseDto.responseContent,
      ngayPhanHoi: responseDto.responseDate || new Date(),
      donViPhanHoi: responseDto.agencyName,
      handlerUserId,
    });

    // Tự động cập nhật trạng thái thành đã giải quyết
    feedback.trangThai = 'DA_GIAI_QUYET';

    return feedback.save();
  }

  // Gộp kiến nghị trùng
  async merge(targetId: string, mergeDto: MergeFeedbackDto): Promise<FeedbackDocument> {
    const targetFeedback = await this.feedbackModel.findById(targetId).exec();
    if (!targetFeedback) {
      throw new NotFoundException('Không tìm thấy phản ánh/kiến nghị đích');
    }

    // Kiểm tra các feedback cần gộp có tồn tại không
    const mergeFeedbacks = await this.feedbackModel.find({
      _id: { $in: mergeDto.mergeIds },
      mergedTo: { $exists: false }, // Chưa bị gộp vào feedback khác
    }).exec();

    if (mergeFeedbacks.length !== mergeDto.mergeIds.length) {
      throw new BadRequestException('Một số phản ánh không tồn tại hoặc đã bị gộp');
    }

    // Kiểm tra target không nằm trong danh sách merge
    if (mergeDto.mergeIds.includes(targetId)) {
      throw new BadRequestException('Phản ánh đích không thể nằm trong danh sách gộp');
    }

    // Cập nhật target: thêm vào mergedFrom và tăng số lần phản ánh
    if (!targetFeedback.mergedFrom) {
      targetFeedback.mergedFrom = [];
    }
    targetFeedback.mergedFrom.push(...mergeDto.mergeIds.map(id => new Types.ObjectId(id)));
    targetFeedback.soLanPhanAnh = (targetFeedback.soLanPhanAnh || 1) + mergeFeedbacks.length;

    // Cập nhật các feedback bị gộp: đánh dấu mergedTo
    await this.feedbackModel.updateMany(
      { _id: { $in: mergeDto.mergeIds } },
      { $set: { mergedTo: new Types.ObjectId(targetId) } }
    ).exec();

    return targetFeedback.save();
  }

  // Tra cứu/tìm kiếm phản ánh/kiến nghị - ĐÃ TỐI ƯU ĐỂ TRÁNH LỖI 500
  async search(searchDto: FeedbackSearchDto) {
    const {
      nguoiPhanAnh,
      fromDate,
      toDate,
      phanLoai,
      trangThai,
      keyword,
      page = 1,
      limit = 10,
    } = searchDto;

    // Khởi tạo mảng điều kiện bắt buộc: Chỉ lấy feedback chưa bị gộp
    const andConditions: any[] = [
      { 
        $or: [
          { mergedTo: { $exists: false } },
          { mergedTo: null } 
        ]
      }
    ];

    // Thêm điều kiện lọc theo tên người phản ánh
    if (nguoiPhanAnh) {
      andConditions.push({ nguoiPhanAnh: { $regex: nguoiPhanAnh, $options: 'i' } });
    }

    // Thêm điều kiện lọc theo phân loại
    if (phanLoai) {
      andConditions.push({ phanLoai });
    }

    // Thêm điều kiện lọc theo trạng thái
    if (trangThai) {
      andConditions.push({ trangThai });
    }

    // Thêm điều kiện lọc theo ngày tháng
    if (fromDate || toDate) {
      const dateQuery: any = {};
      if (fromDate) dateQuery.$gte = new Date(fromDate);
      if (toDate) dateQuery.$lte = new Date(toDate);
      andConditions.push({ ngayPhanAnh: dateQuery });
    }

    // Xử lý từ khóa tìm kiếm chung mà không làm mất điều kiện mergedTo
    if (keyword && keyword.trim() !== "") {
      andConditions.push({
        $or: [
          { nguoiPhanAnh: { $regex: keyword.trim(), $options: 'i' } },
          { noiDung: { $regex: keyword.trim(), $options: 'i' } },
        ],
      });
    }

    // Kết hợp tất cả bằng $and
    const query = andConditions.length > 0 ? { $and: andConditions } : {};
    const skip = (page - 1) * limit;

    try {
      const [data, total] = await Promise.all([
        this.feedbackModel.find(query).skip(skip).limit(limit).sort({ ngayPhanAnh: -1 }).exec(),
        this.feedbackModel.countDocuments(query).exec(),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("Database error in Feedback search:", error);
      throw new BadRequestException('Lỗi trong quá trình truy vấn dữ liệu. Vui lòng kiểm tra lại tham số.');
    }
  }

  // Xem chi tiết phản ánh/kiến nghị
  async getDetail(id: string): Promise<FeedbackDocument> {
    const feedback = await this.feedbackModel.findById(id).exec();
    if (!feedback) {
      throw new NotFoundException('Không tìm thấy phản ánh/kiến nghị');
    }

    // Populate thông tin người phản ánh nếu có
    if (feedback.reporterPersonId) {
      await feedback.populate('reporterPersonId', 'hoTen soCCCD');
    }

    return feedback;
  }
}