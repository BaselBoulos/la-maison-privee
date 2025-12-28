import express from 'express'
import { getInterests, getAllInterests, createInterest, updateInterest, deleteInterest, getInterestsByClub } from '../controllers/interestController'

const router = express.Router()

// Get interests for a specific club (mobile app endpoint)
// Must come before /:id route to avoid conflicts
// Supports: /api/interests/club/:clubId or /api/interests/club?clubId=X
router.get('/club/:clubId?', getInterestsByClub)

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

