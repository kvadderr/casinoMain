import { Controller, Get, Post, Body, Param, Req, NotFoundException, UnauthorizedException, BadRequestException, BadGatewayException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { SendMoneyDTO } from './decorators/sendMoney.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  findAll() {
    return this.userService.findAll();
  }


  @Post()
  async userDataControl(@Body() data: any) {
    const cmd = data.cmd;
    if (data.key !== process.env.HALL_KEY) return (
      {
        "status": "fail",
        "error": "ERROR CODE"
      }
    )
    if (cmd === 'getBalance') {
      const balance = await this.userService.getBalance(cmd.login);
      return ({
        "status": "success",
        "error": "",
        "login": cmd.login,
        "balance": balance,
        "currency": "RUB"
      })
    }

    if (cmd === 'writeBet') {
      const balance = await this.userService.getBalance(cmd.login);
      return ({
        "status": "success",
        "error": "",
        "login": cmd.login,
        "balance": balance,
        "currency": "RUB"
      })
    }

  }

  @Get('/me')
  async getMe(@Req() req): Promise<User> {
    try {
      return req.user;
    } catch (error) {
      throw new UnauthorizedException(`Error`);
    }
  }

  @Post('/sendMoney')
  async setMoney(@Req() req, @Body() sendMoneyDTO: SendMoneyDTO) {
    if (req.user?.balance === 0 || req.user?.balance < sendMoneyDTO.cost) return new BadGatewayException(`Недостаточно средств`);
    return await this.userService.sendMoney(req.user, sendMoneyDTO);
  }

}
