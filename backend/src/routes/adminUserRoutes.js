import express from 'express'
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  resetAdminUserPassword,
  updateAdminUserRole,
} from '../controllers/adminUserController.js'

const router = express.Router()

router.get('/', getAdminUsers)
router.post('/', createAdminUser)
router.patch('/:id/role', updateAdminUserRole)
router.patch('/:id/password', resetAdminUserPassword)
router.delete('/:id', deleteAdminUser)

export default router