import { CreateUserDto } from '../dtos/create-user.dto';
import { User, UserRole } from '../user.entity';
import { DataSource } from 'typeorm';
import { IUsersRepository } from '../users.repository';

const dataSource = {
  createEntityManager: jest.fn(),
};

export const mockRepository = {
  provide: DataSource,
  useValue: dataSource,
};

export class MockUsersRepository implements IUsersRepository {
  findOne = jest.fn().mockResolvedValue(null);

  public async store(user: CreateUserDto): Promise<User> {
    return {
      id: '931f3e88-513d-4d23-9d38-c7714b96f1bd',
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      passwordHash: 'someHash',
      salt: 'someSalt',
      emailConfirmToken: null,
      emailConfirmed: true,
      role: UserRole.User,
      isActive: true,
      createdAt: new Date('2024-07-08T10:36:35.989Z'),
      updatedAt: null,
    } as User;
  }

  public async getUserInfo(userId: string): Promise<User> {
    return {
      id: userId,
      firstName: 'John',
      lastName: 'Doe',
      email: 'exampleEmail@gmail.com',
      passwordHash: 'someHash',
      salt: 'someSalt',
      emailConfirmToken: null,
      emailConfirmed: true,
      role: UserRole.User,
      isActive: true,
      createdAt: new Date('2024-07-08T10:36:35.989Z'),
      updatedAt: null,
    } as User;
  }
}
