import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('BuildForce School')
    .setDescription('API for BuildForce backend')
    .setVersion('1.0')
    .addTag('BuildForce')
    .addTag('referral', 'Referral promo codes — generate, validate, and track signups')
    .addBearerAuth()
    .build();
  const documentFactory = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, documentFactory);
}
