import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn
} from 'typeorm';
import { ApiProperty } from "@nestjs/swagger"

@Entity('gameHistory')
export class GameHistory {

  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ example: 123 })
	@Column()
	userId: string

  @ApiProperty({ example: 10 })
	@Column()
	sessionId: number

}
