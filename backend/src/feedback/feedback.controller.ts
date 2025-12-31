import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackResponseDto } from './dto/feedback-response.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { MergeFeedbackDto } from './dto/merge-feedback.dto';
import { FeedbackSearchDto } from './dto/feedback-search.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Types } from 'mongoose';

@ApiTags('Feedback')
@ApiBearerAuth('JWT-auth')
@Controller('feedback')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  // 1. CHUYỂN ENDPOINT SEARCH LÊN TRÊN
  @Get('search')
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO', 'CONG_DAN')
  async search(@Query() searchDto: FeedbackSearchDto) {
    return this.feedbackService.search(searchDto);
  }

  // 2. CÁC ENDPOINT KHÁC (POST, PATCH...)
  @Post()
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO', 'CONG_DAN')
  async create(@Body() createDto: CreateFeedbackDto) {
    return this.feedbackService.create(createDto);
  }

  // 3. ENDPOINT CHI TIẾT CÓ THAM SỐ :id PHẢI ĐỂ DƯỚI CÙNG
  @Get(':id')
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO')
  async getDetail(@Param('id') id: string) {
    return this.feedbackService.getDetail(id);
  }

  // Cập nhật trạng thái
  @Patch(':id/status')
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO')
  async updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto) {
    return this.feedbackService.updateStatus(id, updateStatusDto);
  }

  // Ghi nhận phản hồi từ cơ quan
  @Post(':id/response')
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO')
  async addResponse(
    @Param('id') id: string,
    @Body() responseDto: FeedbackResponseDto,
    @Request() req: any,
  ) {
    const handlerUserId = new Types.ObjectId(req.user.userId);
    return this.feedbackService.addResponse(id, responseDto, handlerUserId);
  }

  // Gộp kiến nghị trùng
  @Post(':id/merge')
  @Roles('TO_TRUONG', 'TO_PHO')
  async merge(@Param('id') id: string, @Body() mergeDto: MergeFeedbackDto) {
    return this.feedbackService.merge(id, mergeDto);
  }
}
