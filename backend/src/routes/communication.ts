import express from 'express'
import { sendEmailToMember, sendBulkEmails, sendFilteredEmails, getMemberEmailHistory, getAllEmailHistory } from '../controllers/communicationController'

const router = express.Router()

// Send email to single member
router.post('/email/member', sendEmailToMember)

// Send bulk emails
router.post('/email/bulk', sendBulkEmails)

// Send filtered emails
router.post('/email/filtered', sendFilteredEmails)

// Get email history for a member
router.get('/email/history/member/:memberId', getMemberEmailHistory)

// Get all email history
router.get('/email/history', getAllEmailHistory)

export default router

