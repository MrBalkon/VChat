import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { SwaggerConfig } from '@infrastructure/swagger/configuration'
import { Logger } from '@infrastructure/logger/logger.service'

import { IoAdapter } from '@nestjs/platform-socket.io';
import * as redisIoAdapter from 'socket.io-redis';

import * as compression from 'compression';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

export class RedisIoAdapter extends IoAdapter {
  createIOServer(port: number): any {
    const server = super.createIOServer(port);
    const redisAdapter = redisIoAdapter({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      auth_pass: process.env.REDIS_PASSWORD,
    });
    server.adapter(redisAdapter);
    return server;
  }
}

async function bootstrap() {
  const port = process.env.SERVER_PORT
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.use(compression());
  app.useWebSocketAdapter(new RedisIoAdapter(app));

  const document = SwaggerModule.createDocument(app, SwaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(port, () => {
    Logger.title(`${process.env.PROJECT_NAME}`.toUpperCase())
    Logger.info(`Server is starting on port ${port}`)
  });
}
bootstrap();
