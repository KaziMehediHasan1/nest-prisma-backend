import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalErrorHandlerFilter } from './error/globalerror.filter';
import { AdminSeeder } from './seed/admin.seed';
import { AmenitiesSeeder } from './seed/amenitiesSeeder.seed';
import { ValidationPipe } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("v2")
  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .addBearerAuth()
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.get(AdminSeeder).seedAdmin()
  await app.get(AmenitiesSeeder).seedAmenities()
  app.useWebSocketAdapter(new WsAdapter(app))
  app.useGlobalFilters(new GlobalErrorHandlerFilter());
  app.enableCors()
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
