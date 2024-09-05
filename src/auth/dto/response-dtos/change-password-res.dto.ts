import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordResponseDto {
  @ApiProperty()
  status: number;

  @ApiProperty()
  description: string;
}
