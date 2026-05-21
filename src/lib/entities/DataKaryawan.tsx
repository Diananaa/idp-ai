import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import 'reflect-metadata';

@Entity()
export class DataKaryawan {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: 'varchar', length: 255 })
    nama!: string

    @Column({ type: 'varchar', length: 255 })
    alamat!: string

    @Column({ type: 'varchar', length: 255 })
    nip!: string

    @Column({ type: 'varchar', length: 255 })
    jabatan!: string

    @CreateDateColumn({ type: 'timestamp' })
    createdAt!: Date
}