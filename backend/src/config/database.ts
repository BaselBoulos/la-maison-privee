import mongoose from 'mongoose'

export const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI
  
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is required. Please set it in your .env file.')
  }
  
  // Replace database name with "dashboard" if not already set
  const dashboardUri = mongoUri.replace(/\/[^/?]+(\?|$)/, '/dashboard$1')
  
  try {
    await mongoose.connect(dashboardUri, {
      // Recommended connection options for MongoDB Atlas
      retryWrites: true,
      w: 'majority',
    })
    console.log('✅ Connected to MongoDB')
    console.log(`📊 Database: ${mongoose.connection.name}`)
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    throw new Error('Failed to connect to MongoDB. Please check your MONGODB_URI and network connection.')
  }
}

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected')
})

mongoose.connection.on('connected', () => {
  console.log(`✅ MongoDB connected to: ${mongoose.connection.host}`)
})

process.on('SIGINT', async () => {
  await mongoose.connection.close()
  console.log('MongoDB connection closed through app termination')
  process.exit(0)
})

