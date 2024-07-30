import { ApiProperty } from '@nestjs/swagger';
import { SerializedUser } from '../interceptors/serialized-registered-user';

export class RegisterResponseDto {
  @ApiProperty()
  status: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  user: SerializedUser;
}
