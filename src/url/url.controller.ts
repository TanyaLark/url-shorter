import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUrlDto } from './dtos/create-url.dto';
import { UrlService } from './url.service';
import { SerializedUrl } from './Interceptors/serialized-url';
import { AuthGuard } from '../auth/auth.guard';
import { UserId } from '../decorators/user-id.decorator';

@Controller('url')
@ApiTags('url')
@ApiBearerAuth()
export class UrlController {
  constructor(private urlService: UrlService) {}

  @UseGuards(AuthGuard)
  @Post('/create')
  @ApiOperation({ summary: 'Create a new short URL' })
  @ApiResponse({
    status: 201,
    description: 'The short URL has been successfully created.',
  })
  async createUrl(
    @UserId() userId: string,
    @Body() createUrlDto: CreateUrlDto,
  ): Promise<SerializedUrl> {
    return this.urlService.createUrl(createUrlDto, userId);
  }
}
