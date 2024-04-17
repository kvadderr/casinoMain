import {
  Controller,
  Post,
  Req,
  Body,
  ForbiddenException,
  UseInterceptors,
  BadRequestException,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginResponse } from './type/loginResponse';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/user/entities/user.entity';
import { LoginUserDto } from './dto/loginUser.dto';
import { UserService } from '../user/user.service';
import { CookieInterceptor } from './interceptor/cookie.interceptor';
import { RegisterUserDto } from './dto/registerUser.dto';
import { CodeCheckDto } from './dto/codeCheck.dto';
import { MailService } from 'src/mail/mail.service';
import { RedisService } from 'src/redis/redis.service';

@UseInterceptors(CookieInterceptor)
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly redisService: RedisService,
  ) { }

  @Post('sign')
  async registerUser(
    @Body() loginUserDto: RegisterUserDto,
    @Res() response
  ) {
    const { email, phone, password } = loginUserDto;
    let existingUser = await this.userService.findOneByCredentials(email, phone);
    const isNew = existingUser ? false : true
  
    if (email) {
      if (existingUser) {
        let isValid = await bcrypt.compare(password, existingUser.password);
        if (!isValid) throw new ForbiddenException('Login or password is invalid');
      } else {
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        existingUser = await this.userService.saveUser({
          email,
          password: hashedPassword,
        });
        this.mailService.mailConfirm(email)
      }
      const { id, role } = existingUser;
      const tokens = this.authService.assignTokens(id, role);
      console.log(tokens)
      return response.status(HttpStatus.OK).json({
        status: 'success',
        isNew: isNew,
        accessToken: tokens.accessToken, // Assuming this is the desired message for all non-email logins
      });
    }
    if (phone) {

      const code =  Math.floor(100000 + Math.random() * 900000);
      this.authService.sendCode(phone, code)
      this.redisService.setCode(phone, code)

      if (!existingUser) {
        existingUser = await this.userService.saveUser({
          phone: phone,
        });
      }

      return response.status(HttpStatus.OK).json({
        status: 'success',
        isNew: isNew,
        message: 'Код успешно отправлен',
      });

    }
  }


  private isEmail(login: string): boolean {
    return /\S+@\S+\.\S+/.test(login);
  }

  @Post('checkCode')
  async checkCode(@Body() codeCheck: CodeCheckDto, @Res() response) {
    const code = await this.redisService.get(codeCheck.phone)
    console.log('code', code)
    console.log(codeCheck.code)
    if (codeCheck.code === code) {
      let existingUser = await this.userService.findOneByCredentials(null, codeCheck.phone);
      if (!existingUser) throw new ForbiddenException('phone is invalid');
      const { id, role } = existingUser;
      const tokens = this.authService.assignTokens(id, role);
      return response.status(HttpStatus.OK).json({
        status: 'success',
        accessToken: tokens.accessToken,
        message: 'Код успешно проверен',
      });
    }
    else throw new ForbiddenException('Invalid code')
  }

  @Post('login')
  async loginUser(@Body() loginUserDto: LoginUserDto): Promise<LoginResponse> {
    const { login, password } = loginUserDto;
    let existingUser: Omit<User, 'createdAt' | 'updatedAt'>;
    let isValid: boolean;
    existingUser = await this.userService.findOneByOneCredentials(login);
    if (!existingUser) throw new ForbiddenException('Username or password is invalid');
    isValid = await bcrypt.compare(password, existingUser.password);
    if (!isValid) throw new ForbiddenException('Username or password is invalid')
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