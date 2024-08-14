import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateTeamDto } from './dtos/create-team.dto';
import { Team } from './team.entity';
import { UsersRepository } from '../users/users.repository';
import { TeamRepository } from './team.repository';
import { UpdateTeamDto } from './dtos/update-team.dto';
import { UUID } from '../common/types';

@Injectable()
export class TeamService {
  private logger = new Logger(TeamService.name);
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly teamRepository: TeamRepository,
  ) {}

  async createTeam(
    createTeamDto: CreateTeamDto,
    userId: string,
  ): Promise<Team> {
    const { name } = createTeamDto;
    const team = await this.teamRepository.findOne({ where: { name } });
    if (team) {
      throw new BadRequestException(`Team with name ${name} already exists`);
    }
    const user = await this.usersRepository.findOneBy({ id: userId });
    try {
      return this.teamRepository.createTeam(createTeamDto, user);
    } catch (error) {
      this.logger.log(
        `TeamService:createTeam: ${JSON.stringify(error.message)}`,
      );
      throw error;
    }
  }

  async updateTeam(
    userId: UUID,
    teamId: UUID,
    { name, icon }: UpdateTeamDto,
  ): Promise<Team> {
    const team = await this.teamRepository.getTeamByIdAndUserId(teamId, userId);
    if (!team) {
      throw new NotFoundException(`Team not found`);
    }

    if (name || icon) {
      if (name) {
        team.name = name;
      }
      if (icon) {
        team.icon = icon;
      }
      return this.teamRepository.save(team);
    }

    return team;
  }
}
