import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/posts (POST)', () => {
    const requestBody = {
      name: 'test',
      email: 'test@example.com',
    };
    return request(app.getHttpServer())
      .post('/api/posts')
      .send(requestBody)
      .expect(201);
  });

  it('/api/posts (GET)', () => {
    return request(app.getHttpServer()).get('/api/posts').expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
