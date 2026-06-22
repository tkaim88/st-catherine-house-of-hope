import express from 'express'
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  resetAdminUserPassword,
  updateAdminUserRole,
} from '../controllers/adminUserController.js'
import {
  authenticateAdmin,
  authorizeRoles,
} from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(authenticateAdmin)

router.get(
  '/',
  authorizeRoles('super-admin'),
  getAdminUsers
)

router.post(
  '/',
  authorizeRoles('super-admin'),
  createAdminUser
)

router.patch(
  '/:id/role',
  authorizeRoles('super-admin'),
  updateAdminUserRole
)

router.patch(
  '/:id/password',
  authorizeRoles('super-admin'),
  resetAdminUserPassword
)

router.delete(
  '/:id',
  authorizeRoles('super-admin'),
  deleteAdminUser
)

export default router