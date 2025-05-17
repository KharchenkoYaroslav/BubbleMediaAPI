import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';

interface AuthServiceGrpc {
  verifyToken(data: { token: string }): Observable<{ valid: boolean; sub: string; login: string }>;
}

@Injectable()
export class GqlAuthGuard implements CanActivate {
  private authService: AuthServiceGrpc;

  constructor(@Inject('AUTH_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceGrpc>('AuthService');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer') {
      throw new UnauthorizedException('Invalid authorization type');
    }

    try {
      const response = await firstValueFrom(this.authService.verifyToken({ token }));
      if (!response.valid) {
        throw new UnauthorizedException('Invalid token');
      }
      req.user = { sub: response.sub, login: response.login };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token' + error);
    }
  }
}
