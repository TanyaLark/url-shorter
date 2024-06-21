import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dtos/create-users.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(user: CreateUserDto): Promise<User> {
    const createdUser = await this.usersService.create(user);
    return createdUser;
  }

  async signIn(
    lastName: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(lastName);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, username: user.lastName };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
