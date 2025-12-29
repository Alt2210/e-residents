import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

let cachedApp;

async function bootstrap() {
  // Nếu đã có cachedApp (trên Vercel), trả về luôn để tiết kiệm tài nguyên
  if (cachedApp) return cachedApp;

  const app = await NestFactory.create(AppModule);

  // 1. Prefix cho API
  app.setGlobalPrefix('api');

  // 2. Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 3. CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 4. Swagger - Đặt tại /docs
  const config = new DocumentBuilder()
    .setTitle('E-Residents API')
    .setDescription('Hệ thống quản lý dân cư')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Khởi tạo app
  await app.init();
  
  // Lưu vào cache
  cachedApp = app.getHttpAdapter().getInstance();
  return cachedApp;
}

// XỬ LÝ CHẠY LOCAL
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  // Gọi chính hàm bootstrap để đảm bảo mọi cấu hình (Swagger, Prefix) được thực hiện
  NestFactory.create(AppModule).then(async (app) => {
    app.setGlobalPrefix('api');
    
    const config = new DocumentBuilder()
      .setTitle('E-Residents API')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    await app.listen(PORT, () => {
      console.log(`Server: http://localhost:${PORT}/api`);
      console.log(`Swagger: http://localhost:${PORT}/docs`);
    });
  });
}

// EXPORT CHO VERCEL
export default async (req: any, res: any) => {
  const server = await bootstrap();
  server(req, res);
};