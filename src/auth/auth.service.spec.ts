import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { SerializedUser } from './interceptors/serialized-registered-user';
import { User, UserRole } from '../users/user.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'Tania',
        lastName: 'Benjamin',
        email: 'taniaben@gmail.com',
        password: 'taniaSuperPass@1',
      };
      const createdUser = new SerializedUser({
        id: '931f3e88-513d-4d23-9d38-c7714b96f1bd',
        firstName: 'Tania',
        lastName: 'Benjamin',
        email: 'taniaben@gmail.com',
        passwordHash: 'hash',
        salt: 'salt',
        emailConfirmToken: null,
        emailConfirmed: true,
        role: UserRole.User,
        isActive: true,
        createdAt: new Date(),
        updatedAt: null,
      });

      (usersService.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await service.signUp(createUserDto);
      expect(result).toEqual(createdUser);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('signIn', () => {
    it('should return an access token if credentials are valid', async () => {
      const lastName = 'Benjamin';
      const password = 'hash';
      const user: User = {
        id: '931f3e88-513d-4d23-9d38-c7714b96f1bd',
        firstName: 'Tania',
        lastName: 'Benjamin',
        email: 'taniaben@gmail.com',
        passwordHash: 'hash',
        salt: 'salt',
        emailConfirmToken: null,
        emailConfirmed: true,
        role: UserRole.User,
        isActive: true,
        createdAt: new Date(),
        updatedAt: null,
      } as User;
      const token = 'testToken';

      (usersService.findOne as jest.Mock).mockResolvedValue(user);
      (jwtService.signAsync as jest.Mock).mockResolvedValue(token);

      const result = await service.signIn(lastName, password);
      expect(result).toEqual({ access_token: token });
      expect(usersService.findOne).toHaveBeenCalledWith(lastName);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        username: user.lastName,
      });
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const lastName = 'Doe';
      const password = 'wrongPassword';
      const user: User = {
        id: '931f3e88-513d-4d23-9d38-c7714b96f1bd',
        firstName: 'Tania',
        lastName: 'Benjamin',
        email: 'taniaben@gmail.com',
        passwordHash: 'hash',
        salt: 'salt',
        emailConfirmToken: null,
        emailConfirmed: true,
        role: UserRole.User,
        isActive: true,
        createdAt: new Date(),
        updatedAt: null,
      } as User;

      (usersService.findOne as jest.Mock).mockResolvedValue(user);

      await expect(service.signIn(lastName, password)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findOne).toHaveBeenCalledWith(lastName);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const lastName = 'Doe';
      const password = 'password';

      (usersService.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.signIn(lastName, password)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findOne).toHaveBeenCalledWith(lastName);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
