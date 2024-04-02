import {
  Controller,
  Post,
  Req,
  Body,
  ForbiddenException,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginResponse } from './type/loginResponse';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/user/entities/user.entity';
import { LoginUserDto } from './dto/loginUser.dto';
import { UserService } from '../user/user.service';
import { CookieInterceptor } from './interceptor/cookie.interceptor';
import { RegisterUserDto } from './dto/registerUser.dto';

@UseInterceptors(CookieInterceptor)
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) { }

  @Post('register')
  async registerUser(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<LoginResponse> {
    const { email, phone, password } = registerUserDto;
    const existingUser = await this.userService.findOneByCredentials(email, phone);
    if (existingUser) throw new BadRequestException('User already exists.')
    try {
      const saltRounds = 12;
      console.log(saltRounds)
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      console.log(hashedPassword)
      console.log('registerUserDto', registerUserDto)
      const user = await this.userService.saveUser({
        ...registerUserDto,
        password: hashedPassword,
      });
      console.log(user)
      const { id, role } = user;
      console.log(id)
      const tokens = this.authService.assignTokens(id, role);
      return tokens;
    } catch (error) {
      throw new BadRequestException('Failed to register user.');
    }
  }

  @Post('login')
  async loginUser(@Body() loginUserDto: LoginUserDto): Promise<LoginResponse> {
    const { login, password } = loginUserDto;
    let existingUser: Omit<User, 'createdAt' | 'updatedAt'>;
    let isValid: boolean;
    existingUser = await this.userService.findOneByOneCredentials(login);
    if (!existingUser) {
      throw new ForbiddenException('Username or password is invalid');
    }
    isValid = await bcrypt.compare(password, existingUser.password);
    if (!isValid) { throw new ForbiddenException('Username or password is invalid') }
    const { id, role } = existingUser;
    const tokens = this.authService.assignTokens(id, role);
    return tokens;
  }

  @Post('refresh-token')
  async getTokens(@Req() req): Promise<LoginResponse> {
    const token = req.cookies['refreshToken'];
    try {
      const {
        accessToken,
        refreshToken,
        user,
      } = await this.authService.refreshTokens(token);
      if (accessToken && user) {
        return { accessToken, refreshToken };
      }
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }
}