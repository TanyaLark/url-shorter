import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Team } from './team.entity';
import { CreateTeamDto } from './dtos/create-team.dto';
import { User } from '../users/user.entity';

export interface ITeamRepository {
  createTeam(createTeamDto: CreateTeamDto, user: User): Promise<Team>;
}

@Injectable()
export class TeamRepository extends Repository<Team> {
  constructor(private dataSource: DataSource) {
    super(Team, dataSource.createEntityManager());
  }

  async createTeam(createTeamDto: CreateTeamDto, user: User): Promise<Team> {
    const payload = { ...createTeamDto, users: [user] };
    const newTeam = this.create(payload);
    const res = await this.save(newTeam);
    return res;
  }
}
