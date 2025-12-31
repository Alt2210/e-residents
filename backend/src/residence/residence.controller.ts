import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ResidenceService } from './residence.service';
import {
  IssueTemporaryResidenceDto,
  ExtendResidenceDto,
  CloseResidenceDto,
} from './dto/temporary-residence.dto';
import { IssueAbsenceDto, ExtendAbsenceDto, CloseAbsenceDto } from './dto/absence.dto';
import {
  TemporaryResidenceSearchDto,
  AbsenceSearchDto,
} from './dto/residence-search.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Types } from 'mongoose';

@ApiTags('Residence')
@ApiBearerAuth('JWT-auth')
@Controller('residence')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResidenceController {
  constructor(private readonly residenceService: ResidenceService) {}

  // ========== TẠM TRÚ (TEMPORARY RESIDENCE) ==========

  // Cấp giấy tạm trú hoặc Gửi yêu cầu tạm trú
  @Post('temporary')
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO', 'CONG_DAN')
  @ApiOperation({ summary: 'Cấp mới hoặc gửi yêu cầu đăng ký tạm trú' })
  async issueTemporaryResidence(
    @Body() dto: IssueTemporaryResidenceDto,
    @Request() req: any,
  ) {
    const issuedByUserId = new Types.ObjectId(req.user.userId);
    return this.residenceService.issueTemporaryResidence(dto, issuedByUserId);
  }

  // Cập nhật trạng thái tạm trú (Duyệt/Từ chối/Hủy) - ĐỂ SỬA LỖI 404
  @Patch('temporary/:id/status')
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO')
  @ApiOperation({ summary: 'Duyệt hoặc từ chối yêu cầu tạm trú' })
  async updateTemporaryStatus(
    @Param('id') id: string,
    @Body('trangThai') trangThai: string,
  ) {
    return this.residenceService.updateStatus(id, trangThai, 'temporary');
  }

  // Gia hạn giấy tạm trú
  @Patch('temporary/:id/extend')
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO')
  async extendResidence(@Param('id') id: string, @Body() dto: ExtendResidenceDto) {
    return this.residenceService.extendResidence(id, dto);
  }

  // Kết thúc/đóng giấy tạm trú
  @Patch('temporary/:id/close')
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO')
  async closeResidence(@Param('id') id: string, @Body() dto: CloseResidenceDto) {
    return this.residenceService.closeResidence(id, dto);
  }

  // Tra cứu danh sách tạm trú
  @Get('temporary/search')
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO', 'CONG_DAN')
  async searchTemporaryResidence(@Query() searchDto: TemporaryResidenceSearchDto) {
    return this.residenceService.searchTemporaryResidence(searchDto);
  }

  // ========== TẠM VẮNG (ABSENCE) ==========

  // Cấp giấy tạm vắng hoặc Gửi yêu cầu tạm vắng
  @Post('absence')
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO', 'CONG_DAN')
  @ApiOperation({ summary: 'Cấp mới hoặc gửi yêu cầu khai báo tạm vắng' })
  async issueAbsence(@Body() dto: IssueAbsenceDto, @Request() req: any) {
    const issuedByUserId = new Types.ObjectId(req.user.userId);
    return this.residenceService.issueAbsence(dto, issuedByUserId);
  }

  // Cập nhật trạng thái tạm vắng (Duyệt/Từ chối/Hủy) - ĐỂ SỬA LỖI 404
  @Patch('absence/:id/status')
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO')
  @ApiOperation({ summary: 'Duyệt hoặc từ chối yêu cầu tạm vắng' })
  async updateAbsenceStatus(
    @Param('id') id: string,
    @Body('trangThai') trangThai: string,
  ) {
    return this.residenceService.updateStatus(id, trangThai, 'absence');
  }

  // Gia hạn giấy tạm vắng
  @Patch('absence/:id/extend')
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO')
  async extendAbsence(@Param('id') id: string, @Body() dto: ExtendAbsenceDto) {
    return this.residenceService.extendAbsence(id, dto);
  }

  // Kết thúc/đóng giấy tạm vắng
  @Patch('absence/:id/close')
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO')
  async closeAbsence(@Param('id') id: string, @Body() dto: CloseAbsenceDto) {
    return this.residenceService.closeAbsence(id, dto);
  }

  // Tra cứu danh sách tạm vắng
  @Get('absence/search')
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO', 'CONG_DAN')
  async searchAbsence(@Query() searchDto: AbsenceSearchDto) {
    return this.residenceService.searchAbsence(searchDto);
  }
}