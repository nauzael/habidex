import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateInventoryDto {
  @ApiProperty({ example: 8 })
  @IsInt()
  @Min(0)
  availableRooms!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  version!: number;
}
