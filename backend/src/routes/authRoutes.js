import express from 'express'
import {
  changeAdminPassword,
  loginAdmin,
  logoutAdmin,
} from '../controllers/authController.js'

const router = express.Router()

router.post('/login', loginAdmin)
router.post('/logout', logoutAdmin)
router.patch('/change-password', changeAdminPassword)

export default router