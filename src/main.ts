import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { Logger } from '@nestjs/common';

/**
 * Run NestJS app.
 */
async function bootstrap() {
  const LOGGER = new Logger('NestApplication');
  const DEFAULT_HOST = 'localhost';
  const DEFAULT_PORT = 3001;
  try {
    config();
    const app = await NestFactory.create(AppModule);
    const host = process.env.NEST_APP_HOST
      ? process.env.NEST_APP_HOST
      : DEFAULT_HOST;
    const port = process.env.NEST_APP_PORT
      ? process.env.NEST_APP_PORT
      : DEFAULT_PORT;
    LOGGER.log(`Bootstrap on ${host}:${port}`);
    await app.listen(port, host);
  } catch (err) {
    LOGGER.error('failed to run app:', err);
    process.exit(1);
  }
}
bootstrap();
