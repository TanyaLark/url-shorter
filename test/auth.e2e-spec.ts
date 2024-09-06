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
import { Team } from '../src/team/team.entity';
import { ChangePasswordDto } from '../src/auth/dto/change-password-dto';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let teamRepository: Repository<Team>;
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
    teamRepository = moduleFixture.get<Repository<Team>>(
      getRepositoryToken(Team),
    );
  });

  afterAll(async () => {
    //remove user and all user teams
    const users = await userRepository.find({
      where: emailStorage.map((email) => ({ email })),
      relations: ['teams'],
    });

    for (const user of users) {
      await teamRepository.remove(user.teams);
    }
    await userRepository.remove(users);
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

    it('should return 401 Unauthorized and message "Incorrect email or password"', async () => {
      const userDto = {
        email: emailStorage[0],
        password: 'wrong_Password@123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(userDto)
        .expect(401);
      const res = JSON.parse(response.text);

      expect(res.message).toEqual('Incorrect email or password');
    });
  });

  describe('/auth/change-password (POST)', () => {
    const userData = {
      userId: null,
      token: null,
    };
    const changePasswordDto: ChangePasswordDto = {
      oldPassword: '',
      newPassword: 'NewPassword@123!',
    };

    beforeAll(async () => {
      // Create a user and get the JWT token
      const userToChangePassDto: CreateUserDto = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: 'Password@123!',
      };
      const userResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userToChangePassDto)
        .expect(201);
      const userToChangePass = userResponse.body.user;

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userToChangePass.email,
          password: userToChangePassDto.password,
        })
        .expect(200);

      userData.userId = userToChangePass.id;
      userData.token = loginResponse.body.access_token;

      changePasswordDto.oldPassword = userToChangePassDto.password;
    });

    it('should return 200 OK and description: Password changed successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${userData.token}`)
        .send(changePasswordDto);

      expect(response.body.status).toBe(200);
      expect(response.body.description).toEqual(
        'Password changed successfully',
      );
    });

    it('should return 400 Bad Request and message "Incorrect old password"', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${userData.token}`)
        .send(changePasswordDto);

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual('Incorrect old password');
    });

    it('should return 400 Bad Request and class-validator errors', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${userData.token}`)
        .send({ oldPassword: '', newPassword: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual([
        'oldPassword is not strong enough',
        'oldPassword should not be empty',
        'newPassword is not strong enough',
        'newPassword should not be empty',
      ]);
    });

    it('should return 401 Unauthorized and message "Unauthorized"', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/change-password')
        .send(changePasswordDto);

      expect(response.status).toBe(401);
      expect(response.body.message).toEqual('Unauthorized');
    });

    afterAll(async () => {
      //remove user and user teams
      const users = await userRepository.find({
        where: { id: userData.userId },
        relations: ['teams'],
      });
      await teamRepository.remove(users[0].teams);
      await userRepository.remove(users);
    });
  });
});
