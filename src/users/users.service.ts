import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './user.entity';
import { TeamRepository } from '../team/team.repository';
import { CreateTeamDto } from '../team/dtos/create-team.dto';
@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly teamRepository: TeamRepository,
  ) {}

  async create(user: CreateUserDto): Promise<User> {
    const { email } = user;
    const foundedUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (foundedUser) {
      throw new BadRequestException(`User with email ${email} already exists`);
    }

    try {
      const createTeamDto: CreateTeamDto = { name: 'Home' };
      const createdUser = await this.usersRepository.store(user);
      await this.teamRepository.createTeam(createTeamDto, createdUser);
      return createdUser;
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
}
