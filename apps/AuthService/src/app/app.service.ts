import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dto/user.dto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    @Inject('PROFILE_PACKAGE')
    private profileClient: ClientProxy,
    @Inject('GOOGLE_DRIVE_PACKAGE')
    private googleDriveClient: ClientProxy,
    @Inject('CONTENT_PACKAGE')
    private contentClient: ClientProxy,
    @Inject('METRICS_PACKAGE')
    private metricsClient: ClientProxy,
    @Inject('COMMENT_PACKAGE')
    private commentClient: ClientProxy
  ) {}

  async getLoginbyId(userId: string): Promise<string | null> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (user) {
      return user.login;
    }
    return null;
  }

  async getIdbyLogin (login: string): Promise<string | null> {
    const user = await this.usersRepository.findOne({ where: { login: login } });
    if (user) {
      return user.id;
    }
    return null;
  }

  async validateUser(login: string, password: string): Promise<UserDto | null> {
    const user = await this.usersRepository.findOne({ where: { login } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { id, login, createdAt } = user;
      return { id, login, createdAt };
    }
    return null;
  }

  async login(user: UserDto): Promise<{ token: string; userId: string }> {
    const payload = { login: user.login, sub: user.id };
    const token = this.jwtService.sign(payload);
    return { token: token, userId: user.id };
  }

  private async isLoginTaken(login: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { login } });
    return !!user;
  }

  async register(login: string, password: string): Promise<User> {
    if (await this.isLoginTaken(login)) {
      throw new Error('User with this login already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      login,
      password: hashedPassword,
      createdAt: new Date(),
    });

    const savedUser = await this.usersRepository.save(user);

    try {
      console.log(
        'Initializing profile and Google Drive for user:',
        savedUser.id
      );
      this.profileClient.emit('init_profile', { userId: savedUser.id });
      console.log('Initializing Google Drive for user:', savedUser.id);
      this.googleDriveClient.emit('init_google_drive', {
        userId: savedUser.id,
      });
    } catch (error) {
      console.error('Failed to initialize profile:', error);
      throw new Error('Failed to initialize profile');
    }

    return savedUser;
  }

  async changeLogin(userId: string, newLogin: string): Promise<void> {
    if (await this.isLoginTaken(newLogin)) {
      throw new Error('User with this login already exists');
    }
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    user.login = newLogin;
    this.usersRepository.save(user);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    this.usersRepository.save(user);
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    try {
      console.log('Deleting Google Drive for user:', userId);
      this.googleDriveClient.emit('delete_user_folder', { userId });
      console.log('Deleting profile for user:', userId);
      this.profileClient.emit('delete_profile', { userId });
      console.log('Deleting content for user:', userId);
      this.contentClient.emit('delete_user_content', userId);
      console.log('Deleting metrics for user:', userId);
      this.metricsClient.emit('delete_users_likes', { userId });
      console.log('Deleting comments for user:', userId);
      this.commentClient.emit('delete_user_comments', { userId });
    } catch (error) {
      console.error('Failed to delete profile:', error);
      throw new Error('Failed to delete profile');
    }
    await this.usersRepository.remove(user);
  }

  async verifyToken(
    token: string
  ): Promise<{ valid: boolean; payload?: unknown }> {
    try {
      const payload = this.jwtService.verify(token);
      return { valid: true, payload };
    } catch (error) {
      console.error(error);
      return { valid: false };
    }
  }
}
