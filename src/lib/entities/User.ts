import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string

  @Column({ type: 'varchar', length: 255 })
  name!: string

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  createdAt!: Date
}
