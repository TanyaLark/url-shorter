import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Res,
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
import { Response } from 'express';

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
  async createShortUrl(
    @UserId() userId: string,
    @Body() createUrlDto: CreateUrlDto,
  ): Promise<SerializedUrl> {
    const url = await this.urlService.createUrl(createUrlDto, userId);
    return new SerializedUrl(url);
  }

  // By default, Postman follows redirects, which means you might see the response from the final URL with a 200 status code
  // rather than the 302 redirect response.
  // To see the 302 status code, you can disable automatic redirects in Postman settings.
  // Or use curl command, where -i flag is used to include the HTTP headers in the response.
  // Example: curl -i http://localhost:3000/url/3cfe9c
  @Get('/:shortUrl')
  @ApiOperation({ summary: 'Redirect to the original URL' })
  @ApiResponse({
    status: 302,
    description: 'Redirect to the original URL',
  })
  async redirect(
    @Param('shortUrl') shortUrl: string,
    @Res() response: Response,
  ): Promise<void> {
    const url = await this.urlService.findByCode(shortUrl);
    response.redirect(302, url.originalUrl);
  }
}
