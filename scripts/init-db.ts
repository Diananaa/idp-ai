// IMPORTANT: reflect-metadata MUST be imported first before any TypeORM imports
import 'reflect-metadata'

// Now we can safely import TypeORM and entities
import { AppDataSource } from '../src/lib/data-source'

async function initDatabase() {
  try {
    // Display connection info (without password)
    const dbConfig = AppDataSource.options as any
    console.log('🔌 Database connection info:')
    console.log(`   Host: ${dbConfig.host}`)
    console.log(`   Port: ${dbConfig.port}`)
    console.log(`   Database: ${dbConfig.database}`)
    console.log(`   Username: ${dbConfig.username}`)
    console.log('')
    
    console.log('🔄 Initializing database connection...')
    console.log('💡 Make sure PostgreSQL container is running: docker-compose up -d')
    
    await AppDataSource.initialize()
    console.log('✅ Database connected successfully')

    if (AppDataSource.options.synchronize) {
      console.log('🔄 Synchronizing database schema...')
      // This will create tables if they don't exist
      await AppDataSource.synchronize(false)
      console.log('✅ Database schema synchronized')
    }

    // Verify User table exists
    const queryRunner = AppDataSource.createQueryRunner()
    const tableExists = await queryRunner.hasTable('user')
    
    if (tableExists) {
      console.log('✅ User table exists')
    } else {
      console.log('⚠️  User table does not exist')
    }

    await queryRunner.release()
    await AppDataSource.destroy()
    console.log('✅ Database connection closed')
  } catch (error: any) {
    console.error('❌ Error initializing database:', error.message)
    
    if (error.code === '28P01') {
      console.error('')
      console.error('🔐 Authentication failed! Please check:')
      console.error('   1. Database credentials in docker-compose.yml or .env file')
      console.error('   2. Make sure PostgreSQL container is running: docker-compose up -d')
      console.error('   3. Check if you have environment variables (DB_USER, DB_PASS, DB_NAME) set')
      console.error('')
      console.error('💡 For local PostgreSQL setup:')
      console.error('   1. Create a .env file with your database credentials:')
      console.error('      DB_USER=postgres')
      console.error('      DB_PASS=your_password')
      console.error('      DB_NAME=idp_db')
      console.error('   2. Or update defaults in src/lib/data-source.ts')
      console.error('')
      console.error('💡 To create database:')
      console.error('   psql -U postgres -c "CREATE DATABASE idp_db;"')
    } else if (error.code === 'ECONNREFUSED') {
      console.error('')
      console.error('🔌 Connection refused! Please check:')
      console.error('   1. PostgreSQL container is running: docker-compose up -d')
      console.error('   2. Port 5432 is not blocked by firewall')
    }
    
    process.exit(1)
  }
}

initDatabase()

