import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail } from 'class-validator';

export class RemoveMembersDto {
  @ApiProperty()
  @IsArray()
  @IsEmail({}, { each: true })
  membersEmails: string[];
}
