import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RemoveMemberResDto {
  @ApiProperty()
  @IsString()
  message: string;
}
