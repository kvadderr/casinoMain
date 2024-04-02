import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RedisService } from 'src/redis/redis.service';
import axios from 'axios';
import { getLinkDTO } from './decorators/getLink.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FreespinService } from 'src/freespin/freespin.service';
import { OpenGameRequest } from './decorators/openGame.dto';

@Injectable()
export class GamesService {

  constructor(
    private readonly redisService: RedisService,
    private readonly freespinService: FreespinService
  ) { }

  @Cron('0 */30 * * * *') // Запускается каждые 30 минут
  async fetchData() {
    const requestBody = {
      hall: process.env.HALL_ID,
      key: process.env.HALL_KEY,
      cmd: "gamesList"
    };
    const response = await axios.post(process.env.HALL_API, requestBody);
    await this.redisService.set('apiData', JSON.stringify(response.data));
  }

  async getData() {
    const cachedData = await this.redisService.get('apiData');
    return cachedData ? JSON.parse(cachedData) : null;
  }

  async openGame(data: getLinkDTO) {

    const freespin = await this.freespinService.findOne(data.gameId);
    const requestBody: OpenGameRequest = {
      cmd: "openGame",
      hall: process.env.HALL_ID,
      language: "ru",
      key: process.env.HALL_KEY,
      demo: 0,
      login: data.userId,
      gameId: data.gameId
    }

    if (freespin) {
      let bmField = `${freespin.count}|${freespin.bet}`;
      requestBody.bm = bmField
    }

    console.log(requestBody)

    const response = await axios.post(process.env.HALL_API + 'openGame/', requestBody);
    return response.data
  }

}
