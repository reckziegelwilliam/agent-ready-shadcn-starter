import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';

interface LoginDto {
  email: string;
  password: string;
}

interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

interface ForgotPasswordDto {
  email: string;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class AuthService {
  private readonly mockUsers = [
    {
      id: '1',
      email: 'demo@example.com',
      password: 'password123',
      name: 'Demo User',
    },
  ];

  async login(dto: LoginDto) {
    await delay(800);
    const user = this.mockUsers.find(
      (u) => u.email === dto.email && u.password === dto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return {
      user: { id: user.id, email: user.email, name: user.name },
      token: 'mock-jwt-token-' + user.id,
    };
  }

  async register(dto: RegisterDto) {
    await delay(1000);
    const exists = this.mockUsers.find((u) => u.email === dto.email);
    if (exists) {
      throw new ConflictException('Email already registered');
    }
    const newUser = {
      id: String(this.mockUsers.length + 1),
      email: dto.email,
      password: dto.password,
      name: dto.name,
    };
    this.mockUsers.push(newUser);
    return {
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
      token: 'mock-jwt-token-' + newUser.id,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    await delay(600);
    return {
      message: `If an account exists for ${dto.email}, a reset link has been sent.`,
    };
  }
}
