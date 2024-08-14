import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
}
