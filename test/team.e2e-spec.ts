import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { Team } from '../src/team/team.entity';
import { User } from '../src/users/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/http-exception.filter';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from '../src/users/dtos/create-user.dto';
import { CreateTeamDto } from '../src/team/dtos/create-team.dto';
import { SerializedTeam } from '../src/team/interceptors/serialized-team';
import { UpdateTeamDto } from '../src/team/dtos/update-team.dto';
import { SerializedUpdatedTeam } from '../src/team/interceptors/serialized-updated-team';

describe('TeamController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let teamRepository: Repository<Team>;
  const userDto: CreateUserDto = {
    firstName: 'JohnE2ETeam',
    lastName: 'DoeTeam',
    email: 'johndoeTeam@example.com',
    password: 'e2eTeamPassWord123@',
  };
  const teamDto: CreateTeamDto = { name: 'TeamE2E' };
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
    await teamRepository.remove(
      await teamRepository.find({
        where: { name: teamDto.name },
      }),
    );
    await app.close();
  });

  describe('POST /team/create', () => {
    it('should create a new team', async () => {
      const responseTeam = await request(app.getHttpServer())
        .post('/team/create')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(teamDto);

      const responseBody: SerializedTeam = JSON.parse(responseTeam.text);
      expect(responseTeam.status).toBe(201);
      expect(responseBody.name).toBe(teamDto.name);
      expect(responseBody.createdAt).toBeDefined();
      expect(responseBody.id).toBeDefined();
    });

    it('should return 400 if the team already exists', async () => {
      return request(app.getHttpServer())
        .post('/team/create')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(teamDto)
        .expect(400);
    });

    it('should return 401 if the JWT token is missing', async () => {
      return request(app.getHttpServer())
        .post('/team/create')
        .send(teamDto)
        .expect(401);
    });
  });

  describe('PATCH /team/update/id/:teamId', () => {
    let teamId: string;
    const createDto: CreateTeamDto = { name: 'TeamE2EUpdate' };
    const updateDto: UpdateTeamDto = { name: 'TeamE2EUpdated' };

    beforeAll(async () => {
      const responseTeam = await request(app.getHttpServer())
        .post('/team/create')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createDto);

      teamId = JSON.parse(responseTeam.text).id;
    });

    it('should update the team information', async () => {
      const responseTeam = await request(app.getHttpServer())
        .patch(`/team/update/id/${teamId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateDto);

      const responseBody: SerializedUpdatedTeam = JSON.parse(responseTeam.text);
      expect(responseTeam.status).toBe(200);
      expect(responseBody.name).toBe(updateDto.name);
      expect(responseBody.icon).toBeDefined();
      expect(responseBody.createdAt).toBeDefined();
      expect(responseBody.updatedAt).toBeDefined();
      expect(responseBody.id).toBeDefined();
    });

    it('should return 400 if the teamId invalid', async () => {
      return request(app.getHttpServer())
        .patch(`/team/update/id/invalidId`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ name: 'TeamE2EUpdated' })
        .expect(400);
    });

    it('should return 401 if the JWT token is missing', async () => {
      return request(app.getHttpServer())
        .patch(`/team/update/id/${teamId}`)
        .send({ name: 'TeamE2EUpdated' })
        .expect(401);
    });

    it('should return 404 if the team does not exist', async () => {
      return request(app.getHttpServer())
        .patch(`/team/update/id/123e4567-e89b-12d3-a456-426614174000`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ name: 'TeamE2EUpdated' })
        .expect(404);
    });

    afterAll(async () => {
      await teamRepository.remove(
        await teamRepository.find({
          where: { name: updateDto.name },
        }),
      );
    });
  });
});
