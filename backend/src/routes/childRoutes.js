import express from 'express'
import {
  createChild,
  deleteChild,
  getChildById,
  getChildren,
  updateChild,
} from '../controllers/childController.js'

const router = express.Router()

router.get('/', getChildren)
router.get('/:id', getChildById)
router.post('/', createChild)
router.put('/:id', updateChild)
router.patch('/:id', updateChild)
router.delete('/:id', deleteChild)

export default router