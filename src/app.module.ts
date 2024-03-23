import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { User } from './user/entities/user.entity';
import { UsersModule } from './user/user.module';
import { AuthMiddleware } from './auth/middleware/auth.middleware';
import { GamesService } from './games/games.service';
import { GamesModule } from './games/games.module';
import { RedisService } from './redis/redis.service';

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
      ],
      database: 'casino',
      synchronize: true,
      logging: false,
    }),
    UsersModule,
    GamesModule,
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
