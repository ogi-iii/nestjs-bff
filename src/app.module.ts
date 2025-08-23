import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { HttpProxyModule } from './modules/http-proxy.module';
import * as redisStore from 'cache-manager-redis-store';

/**
 * NestJS Root App Module
 */
@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    }),
    HttpProxyModule.register(),
  ],
})
export class AppModule {}
