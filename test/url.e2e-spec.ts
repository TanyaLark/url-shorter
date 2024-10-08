import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { Url, UrlType } from '../src/url/url.entity';
import { User } from '../src/users/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/http-exception.filter';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from '../src/users/dtos/create-user.dto';
import { CreateUrlDto } from '../src/url/dtos/create-url.dto';
import { SerializedUrl } from '../src/url/interceptors/serialized-url';
import { UpdateUrlDto } from '../src/url/dtos/update-url.dto';
import { UpdatedUrl } from '../src/url/interceptors/updated-url';
import { UUID } from '../src/common/types';
import { Team } from '../src/team/team.entity';

describe('UrlController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let teamRepository: Repository<Team>;
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
  const teamDto = { name: 'TeamE2E' };
  let jwtToken: string;
  let teamId: UUID;

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
    teamRepository = moduleFixture.get<Repository<Team>>(
      getRepositoryToken(Team),
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

    // Create a team
    const teamResponse = await request(app.getHttpServer())
      .post('/team/create')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send(teamDto)
      .expect(201);

    teamId = teamResponse.body.id;
  });

  afterAll(async () => {
    //remove user and all user teams
    const users = await userRepository.find({
      where: { email: userDto.email },
      relations: ['teams'],
    });

    for (const user of users) {
      await teamRepository.remove(user.teams);
    }
    await userRepository.remove(users);
    await app.close();
  });

  describe('/url/create/teamId/:teamId (POST)', () => {
    it('should return status: 201 - success', async () => {
      const responseUrl = await request(app.getHttpServer())
        .post(`/url/create/teamId/${teamId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(urlDto);

      const responseBody: SerializedUrl = JSON.parse(responseUrl.text);
      expect(responseUrl.status).toEqual(201);
      expect(responseBody).toHaveProperty('code');
      expect(responseBody.originalUrl).toEqual(urlDto.originalUrl);
      expect(responseBody).toHaveProperty('shortUrl');
      expect(responseBody).toHaveProperty('type');
      expect(responseBody.isActive).toBeTruthy();
      expect(responseBody.createdAt).toBeDefined();
    });

    it('should return status: 401 - Unauthorized if token is missing', async () => {
      const response = await request(app.getHttpServer())
        .post(`/url/create/teamId/${teamId}`)
        .send(urlDto);

      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    it('should return status: 401 - Unauthorized if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post(`/url/create/teamId/${teamId}`)
        .set('Authorization', 'Bearer invalidToken')
        .send(urlDto);

      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    it('should return status: 400 if originalUrl is invalid ', async () => {
      const response = await request(app.getHttpServer())
        .post(`/url/create/teamId/${teamId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ originalUrl: 'invalidUrl' });

      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual([
        'originalUrl must be a URL address',
      ]);
    });

    it('should return status: 400 if longUrl is missing', async () => {
      const response = await request(app.getHttpServer())
        .post(`/url/create/teamId/${teamId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({});

      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual([
        'originalUrl should not be empty',
        'originalUrl must be a URL address',
      ]);
    });
  });

  describe('/url/list (GET)', () => {
    it('should return status: 200 - success', async () => {
      const response = await request(app.getHttpServer())
        .get('/url/list')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('urls');
      expect(response.body).toHaveProperty('totalURLs');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('totalPages');
    });

    it('should return status: 401 - Unauthorized if token is missing', async () => {
      const response = await request(app.getHttpServer()).get('/url/list');

      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    it('should return status: 401 - Unauthorized if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/url/list')
        .set('Authorization', 'Bearer invalidToken');

      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Unauthorized');
    });
  });

  describe('/url/id/:urlId (GET)', () => {
    it('should return status: 200 - success', async () => {
      const responseUrl = await request(app.getHttpServer())
        .post(`/url/create/teamId/${teamId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(urlDto);

      const responseBody: SerializedUrl = JSON.parse(responseUrl.text);

      const response = await request(app.getHttpServer())
        .get(`/url/id/${responseBody.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('code');
      expect(response.body.originalUrl).toEqual(urlDto.originalUrl);
      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body).toHaveProperty('type');
      expect(response.body.isActive).toBeTruthy();
      expect(response.body.createdAt).toBeDefined();
    });

    it('should return status: 401 - Unauthorized if token is missing', async () => {
      const response = await request(app.getHttpServer()).get('/url/id/1');

      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    it('should return status: 401 - Unauthorized if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/url/id/1')
        .set('Authorization', 'Bearer invalidToken');

      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    it('should return status: 400 if urlId is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/url/id/invalidUrlId')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual(
        'Validation failed (uuid is expected)',
      );
    });

    it('should return status: 404 if urlId is not found', async () => {
      const response = await request(app.getHttpServer())
        .get('/url/id/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual('URL not found.');
    });
  });
  describe('/url/id/:urlId (PATCH)', () => {
    it('should update the URL', async () => {
      const updateUrlDto: UpdateUrlDto = {
        originalUrl: 'https://nestjs.io',
        alias: 'nestjs',
        type: UrlType.OneTime,
        expiresAt: new Date(),
      };

      const responseUrl = await request(app.getHttpServer())
        .post(`/url/create/teamId/${teamId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(urlDto);

      const createdUrlBody: SerializedUrl = JSON.parse(responseUrl.text);

      const response = await request(app.getHttpServer())
        .patch(`/url/id/${createdUrlBody.id}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateUrlDto);

      const responseBody: UpdatedUrl = JSON.parse(response.text);

      expect(response.status).toEqual(200);
      expect(responseBody.originalUrl).toEqual(updateUrlDto.originalUrl);
      expect(responseBody.alias).toEqual(updateUrlDto.alias);
      expect(responseBody.type).toEqual(updateUrlDto.type);
      expect(responseBody.expiresAt).toEqual(
        updateUrlDto.expiresAt.toISOString(),
      );
    });

    it('should return status: 401 - Unauthorized if token is missing', async () => {
      const response = await request(app.getHttpServer()).patch('/url/id/1');

      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    it('should return status: 401 - Unauthorized if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .patch('/url/id/1')
        .set('Authorization', 'Bearer invalidToken');

      expect(response.status).toEqual(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    it('should return status: 400 if urlId is invalid', async () => {
      const response = await request(app.getHttpServer())
        .patch('/url/id/invalidUrlId')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toEqual(400);
      expect(response.body.message).toEqual(
        'Validation failed (uuid is expected)',
      );
    });

    it('should return status: 404 if urlId is not found', async () => {
      const response = await request(app.getHttpServer())
        .patch('/url/id/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual('URL not found.');
    });
  });
});
