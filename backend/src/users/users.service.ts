import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Person, PersonDocument } from '../schemas/person.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Person.name) private personModel: Model<PersonDocument>,
  ) {}

  async findOne(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    // 1. Kiểm tra username đã tồn tại chưa
    const existingUser = await this.userModel.findOne({ username: createUserDto.username }).exec();
    if (existingUser) {
      throw new ConflictException('Username đã tồn tại');
    }

    // 2. Kiểm tra số CCCD có tồn tại trong hệ thống nhân khẩu không
    if (!createUserDto.soCCCD) {
      throw new BadRequestException('Phải cung cấp số CCCD để tạo tài khoản');
    }

    const person = await this.personModel.findOne({ soCCCD: createUserDto.soCCCD }).exec();
    if (!person) {
      throw new NotFoundException('Số CCCD không tồn tại trong hệ thống nhân khẩu');
    }

    // 3. Kiểm tra xem nhân khẩu này đã được cấp tài khoản trước đó chưa
    if (person.userId) {
      throw new ConflictException('Nhân khẩu này đã được liên kết với một tài khoản khác');
    }

    // 4. Hash mật khẩu và tạo User
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    const savedUser = await createdUser.save();

    // 5. Cập nhật liên kết ngược lại vào bảng Person
    person.userId = savedUser._id as Types.ObjectId;
    await person.save();

    return savedUser;
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(userId, updateUserDto, { new: true }).exec();
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    const isOldPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
    if (!isOldPasswordValid) throw new BadRequestException('Mật khẩu cũ không đúng');

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(changePasswordDto.newPassword, salt);
    await user.save();
  }

  async toggleActive(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    user.isActive = !user.isActive;
    return user.save();
  }

  async findAll(filter: UserFilterDto) {
    const { username, fullName, role, page = 1, limit = 10 } = filter;
    const query: any = {};
    if (username) query.username = { $regex: username, $options: 'i' };
    if (fullName) query.fullName = { $regex: fullName, $options: 'i' };
    if (role) query.role = role;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.userModel.find(query).select('-password').skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(query).exec(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async delete(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    user.isActive = false;
    await user.save();
  }
}