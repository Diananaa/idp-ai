import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User } from './entities/User'
import { DocumentType } from './entities/DocumentType'
import { Model } from './entities/Model'
import { File } from './entities/File'
import { ProcessingJob } from './entities/ProcessingJob'

// Handle password - always use string (empty string if not set, for PostgreSQL without password)
// PostgreSQL driver requires password to be a string, not undefined
const dbPassword = process.env.DB_PASS || 'postgres'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: dbPassword,
  database: process.env.DB_NAME || 'testIDP',
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  entities: [User, DocumentType, Model, File, ProcessingJob],
})
