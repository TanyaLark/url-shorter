import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { SerializedUserInfo } from './interceptors/serialized-user-info';
import { UserId } from '../decorators/user-id.decorator';
import { UUID } from '../common/types';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('my-info')
  @ApiOperation({ summary: 'Get user info' })
  @ApiResponse({
    status: 200,
    description: 'User info',
    type: SerializedUserInfo,
  })
  async getMyInfo(@UserId() userId: UUID): Promise<SerializedUserInfo> {
    const userInfo = await this.usersService.getUserInfo(userId);
    return new SerializedUserInfo(userInfo);
  }
}
