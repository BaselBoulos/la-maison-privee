import express from 'express'
import { getInvitationCodes, generateInvitationCodes, revokeInvitationCode, getInvitationCode, verifyInvitationCode } from '../controllers/invitationCodeController'

const router = express.Router()

// Get all invitation codes
router.get('/', getInvitationCodes)

// Verify invitation code (for user app - no auth required)
router.post('/verify', verifyInvitationCode)

// Get single invitation code
router.get('/:id', getInvitationCode)

// Generate new invitation codes
router.post('/generate', generateInvitationCodes)

// Revoke invitation code
router.delete('/:id', revokeInvitationCode)

export default router

