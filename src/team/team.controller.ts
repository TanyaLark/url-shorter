import {
  Body,
  ClassSerializerInterceptor,
  Controller,
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
    @UserId() userId: string,
    @Body() createTeamDto: CreateTeamDto,
  ): Promise<SerializedTeam> {
    const team = await this.teamService.createTeam(createTeamDto, userId);
    return new SerializedTeam(team);
  }
}
