import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpProxyModule } from './modules/http-proxy.module';

/**
 * NestJS Root App Module
 */
@Module({
  imports: [ConfigModule.forRoot(), HttpProxyModule.register()],
})
export class AppModule {}
