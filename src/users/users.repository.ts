import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import * as bcrypt from 'bcrypt';

export class UsersRepository extends Repository<User> {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    super(
      usersRepository.target,
      usersRepository.manager,
      usersRepository.queryRunner,
    );
  }

  public async findAll(): Promise<User[]> {
    return this.find();
  }

  public async findById(id: string): Promise<User | null> {
    return this.findOneBy({ id: id });
  }

  public async store(user: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    const { firstName, lastName, email, password } = user;
    const hash = await bcrypt.hash(password, salt);
    const payload = { firstName, lastName, email, salt, passwordHash: hash };
    const newUser = this.create(payload);
    return this.save(newUser);
  }

  // public async updateOne(
  //   id: number,
  //   updateUserDto: UpdateUsersDto,
  // ): Promise<User | undefined> {
  //   const user = await this.findById(id);
  //   if (!user) return undefined;
  //   Object.assign(user, updateUserDto);
  //   return this.save(user);
  // }

  // public async destroy(id: number): Promise<void> {
  //   await this.delete(id);
  // }
}
