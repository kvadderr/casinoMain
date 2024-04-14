import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { UsersModule } from './user/user.module';
import { AuthMiddleware } from './auth/middleware/auth.middleware';
import { GamesService } from './games/games.service';
import { GamesModule } from './games/games.module';
import { RedisService } from './redis/redis.service';
import { FreespinModule } from './freespin/freespin.module';

import { User } from './user/entities/user.entity';
import { Freespin } from './freespin/entities/freespin.entity';
import { CardModule } from './card/card.module';
import { Card } from './card/entities/card.entity';
import { GameHistoryModule } from './game-history/game-history.module';
import { GameHistory } from './game-history/entities/game-history.entity';
import { DocumentsModule } from './documents/documents.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      password: 'Zsxdcf123',
      username: 'postgres',
      entities: [
        User,
        Freespin,
        Card,
        GameHistory
      ],
      database: 'casino',
      synchronize: true,
      logging: false,
    }),
    UsersModule,
    GamesModule,
    FreespinModule,
    CardModule,
    GameHistoryModule,
    DocumentsModule,
    MailModule
  ],
  controllers: [],
  providers: [GamesService, RedisService],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
