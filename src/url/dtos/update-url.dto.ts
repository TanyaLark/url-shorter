import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { UrlType } from '../url.entity';

export class UpdateUrlDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  originalUrl?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  alias?: string;

  @ApiProperty({ required: false })
  @IsEnum(UrlType)
  @IsOptional()
  type?: UrlType;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  expiresAt?: Date;
}
