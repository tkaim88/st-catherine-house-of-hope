import express from 'express'
import {
  createActivity,
  getActivities,
} from '../controllers/activityController.js'

const router = express.Router()

router.get('/', getActivities)
router.post('/', createActivity)

export default router