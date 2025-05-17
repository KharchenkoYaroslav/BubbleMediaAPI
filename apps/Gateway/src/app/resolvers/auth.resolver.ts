import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { LoginInput } from '../dto/auth/login.input';
import { RegisterInput } from '../dto/auth/register.input';
import { LoginResponse } from '../dto/auth/login.response';
import { RegisterResponse } from '../dto/auth/register.response';
import { ChangeLoginInput } from '../dto/auth/change-login.input';
import { ChangePasswordInput } from '../dto/auth/change-password.input';
import { GetLoginResponse } from '../dto/auth/get-login.response';
import { GetLoginInput } from '../dto/auth/get-login.input';
import { GqlAuthGuard } from '../guards/gql-auth.guard';

interface AuthServiceGrpc {
  getLogin(data: {userId: string}): Observable<GetLoginResponse>;
  login(data: LoginInput): Observable<LoginResponse>;
  register(data: RegisterInput): Observable<RegisterResponse>;
  changeLogin(data: ChangeLoginInput): Observable<{ success: boolean }>;
  changePassword(data: ChangePasswordInput): Observable<{ success: boolean }>;
  deleteAccount(data: {userId: string}): Observable<{ success: boolean }>;
}

@Resolver()
export class AuthResolver {
  private authService: AuthServiceGrpc;

  constructor(@Inject('AUTH_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceGrpc>('AuthService');
  }

  @Query(() => GetLoginResponse)
  async getLogin(@Args('data') data: GetLoginInput) {
    if (!data.userId) throw new Error('User ID is required');
    const response = await firstValueFrom(this.authService.getLogin({ userId: data.userId }));
    return response;
  }

  @Mutation(() => LoginResponse)
  async login(@Args('data') data: LoginInput) {
    return firstValueFrom(this.authService.login(data));
  }

  @Mutation(() => RegisterResponse)
  async register(@Args('data') data: RegisterInput) {
    return firstValueFrom(this.authService.register(data));
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async changeLogin(@Args('data') data: ChangeLoginInput, @Context() context) {
    const userId = context.req.user.sub;
    const grpcData = { ...data, userId };
    const response = await firstValueFrom(
      this.authService.changeLogin(grpcData)
    );
    return response.success;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async changePassword(
    @Args('data') data: ChangePasswordInput,
    @Context() context
  ) {
    const userId = context.req.user.sub;
    const grpcData = { ...data, userId };
    const response = await firstValueFrom(
      this.authService.changePassword(grpcData)
    );
    return response.success;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteAccount(@Context() context) {
    try {
      const userId = context.req.user.sub;

      if (!userId) {
        throw new Error('User ID is required');
      }

      const response = await firstValueFrom(
        this.authService.deleteAccount({userId})
      );

      return response.success;
    } catch (error) {
      throw new Error('Error deleting account: ' + error);
    }
  }
}
