import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { mockRepository } from './mocks/mock.users.repository';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dtos/create-user.dto';
import { User, UserRole } from './user.entity';

describe('UsersRepository', () => {
  let usersRepository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersRepository, mockRepository],
    }).compile();

    usersRepository = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(usersRepository).toBeDefined();
  });

  describe('store', () => {
    it('should create and save a new user', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'Tania',
        lastName: 'Benjamin',
        email: 'taniaben@gmail.com',
        password: 'taniaSuperPass@1',
      };
      const { firstName, lastName, email } = createUserDto;
      const payload = {
        firstName,
        lastName,
        email,
        salt: 'someSalt',
        passwordHash: 'someHash',
      };
      const createdUser = {
        id: '931f3e88-513d-4d23-9d38-c7714b96f1bd',
        firstName,
        lastName,
        email,
        passwordHash: 'someHash',
        salt: 'someSalt',
      } as User;

      const savedUser = {
        id: '931f3e88-513d-4d23-9d38-c7714b96f1bd',
        firstName,
        lastName,
        email,
        passwordHash: 'someHash',
        salt: 'someSalt',
        emailConfirmToken: null,
        emailConfirmed: true,
        role: UserRole.User,
        isActive: true,
        createdAt: new Date(),
        updatedAt: null,
      } as User;

      jest
        .spyOn(bcrypt, 'genSalt')
        .mockImplementation(async () => payload.salt);
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(async () => payload.passwordHash);
      jest.spyOn(usersRepository, 'create').mockReturnValue(createdUser);
      jest.spyOn(usersRepository, 'save').mockResolvedValue(savedUser);

      const result = await usersRepository.store(createUserDto);

      expect(bcrypt.genSalt).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).toHaveBeenCalledWith(
        createUserDto.password,
        payload.salt,
      );
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(payload);
      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(savedUser);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('firstName', firstName);
      expect(result).toHaveProperty('lastName', lastName);
      expect(result).toHaveProperty('email', email);
      expect(result).toHaveProperty('passwordHash');
      expect(result).toHaveProperty('salt');
      expect(result).toHaveProperty('emailConfirmToken');
      expect(result).toHaveProperty('emailConfirmed');
      expect(result).toHaveProperty('role');
      expect(result).toHaveProperty('isActive');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
      expect(result.updatedAt).toBeNull();
    });
  });
});
