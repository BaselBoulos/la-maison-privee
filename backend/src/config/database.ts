import mongoose from 'mongoose'

export const connectDatabase = async (): Promise<void> => {
  // Skip database connection if MONGODB_URI is not set or if SKIP_DB is true
  if (process.env.SKIP_DB === 'true' || !process.env.MONGODB_URI) {
    console.log('⚠️  Database connection skipped (using mock data)')
    return
  }

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/inner-circle'
    
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    console.log('⚠️  Continuing without database (using mock data)')
    // Don't throw - allow app to continue with mock data
  }
}

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected')
})

process.on('SIGINT', async () => {
  await mongoose.connection.close()
  console.log('MongoDB connection closed through app termination')
  process.exit(0)
})

