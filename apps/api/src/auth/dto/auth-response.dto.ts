import { ApiProperty } from '@nestjs/swagger';

class UserResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: ['OWNER', 'ADMIN', 'MANAGER', 'RECEPTIONIST'] })
  role!: string;
}

class HotelResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

export class AuthResponseDto {
  @ApiProperty()
  token!: string;

  @ApiProperty()
  user!: UserResponse;

  @ApiProperty()
  hotel!: HotelResponse;
}

export class TokenResponseDto {
  @ApiProperty()
  token!: string;
}

export class ErrorResponseDto {
  @ApiProperty()
  code!: string;

  @ApiProperty()
  message!: string;
}
