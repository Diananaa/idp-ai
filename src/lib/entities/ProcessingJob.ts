import 'reflect-metadata'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm'
import { DocumentType } from './DocumentType'
import { Model } from './Model'

@Entity()
export class ProcessingJob {
  @PrimaryGeneratedColumn()
  id!: number

  @OneToOne(() => Model)
  @JoinColumn()
  modelOneToOne!: Model

  @OneToOne(() => DocumentType)
  @JoinColumn()
  documentTypeOneToOne!: DocumentType
  
  @Column({ type: 'varchar', length: 255 })
  fileName!: string

  @Column({ type: 'integer' })
  fileSize!: number

  @Column({ type: 'varchar', length: 255, nullable: true })
  fileType?: string | null

  @Column({ type: 'varchar', length: 50, default: 'UPLOADED' })
  status!: string

  @Column({ type: 'text', nullable: true })
  resultJson?: string | null

  @Column({ type: 'integer' })
  documentTypeId!: number

  @ManyToOne(() => DocumentType, (documentType) => documentType.processingJobs, {
    nullable: false,
  })
  @JoinColumn({ name: 'documentTypeId' })
  documentType!: DocumentType

  @Column({ type: 'integer' })
  modelId!: number

  @ManyToOne(() => Model, (model) => model.processingJobs, {
    nullable: false,
  })
  @JoinColumn({ name: 'modelId' })
  model!: Model

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date
}

