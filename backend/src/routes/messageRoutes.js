import express from 'express'
import {
  createMessage,
  deleteMessage,
  getMessages,
  updateMessageStatus,
} from '../controllers/messageController.js'

const router = express.Router()

router.get('/', getMessages)
router.post('/', createMessage)
router.patch('/:id', updateMessageStatus)
router.delete('/:id', deleteMessage)

export default router