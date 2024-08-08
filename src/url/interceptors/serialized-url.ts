import { Exclude, Expose } from 'class-transformer';
import { Url, UrlType } from '../url.entity';
import { ApiProperty } from '@nestjs/swagger';
import { UUID } from '../../common/types';

@Exclude()
export class SerializedUrl extends Url {
  @ApiProperty()
  @Expose()
  id: UUID;

  @ApiProperty()
  @Expose()
  code: string;

  @ApiProperty()
  @Expose()
  originalUrl: string;

  @ApiProperty()
  @Expose()
  get shortUrl(): string {
    return `${process.env.APP_ADDRESS}/url/${this.code}`;
  }

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
