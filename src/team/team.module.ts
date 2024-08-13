import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Url } from '../url/url.entity';
import { TeamRepository } from './team.repository';
import { UsersRepository } from '../users/users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Url, User])],
  controllers: [TeamController],
  providers: [TeamService, TeamRepository, UsersRepository],
})
export class TeamModule {}
