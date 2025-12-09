import { Router } from 'express'
import { getCurrentClub, listClubs, updateCurrentClub, deleteClub } from '../controllers/clubController'

const router = Router()

router.get('/', listClubs)
router.get('/current', getCurrentClub)
router.put('/current', updateCurrentClub)
router.delete('/:id', deleteClub)

export default router


