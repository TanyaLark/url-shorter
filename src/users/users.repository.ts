import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { UUID } from '../common/types';

export interface IUsersRepository {
  store(user: CreateUserDto): Promise<User>;
  getUserInfo(userId: UUID): Promise<User>;
}

@Injectable()
export class UsersRepository
  extends Repository<User>
  implements IUsersRepository
{
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  public async store(user: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    const { firstName, lastName, email, password } = user;
    const hash = await bcrypt.hash(password, salt);
    const payload = { firstName, lastName, email, salt, passwordHash: hash };
    const newUser = this.create(payload);
    return this.save(newUser);
  }

  public async getUserInfo(userId: UUID): Promise<User> {
    const userWithUrlsAndTeams = await this.dataSource
      .createQueryBuilder(User, 'user')
      .leftJoinAndSelect('user.urls', 'urls')
      .leftJoinAndSelect('user.teams', 'teams')
      .where('user.id = :userId', { userId })
      .getOne();
    return userWithUrlsAndTeams;
  }
}
