import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn
} from 'typeorm';
import { ApiProperty } from "@nestjs/swagger"

@Entity('user')
export class Freespin {

  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ example: 123 })
	@Column()
	gameId: number

  @ApiProperty({ example: 10 })
	@Column({ default: 10 })
	count: number

  @ApiProperty({ example: 10.00 })
	@Column({ default: 10.00 })
	bet: number

}
