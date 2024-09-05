import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { RegisterResponseDto } from './dto/response-dtos/sign-up-res.dto';
import { LoginResponseDto } from './dto/response-dtos/login-res.dto';
import { SerializedRegisteredUser } from './interceptors/serialized-registered-user';
import { AuthGuard } from './auth.guard';
import { ChangePasswordDto } from './dto/change-password-dto';
import { UserId } from '../decorators/user-id.decorator';
import { UUID } from '../common/types';
import { ChangePasswordResponseDto } from './dto/response-dtos/change-password-res.dto';

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

  @UseGuards(AuthGuard)
  @Post('change-password')
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password changed successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Incorrect old password',
  })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @UserId() userId: UUID,
  ): Promise<ChangePasswordResponseDto> {
    const { oldPassword, newPassword } = changePasswordDto;
    await this.authService.changePassword(userId, oldPassword, newPassword);
    return {
      status: HttpStatus.OK,
      description: 'Password changed successfully',
    };
  }
}
