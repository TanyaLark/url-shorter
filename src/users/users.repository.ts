import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/create-users.dto';

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

  public async findById(id: number): Promise<User | null> {
    return this.findOneBy({ id: id });
  }

  public async store(user: CreateUserDto): Promise<User> {
    const newUser = this.create(user);
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
