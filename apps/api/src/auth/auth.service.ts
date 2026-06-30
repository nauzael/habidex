import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const hotel = await tx.hotel.create({
        data: {
          name: dto.hotelName,
          email: dto.email,
          phone: dto.phone || null,
        },
      });

      const user = await tx.user.create({
        data: {
          hotelId: hotel.id,
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          role: 'OWNER',
        },
      });

      return { hotel, user };
    });

    const token = this.generateToken(result.user);

    return {
      token,
      user: this.sanitizeUser(result.user),
      hotel: {
        id: result.hotel.id,
        name: result.hotel.name,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
      include: { hotel: true },
    });

    if (!user) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    const token = this.generateToken(user);

    return {
      token,
      user: this.sanitizeUser(user),
      hotel: {
        id: user.hotel.id,
        name: user.hotel.name,
      },
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return this.sanitizeUser(user);
  }

  async getProfile(hotelId: string) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
      include: { users: true },
    });

    if (!hotel) {
      throw new UnauthorizedException('Hotel no encontrado');
    }

    return {
      hotel: {
        id: hotel.id,
        name: hotel.name,
      },
      users: hotel.users.map((u) => this.sanitizeUser(u)),
    };
  }

  async refreshToken(userId: string, email: string, hotelId: string) {
    const token = this.generateToken({ id: userId, email, hotelId });
    return { token };
  }

  private generateToken(user: { id: string; email: string; hotelId?: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
      hotelId: user.hotelId,
    };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: any) {
    const { password, ...rest } = user;
    return rest;
  }
}
