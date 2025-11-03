import 'reflect-metadata'
import { AppDataSource } from '../src/lib/data-source'
import { User } from '../src/lib/entities/User'

async function checkDatabase() {
  try {
    console.log('🔄 Connecting to database...')
    await AppDataSource.initialize()
    console.log('✅ Database connected\n')

    const queryRunner = AppDataSource.createQueryRunner()
    
    // Check if database exists and show tables
    console.log('📊 Database Tables:')
    console.log('─'.repeat(50))
    
    const tables = await queryRunner.getTables()
    
    if (tables.length === 0) {
      console.log('   No tables found in database')
    } else {
      tables.forEach((table, index) => {
        console.log(`\n${index + 1}. Table: ${table.name}`)
        console.log(`   Columns:`)
        table.columns.forEach(col => {
          const nullable = col.isNullable ? 'NULL' : 'NOT NULL'
          const unique = col.isUnique ? ' [UNIQUE]' : ''
          const primary = col.isPrimary ? ' [PRIMARY KEY]' : ''
          console.log(`      - ${col.name}: ${col.type} ${nullable}${unique}${primary}`)
        })
      })
    }

    // Check User table specifically and show data if exists
    const userTableExists = await queryRunner.hasTable('user')
    if (userTableExists) {
      console.log('\n📋 User Table Data:')
      console.log('─'.repeat(50))
      
      const userRepo = AppDataSource.getRepository(User)
      const users = await userRepo.find()
      
      if (users.length === 0) {
        console.log('   No users found in table')
      } else {
        console.log(`   Total users: ${users.length}\n`)
        users.forEach((user, index) => {
          console.log(`   ${index + 1}. ID: ${user.id}`)
          console.log(`      Name: ${user.name}`)
          console.log(`      Email: ${user.email}`)
          console.log('')
        })
      }
    }

    await queryRunner.release()
    await AppDataSource.destroy()
    console.log('✅ Database connection closed')
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkDatabase()

