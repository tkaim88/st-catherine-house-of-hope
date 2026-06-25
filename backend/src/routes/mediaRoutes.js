import express from 'express'
import multer from 'multer'
import {
  deleteMediaFile,
  getMediaFiles,
  updateMediaFile,
  uploadMediaFile,
} from '../controllers/mediaController.js'

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter(req, file, callback) {
    if (!file.mimetype.startsWith('image/')) {
      return callback(new Error('Only image files are allowed.'))
    }

    callback(null, true)
  },
})

router.get('/', getMediaFiles)
router.post('/', upload.single('file'), uploadMediaFile)
router.patch('/:id', updateMediaFile)
router.delete('/:id', deleteMediaFile)

export default router