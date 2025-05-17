import { Controller} from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthService } from './app.service';
import { Observable, of } from 'rxjs';

@Controller()
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'GetLogin')
  async getLoginById(data: { userId: string }) {
    const user = await this.authService.getLoginbyId(data.userId);
    if (!user) {
      throw new Error('User not found');
    }
    return { login: user };
  }

  @GrpcMethod('AuthService', 'GetId')
  async getIdbyLogin(data: { login: string }) {

    const user = await this.authService.getIdbyLogin(data.login);
    if (!user) {
      throw new Error('User not found');
    }

    return { userId: user };
  }

  @GrpcMethod('AuthService', 'Login')
  async login(data: { login: string; password: string }) {
    const user = await this.authService.validateUser(data.login, data.password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const response = await this.authService.login(user);
    return { token: response.token, userId: response.userId };
  }

  @GrpcMethod('AuthService', 'Register')
  async register(data: { login: string; password: string }) {
    const user = await this.authService.register(data.login, data.password);
    return {
      login: user.login,
      createdAt: user.createdAt,
    };
  }

  @GrpcMethod('AuthService', 'ChangeLogin')
  async changeLogin(data: { userId: string; newLogin: string }) {
    await this.authService.changeLogin(data.userId, data.newLogin);
    return {
      success: true,
    };
  }

  @GrpcMethod('AuthService', 'ChangePassword')
  async changePassword(data: {
    userId: string;
    currentPassword: string;
    newPassword: string
  }) {
    await this.authService.changePassword(
      data.userId,
      data.currentPassword,
      data.newPassword
    );
    return {
      success: true,
    };
  }

  @GrpcMethod('AuthService', 'DeleteAccount')
  async deleteAccount(data: { userId: string }) {
    await this.authService.deleteAccount(data.userId);
    return {
      success: true,
    };
  }

  @GrpcMethod('AuthService', 'VerifyToken')
  verifyToken(data: { token: string }): Observable<{ valid: boolean; sub?: string; login?: string }> {
    try {
      const payload = this.authService['jwtService'].verify(data.token);
      return of({ valid: true, sub: payload.sub, login: payload.login });
    } catch (e) {
      console.error(e);
      return of({ valid: false });
    }
  }
}
