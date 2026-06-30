import { ApiProperty } from '@nestjs/swagger';

class WeeklyOccupancyItem {
  @ApiProperty({ example: '2026-06-30' })
  date!: string;

  @ApiProperty({ example: 86 })
  percent!: number;
}

export class DashboardSummaryDto {
  @ApiProperty({ example: '12/14' })
  occupancyToday!: string;

  @ApiProperty({ example: 86 })
  occupancyPercent!: number;

  @ApiProperty({ example: 120000 })
  adr!: number;

  @ApiProperty({ example: 103200 })
  revpar!: number;

  @ApiProperty({ example: 14 })
  totalRooms!: number;

  @ApiProperty({ example: 12 })
  occupiedRooms!: number;

  @ApiProperty({ example: 3 })
  checkinsToday!: number;

  @ApiProperty({ example: 5 })
  bookingsToday!: number;

  @ApiProperty({ type: [WeeklyOccupancyItem] })
  weeklyOccupancy!: WeeklyOccupancyItem[];
}
