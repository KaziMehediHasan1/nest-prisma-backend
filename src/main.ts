import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalErrorHandlerFilter } from './error/globalerror.filter';
import { ValidationPipe } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('EventCraft API')
    .setDescription(
      'EventCraft is a comprehensive event management platform that connects planners, service providers, and venue owners. This API enables seamless management of user profiles, bookings, venues, services, messaging, and notifications to deliver extraordinary event experiences.',
    )
    .setVersion('1.0')
    .addTag('Event Management')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );
  app.useWebSocketAdapter(new WsAdapter(app));
  app.useGlobalFilters(new GlobalErrorHandlerFilter());
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
