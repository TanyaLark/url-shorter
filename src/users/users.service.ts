import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './user.entity';
import { TeamRepository } from '../team/team.repository';
import { CreateTeamDto } from '../team/dtos/create-team.dto';
import { UUID } from '../common/types';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UrlRepository } from '../url/url.repository';
@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly teamRepository: TeamRepository,
    private readonly urlRepository: UrlRepository,
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
      throw error;
    }
  }

  async getUserInfo(userId: UUID): Promise<User> {
    try {
      const user = this.usersRepository.getUserInfo(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      this.logger.log(
        `UsersService:getUserInfo: ${JSON.stringify(error.message)}`,
      );
      throw new Error(error.message);
    }
  }

  async update(userId: UUID, user: UpdateUserDto): Promise<User> {
    const { firstName, lastName, avatar } = user;
    const foundedUser = await this.usersRepository.findOneBy({ id: userId });
    if (!foundedUser) {
      throw new NotFoundException('User not found');
    }
    if (firstName) {
      foundedUser.firstName = firstName;
    }
    if (lastName) {
      foundedUser.lastName = lastName;
    }
    if (avatar) {
      foundedUser.avatar = avatar;
    }
    return this.usersRepository.save(foundedUser);
  }

  async delete(userId: UUID): Promise<void> {
    try {
      const foundedUser = await this.usersRepository.getUserInfo(userId);
      if (!foundedUser) {
        throw new NotFoundException('User not found');
      }

      const foundedTeams = foundedUser.teams;
      for (const team of foundedTeams) {
        const teamWithUsers = await this.teamRepository.getTeamByIdAndUserId(
          team.id,
          userId,
        );
        // Check if the team has only one user
        if (teamWithUsers.users.length === 1) {
          const urls = await this.urlRepository.getUrlByTeamId(team.id);
          // Remove all urls associated with the team
          for (const url of urls) {
            await this.urlRepository.remove(url);
          }
          await this.teamRepository.remove(team);
        }
      }
      await this.usersRepository.remove(foundedUser);
    } catch (error) {
      this.logger.log(`UsersService:delete: ${JSON.stringify(error.message)}`);
      throw new Error(error.message);
    }
  }

  async updatePassword(
    userId: UUID,
    newPasswordHash: string,
    newSalt: string,
  ): Promise<void> {
    const user = await this.usersRepository.getUserInfo(userId);
    user.passwordHash = newPasswordHash;
    user.salt = newSalt;
    await this.usersRepository.save(user);
  }
}
