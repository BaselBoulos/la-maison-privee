import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import Admin from '../models/Admin'

export interface AuthRequest extends Request {
  admin?: any
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    const admin = await Admin.findById(decoded.adminId || decoded._id).select('-password')
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid token' })
    }
    
    req.admin = admin
    next()
  } catch (error: any) {
    res.status(401).json({ message: 'Invalid token' })
  }
}

