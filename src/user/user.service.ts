import { Injectable } from '@nestjs/common';
import { UserResponse } from './type/userResponse';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { SendMoneyDTO } from './decorators/sendMoney.dto';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) { }

  async saveUser(createUserDto: Partial<User>) {
    console.log('createUserDto', createUserDto)
    return await this.usersRepository.save(createUserDto)
  }

  findAll() {
    return this.usersRepository.find();
  }

  async getBalance(id: string) {
    const user = await this.findOneById(id);
    if (!user) {
      throw new Error('User not found'); // Или возвращать ошибку в зависимости от вашего подхода к обработке ошибок
    }
    return user.balance.toFixed(2);
  }

  async findOneById(id: string): Promise<UserResponse> {
    return await this.usersRepository.findOne({
      where: { id },
    });
  }

  async findOneByCredentials(email: string, phone: string): Promise<User> {
    return await this.usersRepository.findOne({
      where: [
        { email },
        { phone }
      ],
    });
  }

  async findOneByOneCredentials(credentials: string): Promise<User> {
    return await this.usersRepository.findOne({
      where: [{ email: credentials }, { phone: credentials }],
    });
  }

  async sendMoney(currentUser: User, transfer: SendMoneyDTO) {
    if (isNaN(transfer.cost) || transfer.cost < 0 || isNaN(currentUser.balance)) {
      throw new Error('Недостаточно средств');
    }
    const user = await this.findOneById(transfer.userId);
    if (!user) throw new Error('Пользователь не найден');
    if (isNaN(user.balance)) throw new Error('Invalid recipient balance');
    currentUser.balance -= transfer.cost;
    await this.saveUser(currentUser);
    user.balance += transfer.cost;
    await this.saveUser(user);
    return { success: true, message: "Операция выполнена успешно" };
  }
}
