import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Tạo tài khoản (chỉ Tổ trưởng/Tổ phó)
  @Post()
  @Roles('TO_TRUONG', 'TO_PHO')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Danh sách người dùng / tìm kiếm (Tổ trưởng/Tổ phó)
  @Get()
  @Roles('TO_TRUONG', 'TO_PHO')
  async findAll(@Query() filter: UserFilterDto) {
    return this.usersService.findAll(filter);
  }

  // Xem chi tiết user
  @Get(':id')
  @Roles('TO_TRUONG', 'TO_PHO')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }
    const { password, ...result } = user.toObject();
    return result;
  }

  // Cập nhật thông tin tài khoản
  @Put(':id')
  @Roles('TO_TRUONG', 'TO_PHO')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);
    const { password, ...result } = user.toObject();
    return result;
  }

  // Đổi mật khẩu (chính user đó hoặc Tổ trưởng/Tổ phó)
  @Put(':id/change-password')
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req: any,
  ) {
    // Cho phép user tự đổi mật khẩu hoặc Tổ trưởng/Tổ phó
    if (req.user.role !== 'TO_TRUONG' && req.user.role !== 'TO_PHO' && req.user.userId !== id) {
      throw new Error('Không có quyền đổi mật khẩu cho user khác');
    }
    await this.usersService.changePassword(id, changePasswordDto);
    return { success: true, message: 'Đổi mật khẩu thành công' };
  }

  // Khóa/mở khóa tài khoản
  @Patch(':id/toggle-active')
  @Roles('TO_TRUONG', 'TO_PHO')
  async toggleActive(@Param('id') id: string) {
    const user = await this.usersService.toggleActive(id);
    const { password, ...result } = user.toObject();
    return result;
  }

  // Xóa tài khoản (soft delete)
  @Delete(':id')
  @Roles('TO_TRUONG')
  async delete(@Param('id') id: string) {
    await this.usersService.delete(id);
    return { success: true, message: 'Đã xóa tài khoản' };
  }
}

