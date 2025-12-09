import express from 'express'
import { getInvitationCodes, generateInvitationCodes, revokeInvitationCode, getInvitationCode } from '../controllers/invitationCodeController'

const router = express.Router()

// Get all invitation codes
router.get('/', getInvitationCodes)

// Get single invitation code
router.get('/:id', getInvitationCode)

// Generate new invitation codes
router.post('/generate', generateInvitationCodes)

// Revoke invitation code
router.delete('/:id', revokeInvitationCode)

export default router

