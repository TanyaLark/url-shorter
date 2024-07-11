import { User, UserRole } from '../user.entity';
import { DataSource } from 'typeorm';

const dataSource = {
  createEntityManager: jest.fn(),
};

export const mockRepository = {
  provide: DataSource,
  useValue: dataSource,
};

export const salt = 'someSalt';
export const hash = 'someHash';
export const mockUsersRepositoryRes = {
  create: {
    firstName: 'Tania',
    lastName: 'Benjamin',
    email: 'taniaben@gmail.com',
    passwordHash: hash,
    salt: salt,
  } as User,
  save: {
    id: '931f3e88-513d-4d23-9d38-c7714b96f1bd',
    firstName: 'Tania',
    lastName: 'Benjamin',
    email: 'taniaben@gmail.com',
    passwordHash: hash,
    salt: salt,
    emailConfirmToken: null,
    emailConfirmed: true,
    role: UserRole.User,
    isActive: true,
    createdAt: new Date(), //'2024-07-08T10:36:35.989Z'
    updatedAt: null,
  } as User,
};
