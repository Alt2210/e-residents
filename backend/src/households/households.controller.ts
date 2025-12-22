import { Controller, Post, Body, UseGuards, Put, Param, Get, Delete, Query, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { HouseholdsService } from './households.service';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { UpdateHouseholdDto } from './dto/update-household.dto';
import { ChangeHeadDto } from './dto/change-head.dto';
import { SplitHouseholdDto } from './dto/split-household.dto';
import { HouseholdSearchDto } from './dto/household-search.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Types } from 'mongoose';

@ApiTags('Households')
@ApiBearerAuth('JWT-auth')
@Controller('households')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HouseholdsController {
  constructor(private readonly householdsService: HouseholdsService) {}

  // Tạo sổ hộ khẩu mới
  @Post()
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO')
  async create(@Body() createHouseholdDto: CreateHouseholdDto, @Request() req: any) {
    const performedBy = new Types.ObjectId(req.user.userId);
    return this.householdsService.create(createHouseholdDto, performedBy);
  }

  // Cập nhật thông tin hộ khẩu
  @Put(':id')
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO')
  async update(
    @Param('id') id: string,
    @Body() updateHouseholdDto: UpdateHouseholdDto,
    @Request() req: any,
  ) {
    const performedBy = new Types.ObjectId(req.user.userId);
    return this.householdsService.update(id, updateHouseholdDto, performedBy);
  }

  // Xóa/đóng sổ hộ khẩu
  @Delete(':id')
  @Roles('TO_TRUONG', 'TO_PHO')
  async delete(@Param('id') id: string, @Request() req: any) {
    const performedBy = new Types.ObjectId(req.user.userId);
    await this.householdsService.delete(id, performedBy);
    return { success: true, message: 'Đã đóng sổ hộ khẩu' };
  }

  // Tra cứu hộ khẩu
  @Get('search')
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO')
  async search(@Query() searchDto: HouseholdSearchDto) {
    return this.householdsService.search(searchDto);
  }

  // Xem chi tiết hộ khẩu
  @Get(':id')
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO')
  async getDetail(@Param('id') id: string) {
    return this.householdsService.getDetail(id);
  }

  // Đổi chủ hộ
  @Post(':id/change-head')
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO')
  async changeHead(
    @Param('id') id: string,
    @Body() changeHeadDto: ChangeHeadDto,
    @Request() req: any,
  ) {
    const performedBy = new Types.ObjectId(req.user.userId);
    return this.householdsService.changeHead(id, changeHeadDto, performedBy);
  }

  // Tách hộ
  @Post(':id/split')
  @Roles('TO_TRUONG', 'TO_PHO')
  async splitHousehold(
    @Param('id') id: string,
    @Body() splitDto: SplitHouseholdDto,
    @Request() req: any,
  ) {
    const performedBy = new Types.ObjectId(req.user.userId);
    return this.householdsService.splitHousehold(id, splitDto, performedBy);
  }

  // Xem lịch sử biến động của hộ
  @Get(':id/history')
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO')
  async getHistory(
    @Param('id') id: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const from = fromDate ? new Date(fromDate) : undefined;
    const to = toDate ? new Date(toDate) : undefined;
    return this.householdsService.getHistory(id, from, to);
  }
}