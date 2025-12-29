import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Kích hoạt Validation toàn cục
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Tự động loại bỏ các field không khai báo trong DTO
    forbidNonWhitelisted: true, // Báo lỗi nếu gửi thừa field rác
    transform: true, // Tự động convert kiểu dữ liệu (vd: string '10' -> number 10)
  }));

  // 2. Kích hoạt CORS (Để frontend gọi được API)
  app.enableCors({
    origin: '*', // Trong môi trường dev, cho phép tất cả. Product nên set domain cụ thể.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  // 3. Cấu hình Swagger (Tài liệu API)
  const config = new DocumentBuilder()
    .setTitle('E-Residents API')
    .setDescription('Hệ thống quản lý dân cư, hộ khẩu, tạm trú tạm vắng')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Nhập JWT token',
        in: 'header',
      },
      'JWT-auth', // Tên này phải trùng với tên trong @ApiBearerAuth()
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Truy cập tại: http://localhost:6969/api

  await app.listen(process.env.PORT ?? 6969);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger Docs available at: ${await app.getUrl()}/api`);
}
bootstrap();