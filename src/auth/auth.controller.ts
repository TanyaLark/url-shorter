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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { SignUpResDto } from './dto/sign-up-res.dto';
import { LoginResDto } from './dto/login-res.dto';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered',
  })
  async signUp(@Body() user: CreateUserDto): Promise<SignUpResDto> {
    const createdUser = await this.authService.signUp(user);
    if (createdUser) {
      return {
        status: HttpStatus.CREATED,
        description: 'User registered',
      };
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
  })
  async signIn(@Body() signInDto: LoginDto): Promise<LoginResDto> {
    const { email, password } = signInDto;
    return this.authService.signIn(email, password);
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
