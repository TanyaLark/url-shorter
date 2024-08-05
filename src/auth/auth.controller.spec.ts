import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { RegisterResponseDto } from './dto/sign-up-res.dto';
import { HttpStatus } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { User, UserRole } from '../users/user.entity';
import { SerializedUser } from './interceptors/serialized-registered-user';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          global: true,
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '60s' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signUp: jest.fn(),
            signIn: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should register a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'Tania',
        lastName: 'Benjamin',
        email: 'taniaben@gmail.com',
        password: 'taniaSuperPass@1',
      };
      const createdAtMock = new Date();
      const userMock: User = {
        id: '1',
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        emailConfirmed: true,
        emailConfirmToken: 'token',
        passwordHash: 'passwordHash',
        salt: 'salt',
        role: UserRole.User,
        isActive: true,
        createdAt: createdAtMock,
        updatedAt: null,
        urls: [],
        updateTimestamp: jest.fn(),
      };
      const signUpResponse: RegisterResponseDto = {
        status: HttpStatus.CREATED,
        description: 'User registered',
        user: new SerializedUser(userMock),
      };

      (authService.signUp as jest.Mock).mockResolvedValue(signUpResponse);
      jest.spyOn(authService, 'signUp').mockResolvedValue(userMock);
      const result = await controller.signUp(createUserDto);
      expect(authService.signUp).toHaveBeenCalledWith(createUserDto);
      expect(result.status).toEqual(signUpResponse.status);
      expect(result.description).toEqual(signUpResponse.description);
      expect(result.user).toEqual(signUpResponse.user);
    });
  });

  describe('signIn', () => {
    it('should login a user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'taniaben@gmail.com',
        password: 'taniaSuperPass@1',
      };
      const tokenResponse = { access_token: 'testToken' };

      (authService.signIn as jest.Mock).mockResolvedValue(tokenResponse);

      const result = await controller.signIn(loginDto);
      expect(result).toEqual(tokenResponse);
      expect(authService.signIn).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });
  });
});
