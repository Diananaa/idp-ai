import { AppDataSource } from './data-source'

let isInitializing = false
let syncCompleted = false

export const initDB = async () => {
  if (AppDataSource.isInitialized) {
    return
  }

  if (isInitializing) {
    // Wait for ongoing initialization
    while (isInitializing && !AppDataSource.isInitialized) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    return
  }

  isInitializing = true
  try {
    await AppDataSource.initialize()
    console.log('✅ Database connected')

    // Explicitly synchronize schema if not already done
    if (!syncCompleted && AppDataSource.options.synchronize) {
      try {
        await AppDataSource.synchronize(false)
        syncCompleted = true
        console.log('✅ Database schema synchronized - tables created/updated')
      } catch (syncError) {
        console.error('⚠️  Schema synchronization error:', syncError)
        // Don't throw - connection is still valid
      }
    }
  } catch (error) {
    console.error('❌ Error connecting to database:', error)
    isInitializing = false
    throw error
  }
  isInitializing = false
}
