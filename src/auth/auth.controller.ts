import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { RegisterResponseDto } from './dto/sign-up-res.dto';
import { LoginResponseDto } from './dto/login-res.dto';
import { SerializedRegisteredUser } from './interceptors/serialized-registered-user';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'New user registration' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered',
    type: RegisterResponseDto,
  })
  async signUp(@Body() user: CreateUserDto): Promise<RegisterResponseDto> {
    const createdUser = await this.authService.signUp(user);
    if (createdUser) {
      return {
        status: HttpStatus.CREATED,
        description: 'User registered',
        user: new SerializedRegisteredUser(createdUser),
      };
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  async signIn(@Body() signInDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = signInDto;
    return this.authService.signIn(email, password);
  }
}
