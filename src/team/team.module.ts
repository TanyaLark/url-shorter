import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { TeamRepository } from './team.repository';
import { UsersRepository } from '../users/users.repository';
import { Team } from './team.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Team, User])],
  controllers: [TeamController],
  providers: [TeamService, TeamRepository, UsersRepository],
})
export class TeamModule {}
