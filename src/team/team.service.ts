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
import { AddMembersDto } from './dtos/add-members.dto';
import { In } from 'typeorm';
import { RemoveMembersDto } from './dtos/remove-members.dto';
import { RemoveMemberResDto } from './dtos/remove-member-res.dto';

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
    const team = await this.findByTeamIdAndUserId(teamId, userId);
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

  async deleteTeam(userId: UUID, teamId: UUID): Promise<void> {
    const team = await this.findByTeamIdAndUserId(teamId, userId);
    await this.teamRepository.remove(team);
  }

  async addMembers(
    teamId: UUID,
    userId: UUID,
    addMembersDto: AddMembersDto,
  ): Promise<void> {
    const team = await this.findByTeamIdAndUserId(teamId, userId);

    const members = await this.usersRepository.findBy({
      email: In(addMembersDto.membersEmails),
    });

    if (members.length !== addMembersDto.membersEmails.length) {
      throw new NotFoundException(`Some members not found`);
    }

    const users = team.users;
    const usersIds = users.map((user) => user.id);
    const newMembers = members.filter(
      (member) => !usersIds.includes(member.id),
    );

    team.users = [...users, ...newMembers];
    team.updatedAt = new Date();
    await this.teamRepository.save(team);
  }

  async removeMembers(
    teamId: UUID,
    userId: UUID,
    removeMembersDto: RemoveMembersDto,
  ): Promise<RemoveMemberResDto> {
    let message = 'Members have been successfully removed from the team.';
    const team = await this.findByTeamIdAndUserId(teamId, userId);
    if (!team) {
      throw new Error(
        'Team not found or user does not have access to the team.',
      );
    }
    const members = await this.usersRepository.findBy({
      email: In(removeMembersDto.membersEmails),
    });

    if (members.length === 0) {
      throw new NotFoundException(`Members not found`);
    }

    if (members.length !== removeMembersDto.membersEmails.length) {
      const notFoundMembers = removeMembersDto.membersEmails.filter(
        (email) => !members.find((member) => member.email === email),
      );
      message += `Some members not found: ${notFoundMembers.join(',')}`;
    }

    const membersToRemove = members.filter((member) =>
      team.users.some((user) => user.id === member.id),
    );

    team.users = team.users.filter(
      (user) => !membersToRemove.some((member) => member.id === user.id),
    );
    team.updatedAt = new Date();
    await this.teamRepository.save(team);
    return { message };
  }

  async findByTeamIdAndUserId(teamId: UUID, userId: UUID): Promise<Team> {
    const team = await this.teamRepository.getTeamByIdAndUserId(teamId, userId);
    if (!team) {
      throw new NotFoundException(`Team not found`);
    }
    return team;
  }

  async findAllUserTeams(userId: UUID): Promise<Team[]> {
    const teams = await this.teamRepository.getTeamsByUserId(userId);
    if (!teams || !teams.length) {
      throw new NotFoundException(`Teams not found`);
    }
    return teams;
  }
}
