import express from 'express'
import { bulkUpdateStatus, bulkAssignInterests, bulkRemoveInterests, bulkDeleteMembers } from '../controllers/bulkOperationsController'

const router = express.Router()

// Bulk update member status
router.post('/members/status', bulkUpdateStatus)

// Bulk assign interests
router.post('/members/interests/assign', bulkAssignInterests)

// Bulk remove interests
router.post('/members/interests/remove', bulkRemoveInterests)

// Bulk delete members
router.post('/members/delete', bulkDeleteMembers)

export default router

