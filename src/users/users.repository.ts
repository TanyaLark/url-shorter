import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersRepository extends Repository<User> {
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
}
