import { Exclude, Expose } from 'class-transformer';
import { Url, UrlType } from '../url.entity';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class SerializedUrl extends Url {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  code: string;

  @ApiProperty()
  @Expose()
  originalUrl: string;

  @ApiProperty({
    enum: UrlType,
    examples: [UrlType.Permanent, UrlType.OneTime, UrlType.Temporary],
  })
  @Expose()
  type: UrlType;

  @ApiProperty()
  @Expose()
  isActive: boolean;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  constructor(partial: Partial<SerializedUrl>) {
    super();
    Object.assign(this, partial);
  }
}
