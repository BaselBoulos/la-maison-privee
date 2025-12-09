import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const generateToken = (adminId: string): string => {
  return jwt.sign({ adminId }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '7d'
  })
}

// Mock admin for demo purposes
const MOCK_ADMIN = {
  id: 'admin-1',
  email: 'admin@innercircle.com',
  password: 'admin123',
  name: 'Admin User'
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }
    
    // Check against mock admin
    if (email !== MOCK_ADMIN.email || password !== MOCK_ADMIN.password) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    
    const token = generateToken(MOCK_ADMIN.id)
    
    res.json({
      token,
      admin: {
        id: MOCK_ADMIN.id,
        email: MOCK_ADMIN.email,
        name: MOCK_ADMIN.name
      }
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' })
    }
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email })
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' })
    }
    
    const admin = new Admin({ email, password, name })
    await admin.save()
    
    const token = generateToken(admin._id.toString())
    
    res.status(201).json({
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name
      }
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    
    // For demo, just verify token is valid
    if (decoded.adminId === MOCK_ADMIN.id) {
      res.json({ 
        admin: {
          id: MOCK_ADMIN.id,
          email: MOCK_ADMIN.email,
          name: MOCK_ADMIN.name
        }
      })
    } else {
      return res.status(401).json({ message: 'Invalid token' })
    }
  } catch (error: any) {
    res.status(401).json({ message: 'Invalid token' })
  }
}

