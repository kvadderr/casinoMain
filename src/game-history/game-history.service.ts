import { Injectable } from '@nestjs/common';
import { CreateGameHistoryDto } from './dto/create-game-history.dto';
import { UpdateGameHistoryDto } from './dto/update-game-history.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GameHistory } from './entities/game-history.entity';
import { Repository } from 'typeorm';
import axios from 'axios';

@Injectable()
export class GameHistoryService {

  constructor(
    @InjectRepository(GameHistory)
    private readonly freespinRepository: Repository<GameHistory>
  ) { }

  create(createGameHistoryDto: CreateGameHistoryDto) {
    return this.freespinRepository.save(createGameHistoryDto)
  }

  findAll() {
    return this.freespinRepository.find();
  }

  findOne(userId: string) {
    return this.freespinRepository.findOne({
      where: {userId}
    });
  }


  async getLogsBySession(sessionId: string){
    try {
      const requestBody = {
        cmd: "gameSessionsLog",
        hall: process.env.HALL_ID,
        key: process.env.HALL_KEY,
        sessionsId: sessionId,
      }

      const response = await axios.post(process.env.HALL_API + 'openGame/', requestBody);
      return response.data
    } catch { return }
  }

}
