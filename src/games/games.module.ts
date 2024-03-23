import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { RedisService } from 'src/redis/redis.service';

@Module({
  controllers: [GamesController],
  providers: [GamesService, RedisService],
  exports: [GamesService]
})
export class GamesModule {}
