import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Team } from './team.entity';
import { CreateTeamDto } from './dtos/create-team.dto';
import { User } from '../users/user.entity';
import { UUID } from '../common/types';

export interface ITeamRepository {
  createTeam(createTeamDto: CreateTeamDto, user: User): Promise<Team>;
  getTeamByIdAndUserId(teamId: UUID, userId: UUID): Promise<Team>;
}

@Injectable()
export class TeamRepository
  extends Repository<Team>
  implements ITeamRepository
{
  constructor(private dataSource: DataSource) {
    super(Team, dataSource.createEntityManager());
  }

  async createTeam(createTeamDto: CreateTeamDto, user: User): Promise<Team> {
    const payload = { ...createTeamDto, users: [user] };
    const newTeam = this.create(payload);
    const res = await this.save(newTeam);
    return res;
  }

  async getTeamByIdAndUserId(teamId: UUID, userId: UUID): Promise<Team> {
    return this.dataSource
      .getRepository(Team)
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.users', 'userToSearch')
      .leftJoinAndSelect('team.users', 'users')
      .where('team.id = :teamId', { teamId })
      .andWhere('userToSearch.id = :userId', { userId })
      .getOne();
  }
}
