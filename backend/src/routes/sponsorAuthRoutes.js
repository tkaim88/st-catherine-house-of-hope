import express from 'express'
import {
  getSponsorProfile,
  loginSponsor,
  logoutSponsor,
} from '../controllers/sponsorAuthController.js'
import { protectSponsor } from '../middleware/sponsorAuthMiddleware.js'

const router = express.Router()

router.post('/login', loginSponsor)
router.post('/logout', logoutSponsor)
router.get('/me', protectSponsor, getSponsorProfile)

export default router