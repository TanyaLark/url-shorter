import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { Url } from '../src/url/url.entity';
import { User } from '../src/users/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/http-exception.filter';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from '../src/users/dtos/create-user.dto';
import { CreateUrlDto } from '../src/url/dtos/create-url.dto';

describe('UrlController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let urlRepository: Repository<Url>;
  const userDto: CreateUserDto = {
    firstName: 'JohnE2EUrl',
    lastName: 'Doe',
    email: 'johndoe@example.com',
    password: 'e2eUrlPassWord123@',
  };
  const urlDto: CreateUrlDto = {
    originalUrl: 'https://nestjs.com',
  };
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    urlRepository = moduleFixture.get<Repository<Url>>(getRepositoryToken(Url));

    // Create a user and get the JWT token
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(userDto)
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: userDto.email,
        password: userDto.password,
      })
      .expect(200);

    jwtToken = response.body.access_token;
  });

  afterAll(async () => {
    await userRepository.remove(
      await userRepository.find({
        where: { email: userDto.email },
      }),
    );
    await app.close();
  });

  describe('/url/create (POST)', () => {
    it('should return status: 201 - success', async () => {
      const responseUrl = await request(app.getHttpServer())
        .post('/url/create')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(urlDto);

      const responseBody = JSON.parse(responseUrl.text);
      expect(responseUrl.status).toEqual(201);
      expect(responseBody).toHaveProperty('id');
      expect(responseBody).toHaveProperty('code');
      expect(responseBody.originalUrl).toEqual(urlDto.originalUrl);
      expect(responseBody).toHaveProperty('type');
      expect(responseBody.isActive).toBeTruthy();
      expect(responseBody.createdAt).toBeDefined();
    });
  });

  it('/url/create (POST) - missing token', async () => {
    const response = await request(app.getHttpServer())
      .post('/url/create')
      .send(urlDto);

    expect(response.status).toEqual(401);
    expect(response.body.message).toEqual('Unauthorized');
  });

  it('/url/create (POST) - invalid token', async () => {
    const response = await request(app.getHttpServer())
      .post('/url/create')
      .set('Authorization', 'Bearer invalidToken')
      .send(urlDto);

    expect(response.status).toEqual(401);
    expect(response.body.message).toEqual('Unauthorized');
  });

  it('/url/create (POST) - invalid originalUrl', async () => {
    const response = await request(app.getHttpServer())
      .post('/url/create')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ originalUrl: 'invalidUrl' });

    expect(response.status).toEqual(400);
    expect(response.body.message).toEqual([
      'originalUrl must be a URL address',
    ]);
  });

  it('/url/create (POST) - missing longUrl', async () => {
    const response = await request(app.getHttpServer())
      .post('/url/create')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({});

    expect(response.status).toEqual(400);
    expect(response.body.message).toEqual([
      'originalUrl should not be empty',
      'originalUrl must be a URL address',
    ]);
  });
});
