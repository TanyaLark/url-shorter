import { Exclude, Expose, Type } from 'class-transformer';
import { SerializedUrl } from './serialized-url';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class PaginatedUrls {
  @ApiProperty({ type: [SerializedUrl] })
  @Expose()
  @Type(() => SerializedUrl)
  urls: SerializedUrl[];

  @ApiProperty()
  @Expose()
  totalURLs: number;

  @ApiProperty()
  @Expose()
  page: number;

  @ApiProperty()
  @Expose()
  limit: number;

  @ApiProperty()
  @Expose()
  get totalPages(): number {
    return Math.ceil(this.totalURLs / this.limit);
  }

  constructor(partial: Partial<PaginatedUrls>) {
    Object.assign(this, partial);
  }
}
