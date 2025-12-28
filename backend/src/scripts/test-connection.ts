import mongoose from 'mongoose'
import '../config/env'

const testConnection = async () => {
  try {
    const uri = process.env.MONGODB_URI
    if (!uri) {
      console.error('❌ MONGODB_URI not found in environment variables')
      process.exit(1)
    }

    console.log('🔌 Attempting to connect to MongoDB...')
    await mongoose.connect(uri, {
      retryWrites: true,
      w: 'majority',
    })
    
    console.log('✅ Successfully connected to MongoDB!')
    console.log(`📊 Database: ${mongoose.connection.name}`)
    console.log(`🌐 Host: ${mongoose.connection.host}`)
    
    // List collections
    const db = mongoose.connection.db
    if (!db) {
      console.error('❌ Database connection not established')
      process.exit(1)
    }
    const collections = await db.listCollections().toArray()
    console.log(`📦 Collections (${collections.length}):`, collections.map(c => c.name).join(', ') || 'none')
    
    await mongoose.connection.close()
    console.log('✅ Connection closed successfully')
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message)
    if (error.message.includes('authentication')) {
      console.error('💡 Tip: Check your username and password in the connection string')
    }
    if (error.message.includes('IP')) {
      console.error('💡 Tip: Add your IP address to MongoDB Atlas Network Access')
    }
    process.exit(1)
  }
}

testConnection()

