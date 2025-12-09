import express from 'express'
import { login, register, verifyToken } from '../controllers/authController'

const router = express.Router()

// Admin login
router.post('/login', login)

// Admin register (for initial setup)
router.post('/register', register)

// Verify token
router.get('/verify', verifyToken)

export default router

