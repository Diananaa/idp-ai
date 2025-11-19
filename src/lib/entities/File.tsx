import 'reflect-metadata'
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import { ProcessingJob } from './ProcessingJob'

@Entity()
export class File {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: 'varchar', length: 255 })
    fileName!: string

    @Column({ type: 'varchar', length: 255, nullable: true })
    filePath?: string | null

    @Column({ type: 'boolean' })
    status!: boolean

    @Column({ type: 'integer' })
    processTime!: number

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date

    @Column({ type: 'text', nullable: true })
    OCRResult?: string | null

    @Column({ type: 'integer', nullable: true })
    processingJobId?: number

    @ManyToOne(() => ProcessingJob, (processingJob) => processingJob.files, {
        nullable: true,
    })
    @JoinColumn({ name: 'processingJobId' })
    processingJob?: ProcessingJob

    @Column({ type: 'integer', nullable: true })
    fileSize?: number

    @Column({ type: 'varchar', length: 255, nullable: true })
    fileType?: string | null
}
