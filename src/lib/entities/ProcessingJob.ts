import 'reflect-metadata'
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { DocumentType } from './DocumentType'
import { Model } from './Model'
import { File } from './File'

@Entity()
export class ProcessingJob {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar', length: 50, default: 'UPLOADED' })
  status!: string

  @Column({ type: 'text', nullable: true })
  resultJson?: string | null

  @Column({ type: 'integer' })
  documentTypeId!: number

  @ManyToOne(() => DocumentType, (documentType) => documentType.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'documentTypeId' })
  documentType!: DocumentType

  @Column({ type: 'integer' })
  modelId!: number

  @ManyToOne(() => Model, (model) => model.id, {
    nullable: false,
  })
  @JoinColumn({ name: 'modelId' })
  model!: Model

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date

  @OneToMany(() => File, (file) => file.processingJob, {
    cascade: true,
  })
  files!: File[]
}

