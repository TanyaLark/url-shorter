import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { SerializedUser } from './Interceptors/serialized-user';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(user: CreateUserDto): Promise<SerializedUser> {
    const { email } = user;
    const foundedUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (foundedUser) {
      throw new BadRequestException(`User with email ${email} already exists`);
    }

    try {
      const createdUser = await this.usersRepository.store(user);
      return new SerializedUser(createdUser);
    } catch (error) {
      this.logger.log(`UsersService:create: ${JSON.stringify(error.message)}`);
      throw new Error(error.message);
    }
  }

  async findUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({ where: { email } });
      if (!user) {
        throw new Error('User not found.');
      }
      return user;
    } catch (error) {
      this.logger.log(`UsersService:findOne: ${JSON.stringify(error.message)}`);
      throw new Error(error.message);
    }
  }

  // async findById(id: string): Promise<SerializedUser> {
  //   try {
  //     const user = await this.usersRepository.findById(id);
  //     if (!user) {
  //       throw new Error('User not found.');
  //     }
  //     return user;
  //   } catch (error) {
  //     this.logger.log(
  //       `UsersService:findById: ${JSON.stringify(error.message)}`,
  //     );
  //     throw new Error(error.message);
  //   }
  // }

  // public async findAll(): Promise<User[]> {
  //   try {
  //     const users = await this.usersRepository.findAll();
  //     if (users?.length === 0) {
  //       throw new Error('No record found.');
  //     }
  //     return users;
  //   } catch (error) {
  //     this.logger.log(
  //       `UsersService:findAll : ${JSON.stringify(error.message)}`,
  //     );
  //   }
  // }

  // async update(id: number, user: User): Promise<User> {
  //   try {
  //     await this.findById(id);
  //     return await this.userRepository.updateOne(id, user);
  //   } catch (error) {
  //     this.logger.log(`UsersService:update: ${JSON.stringify(error.message)}`);
  //     throw new Error(error.message);
  //   }
  // }

  // async delete(id: number) {
  //   try {
  //     return await this.userRepository.destroy(id);
  //   } catch (error) {
  //     this.logger.log(`UsersService:delete: ${JSON.stringify(error.message)}`);
  //     throw new Error(error.message);
  //   }
  // }
}
