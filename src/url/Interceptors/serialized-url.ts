import { Exclude, Expose } from 'class-transformer';
import { Url, UrlType } from '../url.entity';

@Exclude()
export class SerializedUrl extends Url {
  @Expose()
  id: string;

  @Expose()
  code: string;

  @Expose()
  originalUrl: string;

  @Expose()
  type: UrlType;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  constructor(partial: Partial<SerializedUrl>) {
    super();
    Object.assign(this, partial);
  }
}
