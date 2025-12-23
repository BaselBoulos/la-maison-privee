import './config/env'
import express from 'express'
import cors from 'cors'
import { connectDatabase } from './config/database'
import memberRoutes from './routes/members'
import eventRoutes from './routes/events'
import invitationCodeRoutes from './routes/invitationCodes'
import interestRoutes from './routes/interests'
import authRoutes from './routes/auth'
import bulkOperationsRoutes from './routes/bulkOperations'
import clubRoutes from './routes/clubs'
import communicationRoutes from './routes/communication'
import uploadRoutes from './routes/upload'
import path from 'path'

const app = express()
const PORT = Number(process.env.PORT) || 3000

// Middleware - CORS Configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or curl requests)
    if (!origin) {
      return callback(null, true)
    }
    
    const isDevelopment = process.env.NODE_ENV !== 'production'
    
    // In development, allow all localhost origins and be permissive
    if (isDevelopment) {
      if (origin?.startsWith('http://localhost:') || origin?.startsWith('http://127.0.0.1:')) {
        return callback(null, true)
      }
      // In development, allow all origins for easier testing
      return callback(null, true)
    }
    
    // Production: Allow specific frontend URL and mobile apps
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      // Add additional allowed origins from environment variable (comma-separated)
      ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : [])
    ].filter(Boolean)
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      // In production, reject unknown origins
      callback(new Error(`Not allowed by CORS. Origin: ${origin}`))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Club-Id'],
  exposedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'La Maison Privée API is running' })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/members', memberRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/invitation-codes', invitationCodeRoutes)
app.use('/api/interests', interestRoutes)
app.use('/api/bulk', bulkOperationsRoutes)
app.use('/api/communication', communicationRoutes)
app.use('/api/clubs', clubRoutes)
app.use('/api/upload', uploadRoutes)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Start server
const startServer = async () => {
  try {
    // Try to connect to database, but don't fail if it doesn't work (using mock data)
    await connectDatabase()
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
      if (process.env.SKIP_DB === 'true' || !process.env.MONGODB_URI) {
        console.log(`📦 Using mock data (database connection skipped)`)
      } else {
        console.log(`📦 Connected to database`)
      }
    })
  } catch (error) {
    // Even if database connection fails, start server with mock data
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`📦 Using mock data (database connection failed)`)
    })
  }
}

startServer()

