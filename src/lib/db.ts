import { AppDataSource } from './data-source'

let isInitializing = false
let syncCompleted = false

export const initDB = async () => {
  // Fast path: jika sudah initialized, langsung return (hanya check boolean, sangat ringan)
  if (AppDataSource.isInitialized) {
    return
  }

  // Jika sedang initializing, tunggu sampai selesai
  if (isInitializing) {
    while (isInitializing && !AppDataSource.isInitialized) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    return
  }

  // Initialize database connection (hanya sekali)
  isInitializing = true
  try {
    await AppDataSource.initialize()
    console.log('✅ Database connected')

    // Log synchronize status untuk awareness
    if (AppDataSource.options.synchronize) {
      console.log('🔄 Schema synchronization: ENABLED (development mode)')
    } else {
      console.log('🔒 Schema synchronization: DISABLED (production mode - data safe)')
    }

    // Explicitly synchronize schema if not already done (hanya jika synchronize enabled)
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

/**
 * Helper function untuk API routes yang memastikan DB terhubung
 * Overhead minimal karena initDB() sudah optimized dengan check isInitialized
 */
export const ensureDBConnection = async (): Promise<void> => {
  await initDB()
}
