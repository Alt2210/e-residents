import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // Tìm user theo username (dùng cho Auth)
  async findOne(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  // Tìm user theo ID
  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  // Tạo user mới (Hash password)
  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    // Kiểm tra username đã tồn tại chưa
    const existingUser = await this.userModel.findOne({ username: createUserDto.username }).exec();
    if (existingUser) {
      throw new ConflictException('Username đã tồn tại');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return createdUser.save();
  }

  // Cập nhật thông tin user
  async update(userId: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      updateUserDto,
      { new: true }
    ).exec();

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return user;
  }

  // Đổi mật khẩu
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Kiểm tra mật khẩu cũ
    const isOldPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Mật khẩu cũ không đúng');
    }

    // Hash mật khẩu mới
    const salt = await bcrypt.genSalt();
    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, salt);

    user.password = hashedNewPassword;
    await user.save();
  }

  // Khóa/mở khóa tài khoản
  async toggleActive(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    user.isActive = !user.isActive;
    return user.save();
  }

  // Danh sách người dùng với phân trang và tìm kiếm
  async findAll(filter: UserFilterDto) {
    const { username, fullName, role, page = 1, limit = 10 } = filter;
    const query: any = {};

    if (username) {
      query.username = { $regex: username, $options: 'i' };
    }
    if (fullName) {
      query.fullName = { $regex: fullName, $options: 'i' };
    }
    if (role) {
      query.role = role;
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.userModel.find(query).select('-password').skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Xóa user (soft delete bằng cách set isActive = false)
  async delete(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    user.isActive = false;
    await user.save();
  }
}

export default UsersService;