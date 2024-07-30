import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/http-exception.filter';
import { faker } from '@faker-js/faker';
import { Repository } from 'typeorm';
import { User } from '../src/users/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from '../src/users/dtos/create-user.dto';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  const emailStorage = [];
  const passwordMock = 'Password@123!';

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
  });

  afterAll(async () => {
    await userRepository.remove(
      await userRepository.find({
        where: emailStorage.map((email) => ({ email })),
      }),
    );
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should return status: 201 and description: User registered', async () => {
      const userDto = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: passwordMock,
      };

      emailStorage.push(userDto.email);

      const fullNameMock = `${userDto.firstName} ${userDto.lastName}`;

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userDto)
        .expect(201);

      const responseBody = JSON.parse(response.text);
      expect(response.body.description).toEqual('User registered');
      expect(responseBody.user.id).toBeDefined();
      expect(responseBody.user.fullName).toEqual(fullNameMock);
      expect(responseBody.user.email).toEqual(userDto.email);
      expect(responseBody.user.role).toEqual('User');
      expect(responseBody.user.password).toBeUndefined();
      expect(responseBody.user.createdAt).toBeDefined();
    });

    it('should return 400 Bad Request, User with email already exists', async () => {
      const userDto = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: emailStorage[0],
        password: passwordMock,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userDto)
        .expect(400);
      const res = JSON.parse(response.text);

      expect(res.message).toEqual(
        `User with email ${userDto.email} already exists`,
      );
    });

    it('should return 400 Bad Request and class-validator errors', async () => {
      const userDto: CreateUserDto = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userDto)
        .expect(400);
      const res = JSON.parse(response.text);
      const expected = [
        'firstName should not be empty',
        'lastName should not be empty',
        'email must be an email',
        'email should not be empty',
        'password is not strong enough',
        'password should not be empty',
      ];
      expect(res.message).toEqual(expected);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should return 200 OK and access_token', async () => {
      const userDto = {
        email: emailStorage[0],
        password: passwordMock,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(userDto)
        .expect(200);

      expect(response.body.access_token).toBeDefined();
    });

    it('should return 400 Bad Request', async () => {
      const userDto = {
        email: '',
        password: '',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(userDto)
        .expect(400);
      const res = JSON.parse(response.text);
      const expected = [
        'email must be an email',
        'email should not be empty',
        'password is not strong enough',
        'password should not be empty',
      ];

      expect(res.message).toEqual(expected);
    });

    it('should return 401 Unauthorized', async () => {
      const userDto = {
        email: emailStorage[0],
        password: 'wrong_Password@123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(userDto)
        .expect(401);
      const res = JSON.parse(response.text);

      expect(res.message).toEqual('Unauthorized');
    });
  });
});
