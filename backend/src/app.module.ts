import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configDBService } from './infrastructure/db/db.service'
import { LoggerMiddleware } from '@infrastructure/logger/logger.middleware';
import { AuthCheckerMiddleware } from '@application/http/shared/auth/auth.middleware'
import { MessageGateway } from '@application/gateway/message.gateway';

@Module({
  imports: [ ConfigModule.forRoot(), TypeOrmModule.forRoot(configDBService.getTypeOrmConfig())],
  controllers: [],
  providers: [MessageGateway],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthCheckerMiddleware, LoggerMiddleware)
      .forRoutes('/');
  }
}
