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

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

// Safety: synchronize hanya aktif di development
// Di production, synchronize akan DISABLED untuk mencegah kehilangan data
const shouldSynchronize = isDevelopment || process.env.DB_SYNC === 'true'

// Warning jika synchronize aktif di production (kecuali explicit override)
if (isProduction && shouldSynchronize && process.env.DB_SYNC !== 'true') {
  console.warn('⚠️  WARNING: synchronize is enabled in production!')
  console.warn('⚠️  This can cause data loss. Set DB_SYNC=true explicitly if you really need it.')
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: dbPassword,
  database: process.env.DB_NAME || 'testIDP',
  synchronize: shouldSynchronize, // false di production, true di development
  logging: isDevelopment,
  entities: [User, DocumentType, Model, File, ProcessingJob],
})
