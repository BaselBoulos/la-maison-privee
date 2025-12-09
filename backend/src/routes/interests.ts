import express from 'express'
import { getInterests, getAllInterests, createInterest, updateInterest, deleteInterest } from '../controllers/interestController'

const router = express.Router()

// Get enabled interests only
router.get('/', getInterests)

// Get all interests (including disabled)
router.get('/all', getAllInterests)

// Create interest
router.post('/', createInterest)

// Update interest
router.put('/:id', updateInterest)

// Delete interest (soft delete by disabling)
router.delete('/:id', deleteInterest)

export default router

