import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';

/**
 * Run NestJS app.
 */
async function bootstrap() {
  const DEFAULT_PORT = 3001;
  try {
    config();
    const app = await NestFactory.create(AppModule);
    const port = process.env.PORT ? process.env.PORT : DEFAULT_PORT;
    await app.listen(port);
  } catch (err) {
    console.error('failed to run app:', err);
    process.exit(1);
  }
}
bootstrap();
