import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { DocumentType } from './DocumentType';
import { Model } from './Model';
import { User } from './User';

@Entity()
export class File {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: 'varchar', length: 255 })
    fileName!: string

    @Column({ type: 'varchar', length: 255 })
    filePath!: string

    @ManyToOne(() => DocumentType, (documentType) => documentType.id)
    documentTypeID!: number

    @ManyToOne(() => Model, (model) => model.id)
    modelID!: number 

    @Column({ type: 'boolean' })
    isSuccess!: boolean

    @Column({ type: 'integer' })
    processTime!: number

    @CreateDateColumn({ type: 'timestamp' })
    createAt!: Date

    @ManyToOne(() => User, (user) => user.id)
    userID!: number

    @Column({ type: 'text' })
    OCRResult!: string
}
