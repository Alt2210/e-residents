import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
class DateQueryDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsDateString()
  asOfDate?: string;
}

@ApiTags('Statistics')
@ApiBearerAuth('JWT-auth')
@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  // Thống kê nhân khẩu theo giới tính
  @Get('population/gender')
  @Roles('TO_TRUONG', 'TO_PHO')
  async getPopulationByGender(@Query('asOfDate') asOfDate?: string) {
    const date = asOfDate ? new Date(asOfDate) : undefined;
    return this.statisticsService.getPopulationByGender(date);
  }

  // Thống kê theo nhóm tuổi
  @Get('population/age-groups')
  @Roles('TO_TRUONG', 'TO_PHO')
  async getPopulationByAgeGroup(@Query('asOfDate') asOfDate?: string) {
    const date = asOfDate ? new Date(asOfDate) : undefined;
    return this.statisticsService.getPopulationByAgeGroup(date);
  }

  // Thống kê biến động nhân khẩu
  @Get('changes')
  @Roles('TO_TRUONG')
  async getChangesInPeriod(@Query() query: DateQueryDto) {
    const fromDate = query.fromDate ? new Date(query.fromDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const toDate = query.toDate ? new Date(query.toDate) : new Date();
    return this.statisticsService.getChangesInPeriod(fromDate, toDate);
  }

  // Thống kê tạm trú/tạm vắng
  @Get('temporary')
  @Roles('TO_TRUONG', 'TO_PHO')
  async getAbsenceResidenceStats(@Query() query: DateQueryDto) {
    const fromDate = query.fromDate ? new Date(query.fromDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const toDate = query.toDate ? new Date(query.toDate) : new Date();
    return this.statisticsService.getAbsenceResidenceStats(fromDate, toDate);
  }

  // Thống kê kiến nghị theo trạng thái
  @Get('feedback/status')
  @Roles('TO_TRUONG')
  async getFeedbackByStatus(@Query() query: DateQueryDto) {
    const fromDate = query.fromDate ? new Date(query.fromDate) : new Date(new Date().setMonth(new Date().getMonth() - 3));
    const toDate = query.toDate ? new Date(query.toDate) : new Date();
    return this.statisticsService.getFeedbackByStatus(fromDate, toDate);
  }
}
