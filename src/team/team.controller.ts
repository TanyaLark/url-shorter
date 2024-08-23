import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TeamService } from './team.service';
import { UserId } from '../decorators/user-id.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { CreateTeamDto } from './dtos/create-team.dto';
import { SerializedTeam } from './interceptors/serialized-team';
import { UpdateTeamDto } from './dtos/update-team.dto';
import { UUID } from '../common/types';
import { SerializedUpdatedTeam } from './interceptors/serialized-updated-team';
import { AddMembersDto } from './dtos/add-members.dto';
import { Team } from './team.entity';
import { RemoveMembersDto } from './dtos/remove-members.dto';
import { RemoveMemberResDto } from './dtos/remove-member-res.dto';

@Controller('team')
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('team')
@ApiBearerAuth()
export class TeamController {
  constructor(private teamService: TeamService) {}

  @UseGuards(AuthGuard)
  @Post('/create')
  @ApiOperation({ summary: 'Create a new team' })
  @ApiResponse({
    status: 201,
    description: 'The team has been successfully created.',
    type: SerializedTeam,
  })
  async createTeam(
    @UserId() userId: UUID,
    @Body() createTeamDto: CreateTeamDto,
  ): Promise<SerializedTeam> {
    const team = await this.teamService.createTeam(createTeamDto, userId);
    return new SerializedTeam(team);
  }

  @UseGuards(AuthGuard)
  @Patch('/update/id/:teamId')
  @ApiOperation({ summary: 'Update team information' })
  @ApiResponse({
    status: 200,
    description: 'The team has been successfully updated.',
    type: SerializedUpdatedTeam,
  })
  async updateTeam(
    @UserId() userId: UUID,
    @Param('teamId', new ParseUUIDPipe()) teamId: UUID,
    @Body() updateTeamDto: UpdateTeamDto,
  ): Promise<SerializedUpdatedTeam> {
    const team = await this.teamService.updateTeam(
      userId,
      teamId,
      updateTeamDto,
    );
    return new SerializedUpdatedTeam(team);
  }

  @UseGuards(AuthGuard)
  @Delete('/delete/id/:teamId')
  @ApiOperation({ summary: 'Delete a team' })
  @ApiResponse({
    status: 200,
    description: 'The team  has been successfully deleted.',
  })
  async deleteTeam(
    @UserId() userId: UUID,
    @Param('teamId', new ParseUUIDPipe()) teamId: UUID,
  ): Promise<void> {
    await this.teamService.deleteTeam(userId, teamId);
  }

  @UseGuards(AuthGuard)
  @Put('add-members/team-id/:teamId')
  @ApiOperation({ summary: 'Add members to the team' })
  @ApiResponse({
    status: 200,
    description: 'Members have been successfully added to the team.',
  })
  async addMembers(
    @UserId() userId: UUID,
    @Param('teamId', new ParseUUIDPipe()) teamId: UUID,
    @Body() addMembersDto: AddMembersDto,
  ): Promise<void> {
    await this.teamService.addMembers(teamId, userId, addMembersDto);
  }

  @UseGuards(AuthGuard)
  @Put('/remove-members/team-id/:teamId')
  @ApiOperation({ summary: 'Remove a member from the team' })
  @ApiResponse({
    status: 200,
    description: 'The member  has been successfully removed from the team.',
    type: RemoveMemberResDto,
  })
  async removeMembers(
    @UserId() userId: UUID,
    @Param('teamId', new ParseUUIDPipe()) teamId: UUID,
    @Body() removeMembersDto: RemoveMembersDto,
  ): Promise<RemoveMemberResDto> {
    return await this.teamService.removeMembers(
      teamId,
      userId,
      removeMembersDto,
    );
  }

  @UseGuards(AuthGuard)
  @Get('/id/:teamId')
  @ApiOperation({ summary: 'Get a single team' })
  @ApiResponse({
    status: 200,
    description: 'Return the team',
    type: Team,
  })
  async getTeamById(
    @UserId('userID', new ParseUUIDPipe()) userId: UUID,
    @Param('teamId', new ParseUUIDPipe()) teamId: UUID,
  ): Promise<Team> {
    const team = await this.teamService.findByTeamIdAndUserId(teamId, userId);
    return team;
  }

  @UseGuards(AuthGuard)
  @Get('/all')
  @ApiOperation({ summary: 'Get all user teams' })
  @ApiResponse({
    status: 200,
    description: 'Return all user teams',
    type: [SerializedTeam],
  })
  async getAllTeams(@UserId() userId: UUID): Promise<SerializedTeam[]> {
    const teams = await this.teamService.findAllUserTeams(userId);
    return teams.map((team) => new SerializedTeam(team));
  }
}
