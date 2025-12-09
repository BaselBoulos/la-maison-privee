import express from 'express'
import { getMembers, getMember, updateMember, deleteMember, getFilteredMembers } from '../controllers/memberController'

const router = express.Router()

// Get all members with optional filters
router.get('/', getMembers)

// Get filtered members for event targeting
router.get('/filtered', getFilteredMembers)

// Get single member
router.get('/:id', getMember)

// Update member
router.put('/:id', updateMember)

// Delete member
router.delete('/:id', deleteMember)

export default router

