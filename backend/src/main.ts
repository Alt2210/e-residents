import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Biến instance để tối ưu hóa việc tái sử dụng app trong Serverless
let cachedApp;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule);

    // 1. Kích hoạt Validation toàn cục
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    // 2. Kích hoạt CORS
    app.enableCors({
      origin: true, 
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

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

    // QUAN TRỌNG: Phải khởi tạo app trước khi trả về instance cho Vercel
    await app.init();
    cachedApp = app.getHttpAdapter().getInstance();
  }
  return cachedApp;
}

// Chạy ở Local (Nếu không phải môi trường Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  NestFactory.create(AppModule).then(app => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Swagger docs: http://localhost:${PORT}/api`);
    });
  });
}

// Export function này để Vercel sử dụng
export default async (req: any, res: any) => {
  const server = await bootstrap();
  server(req, res);
};