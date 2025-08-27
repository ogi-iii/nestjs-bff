import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { HttpProxyModule } from './modules/http-proxy.module';
import { createKeyv } from '@keyv/redis';

/**
 * NestJS Root App Module
 */
@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        return {
          stores: [
            createKeyv(
              `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
            ),
          ],
        };
      },
    }),
    HttpProxyModule.register(),
  ],
})
export class AppModule {}
