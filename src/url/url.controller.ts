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
import { CreateUrlDto } from './dtos/create-url.dto';
import { UrlService } from './url.service';
import { SerializedUrl } from './interceptors/serialized-url';
import { AuthGuard } from '../auth/auth.guard';
import { UserId } from '../decorators/user-id.decorator';

@Controller('url')
@UseInterceptors(ClassSerializerInterceptor)
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
    type: SerializedUrl,
  })
  async createUrl(
    @UserId() userId: string,
    @Body() createUrlDto: CreateUrlDto,
  ): Promise<SerializedUrl> {
    const url = await this.urlService.createUrl(createUrlDto, userId);
    return new SerializedUrl(url);
  }
}
