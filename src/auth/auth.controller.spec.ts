import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { SignUpResDto } from './dto/sign-up-res.dto';
import { HttpStatus } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          global: true,
          secret: jwtConstants.secret,
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
      const signUpResponse: SignUpResDto = {
        status: HttpStatus.CREATED,
        description: 'User registered',
      };

      (authService.signUp as jest.Mock).mockResolvedValue(signUpResponse);

      const result = await controller.signUp(createUserDto);
      expect(result).toEqual(signUpResponse);
      expect(authService.signUp).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('signIn', () => {
    it('should login a user successfully', async () => {
      const loginDto: LoginDto = {
        username: 'Tania Benjamin',
        password: 'password',
      };
      const tokenResponse = { access_token: 'testToken' };

      (authService.signIn as jest.Mock).mockResolvedValue(tokenResponse);

      const result = await controller.signIn(loginDto);
      expect(result).toEqual(tokenResponse);
      expect(authService.signIn).toHaveBeenCalledWith(
        loginDto.username,
        loginDto.password,
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const req = {
        user: { id: 1, username: 'Tania Benjamin' },
      };

      const result = controller.getProfile(req);
      expect(result).toEqual(req.user);
    });
  });
});
