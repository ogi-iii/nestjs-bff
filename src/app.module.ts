import { Module } from '@nestjs/common';
import { HttpProxyModule } from './modules/http-proxy.module';

/**
 * NestJS Root App Module
 */
@Module({
  imports: [HttpProxyModule.register()],
})
export class AppModule {}
