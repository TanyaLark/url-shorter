import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { SerializedUser } from '../auth/interceptors/serialized-registered-user';
import { User, UserRole } from './user.entity';
import { PreconditionFailedException } from '@nestjs/common';
import { MockUsersRepository } from './mocks/mock.users.repository';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useClass: MockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const userDto: CreateUserDto = {
        firstName: 'Tania',
        lastName: 'Benjamin',
        email: 'taniaben@gmail.com',
        password: 'taniaSuperPass@1',
      };

      const createdUser = await repository.store(userDto);
      const serializedUser = new SerializedUser(createdUser);
      jest.spyOn(repository, 'store');

      const result = await service.create(userDto);
      expect(result).toEqual(serializedUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: userDto.email },
      });
      expect(repository.store).toHaveBeenCalledWith(userDto);
    });

    it('should throw PreconditionFailedException if user already exists', async () => {
      const userDto: CreateUserDto = {
        firstName: 'Tania',
        lastName: 'Benjamin',
        email: 'taniaben@gmail.com',
        password: 'taniaSuperPass@1',
      };
      const existingUser: User = {
        id: '931f3e88-513d-4d23-9d38-c7714b96f1bd',
        firstName: 'Tania',
        lastName: 'Benjamin',
        email: 'taniaben@gmail.com',
        passwordHash: 'someHash',
        salt: 'someSalt',
        emailConfirmToken: null,
        emailConfirmed: true,
        role: UserRole.User,
        isActive: true,
        createdAt: new Date(),
        updatedAt: null,
      } as User;

      (repository.findOne as jest.Mock).mockResolvedValue(existingUser);

      await expect(service.create(userDto)).rejects.toThrow(
        PreconditionFailedException,
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: userDto.email },
      });
      expect(repository.store).not.toHaveBeenCalled();
    });

    it('should log and throw an error if store method fails', async () => {
      const userDto: CreateUserDto = {
        firstName: 'Tania',
        lastName: 'Benjamin',
        email: 'taniaben@gmail.com',
        password: 'taniaSuperPass@1',
      };

      (repository.findOne as jest.Mock).mockResolvedValue(null);
      (repository.store as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.create(userDto)).rejects.toThrow('Database error');
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: userDto.email },
      });
      expect(repository.store).toHaveBeenCalledWith(userDto);
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const lastName = 'Doe';
      const user: User = {
        id: '931f3e88-513d-4d23-9d38-c7714b96f1bd',
        firstName: 'Tania',
        lastName: 'Benjamin',
        email: 'taniaben@gmail.com',
        passwordHash: 'someHash',
        salt: 'someSalt',
        emailConfirmToken: null,
        emailConfirmed: true,
        role: UserRole.User,
        isActive: true,
        createdAt: new Date(),
        updatedAt: null,
      } as User;

      (repository.findOne as jest.Mock).mockResolvedValue(user);

      const result = await service.findOne(lastName);
      expect(result).toEqual(user);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { lastName } });
    });

    it('should throw an error if user not found', async () => {
      const lastName = 'Doe';

      (repository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(lastName)).rejects.toThrow(
        'User not found.',
      );
      expect(repository.findOne).toHaveBeenCalledWith({ where: { lastName } });
    });

    it('should log and throw an error if findOne method fails', async () => {
      const lastName = 'Doe';

      (repository.findOne as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.findOne(lastName)).rejects.toThrow('Database error');
      expect(repository.findOne).toHaveBeenCalledWith({ where: { lastName } });
    });
  });
});
