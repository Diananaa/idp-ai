import 'reflect-metadata'
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class DocumentType {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: 'varchar', length: 255 })
    name!: string

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date
}