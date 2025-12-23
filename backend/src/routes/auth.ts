import express from 'express'
import { login, register } from '../controllers/authController'

const router = express.Router()

// Admin login
router.post('/login', login)

// Admin register (for initial setup)
router.post('/register', register)

export default router

