import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Kích hoạt Validation toàn cục
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 2. Kích hoạt CORS (Đã sửa lại cho chuẩn NestJS)
  app.enableCors({
    // Cho phép tất cả các nguồn trong quá trình test, 
    // hoặc điền URL frontend cụ thể của bạn trên Vercel
    origin: true, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // BỎ DÒNG NÀY: app.use(cors()); -> NestJS không dùng trực tiếp như vậy nếu đã có enableCors

  // 3. Cấu hình Swagger
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
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Quan trọng: Vercel yêu cầu lắng nghe cổng từ biến môi trường
  const PORT = process.env.PORT || 3001;
  await app.listen(PORT);
}
bootstrap();