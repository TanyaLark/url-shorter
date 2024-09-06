import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(user: CreateUserDto): Promise<User> {
    return this.usersService.create(user);
  }

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    if (!email || !pass) {
      throw new BadRequestException();
    }

    try {
      const user = await this.usersService.findUserByEmail(email);
      const hash = await bcrypt.hash(pass, user.salt);
      if (user?.passwordHash !== hash) {
        throw new UnauthorizedException('Incorrect email or password');
      }
      const payload = { sub: user.id, email: user.email };
      const options = {
        secret: process.env.JWT_SECRET,
        expiresIn: '1d',
      };
      return {
        access_token: await this.jwtService.signAsync(payload, options),
      };
    } catch (error) {
      throw new UnauthorizedException('Incorrect email or password');
    }
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    try {
      const user = await this.usersService.getUserInfo(userId);
      const oldPasswordHash = await bcrypt.hash(oldPassword, user.salt);
      if (user.passwordHash !== oldPasswordHash) {
        throw new BadRequestException('Old password is incorrect');
      }
      const salt = await bcrypt.genSalt();
      const newPasswordHash = await bcrypt.hash(newPassword, salt);
      await this.usersService.updatePassword(userId, newPasswordHash, salt);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException('Incorrect old password');
      }
      throw error;
    }
  }
}
