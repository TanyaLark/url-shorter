import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsDate,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { UrlType } from '../url.entity';

export class CreateUrlDto {
  @ApiProperty()
  @IsUrl()
  @IsNotEmpty()
  originalUrl: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  alias?: string;

  @ApiProperty({
    required: false,
    enum: UrlType,
    examples: [UrlType.Permanent, UrlType.Temporary, UrlType.OneTime],
  })
  @IsOptional()
  @IsEnum(UrlType)
  type?: UrlType;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  expiresAt?: Date;
}
