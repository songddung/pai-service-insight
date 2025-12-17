import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

// Build test timestamp: 2024-09-16 user-service - deployment fix

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 필요하면 CORS
  // app.enableCors();

  const port = parseInt(process.env.PORT ?? '3003', 10);
  await app.listen(port, '0.0.0.0'); // 컨테이너 외부에서도 접근 가능
}
void bootstrap();
