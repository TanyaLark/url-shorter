import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '../src/common/http-exception.filter';
import { Repository } from 'typeorm';
import { User } from '../src/users/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from '../src/users/dtos/create-user.dto';
import { faker } from '@faker-js/faker';
import * as request from 'supertest';
import { UUID } from '../src/common/types';
import { Team } from '../src/team/team.entity';
import { SerializedUserInfo } from '../src/users/interceptors/serialized-user-info';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let teamRepository: Repository<Team>;
  let userId: UUID;
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
    teamRepository = moduleFixture.get<Repository<Team>>(
      getRepositoryToken(Team),
    );

    // Create a user and get the JWT token
    const userDto: CreateUserDto = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: 'Password@123!',
    };
    const userResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userDto)
      .expect(201);
    const user = userResponse.body.user;

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user.email,
        password: userDto.password,
      })
      .expect(200);

    userId = user.id;
    jwtToken = response.body.access_token;
  });

  afterAll(async () => {
    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ['teams'],
    });
    await teamRepository.remove(user.teams);
    await userRepository.remove(user);
    await app.close();
  });

  describe('/users/my-info (GET)', () => {
    it('should return status: 200 and Serialized User Info', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/my-info')
        .set('Authorization', `Bearer ${jwtToken}`);
      const responseBody: SerializedUserInfo = JSON.parse(response.text);
      expect(response.status).toBe(200);
      expect(responseBody.id).toBe(userId);
      expect(responseBody.firstName).toBeDefined();
      expect(responseBody.lastName).toBeDefined();
      expect(responseBody.email).toBeDefined();
      expect(responseBody.emailConfirmed).toBeDefined();
      expect(responseBody.role).toBeDefined();
      expect(responseBody.isActive).toBeDefined();
      expect(responseBody.createdAt).toBeDefined();
      expect(responseBody.updatedAt).toBeDefined();
      expect(responseBody.urls).toBeDefined();
      expect(responseBody.teams).toBeDefined();
      expect(Array.isArray(responseBody.urls)).toBe(true);
      expect(Array.isArray(responseBody.teams)).toBe(true);
    });

    it('should return status: 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer()).get('/users/my-info');
      expect(response.status).toBe(401);
    });

    it('should return status: 401 when Authorization header is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/my-info')
        .set('Authorization', `Bearer invalid_token`);
      expect(response.status).toBe(401);
    });
  });

  describe('/users/update (PATCH)', () => {
    it('should return status: 200 and Serialized User Info', async () => {
      const response = await request(app.getHttpServer())
        .patch('/users/update')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
        });
      const responseBody: SerializedUserInfo = JSON.parse(response.text);
      expect(response.status).toBe(200);
      expect(responseBody.id).toBe(userId);
      expect(responseBody.firstName).toBeDefined();
      expect(responseBody.lastName).toBeDefined();
      expect(responseBody.email).toBeDefined();
      expect(responseBody.emailConfirmed).toBeDefined();
      expect(responseBody.role).toBeDefined();
      expect(responseBody.isActive).toBeDefined();
      expect(responseBody.createdAt).toBeDefined();
      expect(responseBody.updatedAt).toBeDefined();
    });

    it('should return status: 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer()).patch(
        '/users/update',
      );
      expect(response.status).toBe(401);
    });

    it('should return status: 401 when Authorization header is invalid', async () => {
      const response = await request(app.getHttpServer())
        .patch('/users/update')
        .set('Authorization', `Bearer invalid_token`);
      expect(response.status).toBe(401);
    });
  });

  describe('/users/delete (DELETE)', () => {
    it('should delete the user and return status: 200', async () => {
      // Create a user and get the JWT token
      const deleteUserDto: CreateUserDto = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: 'Password@123!',
      };
      const userResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(deleteUserDto)
        .expect(201);
      const userToDelete = userResponse.body.user;

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userToDelete.email,
          password: deleteUserDto.password,
        })
        .expect(200);

      const userId = userToDelete.id;
      const token = loginResponse.body.access_token;

      const response = await request(app.getHttpServer())
        .delete('/users/delete')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);

      const user = await userRepository.findOne({
        where: { id: userId },
      });
      expect(user).toBeNull();
    });

    it('should return status: 401 when Authorization header is missing', async () => {
      const response = await request(app.getHttpServer()).delete(
        '/users/delete',
      );
      expect(response.status).toBe(401);
    });

    it('should return status: 401 when Authorization header is invalid', async () => {
      const response = await request(app.getHttpServer())
        .delete('/users/delete')
        .set('Authorization', `Bearer invalid_token`);
      expect(response.status).toBe(401);
    });

    it('should remove the Team and the user URLs if the Team only has this one user', async () => {
      //todo implement this test
    });

    it('should not remove the Team and the user URLs if the Team has multiple users', async () => {
      //todo implement this test
    });
  });
});
