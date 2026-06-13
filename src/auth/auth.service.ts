import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(createAuthDto: CreateAuthDto) {
    const user = await this.usersService.findByEmailOrPhone(
      createAuthDto.emailOrPhone,
    );
    if (!user || user.password !== createAuthDto.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildLoginResponse(user);
  }

  async assignToken(user: User) {
    const payload = {
      username: user.email,
      sub: user.id,
      role: user.role,
      store: (user as User & { store?: string }).store,
    };

    return {
      access_token: this.jwtService.sign(payload),
      role: user.role,
      userId: user.id,
      id: user.id,
    };
  }

  private async buildLoginResponse(user: User) {
    const labourProfile = await this.usersService.findLabourProfileByUserId(
      user.id,
    );
    const tokenData = await this.assignToken(user);

    return {
      ...tokenData,
      id: labourProfile?.id ?? user.id,
      userId: user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isPhoneVerified: user.isPhoneVerified,
      },
    };
  }
}
