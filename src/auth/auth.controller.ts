import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { SerializedUser } from '../users/Interceptors/serialized-user';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered',
  })
  async signUp(@Body() user: CreateUserDto): Promise<SerializedUser> {
    return this.authService.signUp(user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
  })
  signIn(@Body() signInDto: LoginDto) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile retrieved',
  })
  getProfile(@Req() req) {
    return req.user;
  }
}
