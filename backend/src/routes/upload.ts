import express from 'express'
import { uploadImage, uploadImages, upload } from '../controllers/uploadController'

const router = express.Router()

// Upload single image
router.post('/image', upload.single('image'), uploadImage)

// Upload multiple images
router.post('/images', upload.array('images', 10), uploadImages)

export default router

