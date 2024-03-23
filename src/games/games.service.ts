import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RedisService } from 'src/redis/redis.service';
import axios from 'axios';
import { getLinkDTO } from './decorators/getLink.dto';

@Injectable()
export class GamesService {

  constructor(private readonly redisService: RedisService) { }

  @Cron('0 */30 * * * *') // Запускается каждые 30 минут
  async fetchData() {
    const requestBody = {
      hall: process.env.HALL_ID,
      key: process.env.HALL_KEY,
      cmd: "gamesList"
    };
    const response = await axios.post(process.env.HALL_API, requestBody);
    console.log(response.status)
    await this.redisService.set('apiData', JSON.stringify(response.data));
  }

  async getData() {
    const cachedData = await this.redisService.get('apiData');
    console.log(cachedData)
    return cachedData ? JSON.parse(cachedData) : null;
  }

  async openGame(data: getLinkDTO) {
    const requestBody = {
      cmd: "openGame",
      hall: process.env.HALL_ID,
      language: "ru",
      key: process.env.HALL_KEY,
      demo: 1,
      login: data.userID,
      gameId: data.gameID
    }
    console.log(requestBody)
    const response = await axios.post(process.env.HALL_API + 'openGame/', requestBody);
    return response.data
  }

}
