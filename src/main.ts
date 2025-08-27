import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { env } from 'process';
import * as cookieParser from 'cookie-parser';

/**
 * Run NestJS app.
 */
async function bootstrap() {
  const LOGGER = new Logger('NestApplication');
  const DEFAULT_HOST = 'localhost';
  const DEFAULT_PORT = 3001;
  try {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    const host = env.NEST_APP_HOST ? env.NEST_APP_HOST : DEFAULT_HOST;
    const port = env.NEST_APP_PORT ? env.NEST_APP_PORT : DEFAULT_PORT;
    LOGGER.log(`Bootstrap on ${host}:${port}`);
    await app.listen(port, host);
  } catch (err) {
    LOGGER.error('failed to run app:', err);
    process.exit(1);
  }
}
bootstrap();
