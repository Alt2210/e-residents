import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PersonsService } from './persons.service';

@Controller('citizen')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CitizenController {
  constructor(private readonly personsService: PersonsService) {}

  @Get('my-info')
  @Roles('CONG_DAN')
  async getMyInfo(@Request() req: any) {
    // 1. JwtStrategy cần được sửa để trả về soCCCD trong payload (xem lưu ý dưới)
    // Hoặc nếu bạn đã lưu soCCCD vào User, req.user sẽ có thông tin này
    const soCCCD = req.user.soCCCD; 

    // 2. Tìm nhân khẩu bằng số CCCD
    return this.personsService.getDetailByCCCD(soCCCD);
  }
}