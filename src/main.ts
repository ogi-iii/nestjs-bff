import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Run NestJS app.
 */
async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);
  } catch (err) {
    console.error('failed to run app:', err);
    process.exit(1);
  }
}
bootstrap();
