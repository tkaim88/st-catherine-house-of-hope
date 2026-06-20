import express from 'express'
import {
  createNotification,
  deleteNotification,
  getNotifications,
  updateNotification,
} from '../controllers/notificationController.js'

const router = express.Router()

router.get('/', getNotifications)
router.post('/', createNotification)
router.patch('/:id', updateNotification)
router.delete('/:id', deleteNotification)

export default router