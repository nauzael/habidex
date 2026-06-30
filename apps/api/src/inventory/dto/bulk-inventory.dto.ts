import { IsString, IsNotEmpty, IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class InventoryUpdateItem {
  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  roomTypeId!: string;

  @ApiProperty({ example: '2026-07-01' })
  @IsString()
  @IsNotEmpty()
  date!: string;

  @ApiProperty({ example: 8 })
  @IsInt()
  @Min(0)
  availableRooms!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  version!: number;
}

export class BulkInventoryDto {
  @ApiProperty({ type: [InventoryUpdateItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryUpdateItem)
  updates!: InventoryUpdateItem[];
}
