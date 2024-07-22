import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { SerializedUser } from '../users/Interceptors/serialized-user';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(user: CreateUserDto): Promise<SerializedUser> {
    return this.usersService.create(user);
  }

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    if (!email || !pass) {
      throw new BadRequestException();
    }
    const user = await this.usersService.findUserByEmail(email);
    const hash = await bcrypt.hash(pass, user.salt);
    if (user?.passwordHash !== hash) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, email: user.email };
    const options = {
      secret: process.env.JWT_SECRET,
      expiresIn: '1d',
    };
    return {
      access_token: await this.jwtService.signAsync(payload, options),
    };
  }
}
