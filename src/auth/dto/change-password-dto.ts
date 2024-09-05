import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Old password' })
  @IsNotEmpty()
  @IsStrongPassword()
  oldPassword: string;

  @ApiProperty({ description: 'New password, should be strong' })
  @IsNotEmpty()
  @IsStrongPassword()
  newPassword: string;
}
