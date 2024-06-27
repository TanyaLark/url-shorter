import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';

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
            signUp: jest.fn().mockResolvedValue('User registered'),
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
    it('should call authService.signUp with the correct parameters', async () => {
      const userDto: CreateUserDto = {
        firstName: 'test',
        lastName: 'test',
        email: 'test',
        password: 'test',
      };
      await controller.signUp(userDto);
      expect(authService.signUp).toHaveBeenCalledWith(userDto);
    });

    it('should return the result of authService.signUp', async () => {
      const userDto: CreateUserDto = {
        firstName: 'test',
        lastName: 'test',
        email: 'test',
        password: 'test',
      };
      const result = await controller.signUp(userDto);
      expect(result).toBe('User registered');
    });

    it('should throw an error if authService.signUp fails', async () => {
      const userDto: CreateUserDto = {
        firstName: 'test',
        lastName: 'test',
        email: 'test',
        password: 'test',
      };
      jest
        .spyOn(authService, 'signUp')
        .mockRejectedValueOnce(new Error('Error registering user'));

      await expect(controller.signUp(userDto)).rejects.toThrow(
        'Error registering user',
      );
    });
  });
});
