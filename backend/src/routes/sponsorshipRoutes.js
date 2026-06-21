import express from 'express'
import { getSponsorships } from '../controllers/sponsorshipController.js'

const router = express.Router()

router.get('/', getSponsorships)

export default router