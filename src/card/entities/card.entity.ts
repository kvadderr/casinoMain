import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn
} from 'typeorm';
import { ApiProperty } from "@nestjs/swagger"

@Entity('card')
export class Card {

  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ example: 123 })
	@Column()
	cardNumber: number

  @ApiProperty({ example: 10 })
	@Column()
	name: number

}
