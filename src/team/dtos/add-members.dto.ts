import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail } from 'class-validator';

export class AddMembersDto {
  @ApiProperty()
  @IsArray()
  @IsEmail({}, { each: true })
  membersEmails: string[];
}
