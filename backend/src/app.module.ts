import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Thêm dòng này
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatbotModule } from './chatbot/chatbot.module'; 

// Import các Module chức năng
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { HouseholdsModule } from './households/households.module';
import { PersonsModule } from './persons/persons.module'; 
import { FeedbackModule } from './feedback/feedback.module';
import { StatisticsModule } from './statistics/statistics.module';
import { ResidenceModule } from './residence/residence.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { NotificationsModule } from './notification/notification.module';
@Module({
  imports: [
    // 1. Đọc biến môi trường từ file .env
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. Kết nối MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // 3. Các Module nghiệp vụ
    AuthModule,
    UsersModule,
    HouseholdsModule,
    PersonsModule,
    FeedbackModule,
    StatisticsModule,
    ResidenceModule,
    ChatbotModule,
    NotificationsModule
  ],
})
export class AppModule {}