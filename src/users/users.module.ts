import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { UsersRepository } from './users.repository';
import { TeamRepository } from '../team/team.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, UsersRepository, TeamRepository],
  exports: [UsersService],
})
export class UsersModule {}
