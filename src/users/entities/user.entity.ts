import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty()
  userId: number;

  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the User',
  })
  username: string;

  @ApiProperty()
  password: string;
}
