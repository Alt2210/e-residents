import { Controller, Get, Post, Body, Put, Param, Query, UseGuards, Delete, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PersonsService } from './persons.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { NewbornDto } from './dto/newborn.dto';
import { MarkMovedDto } from './dto/mark-moved.dto';
import { MarkDeceasedDto } from './dto/mark-deceased.dto';
import { PersonSearchDto } from './dto/person-search.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Persons')
@ApiBearerAuth('JWT-auth')
@Controller('persons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PersonsController {
  constructor(private readonly personsService: PersonsService) {}

  // Thêm nhân khẩu mới (sinh con)
  @Post('newborn')
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO')
  async addNewborn(@Body() newbornDto: NewbornDto) {
    return this.personsService.addNewborn(newbornDto);
  }

  // Thêm nhân khẩu thường (nhập hộ)
  @Post()
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO')
  async create(@Body() createPersonDto: CreatePersonDto) {
    return this.personsService.create(createPersonDto);
  }

  // Tra cứu/tìm kiếm nhân khẩu
  @Get('search')
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO')
  async search(@Query() searchDto: PersonSearchDto) {
    return this.personsService.search(searchDto);
  }

  // Xem chi tiết nhân khẩu
  @Get(':id')
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO')
  async getDetail(@Param('id') id: string) {
    return this.personsService.getDetail(id);
  }

  // Lấy danh sách (đơn giản)
  @Get()
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO')
  async findAll(@Query() query: any) {
    return this.personsService.findAll(query);
  }

  // Cập nhật thông tin nhân khẩu
  @Put(':id')
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO')
  async update(@Param('id') id: string, @Body() updateDto: Partial<CreatePersonDto>) {
    return this.personsService.update(id, updateDto);
  }

  // Ghi nhận nhân khẩu chuyển đi
  @Patch(':id/mark-moved')
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO')
  async markMoved(@Param('id') id: string, @Body() markMovedDto: MarkMovedDto) {
    return this.personsService.markMoved(id, markMovedDto);
  }

  // Ghi nhận nhân khẩu qua đời
  @Patch(':id/mark-deceased')
  @Roles('TO_TRUONG', 'TO_PHO', 'CAN_BO')
  async markDeceased(@Param('id') id: string, @Body() markDeceasedDto: MarkDeceasedDto) {
    return this.personsService.markDeceased(id, markDeceasedDto);
  }

  // Xóa/đóng hồ sơ nhân khẩu
  @Delete(':id')
  @Roles('TO_TRUONG', 'TO_PHO')
  async delete(@Param('id') id: string) {
    await this.personsService.delete(id);
    return { success: true, message: 'Đã xóa hồ sơ nhân khẩu' };
  }
}