import express from 'express'
import {
  createVolunteer,
  deleteVolunteer,
  getVolunteers,
  updateVolunteerStatus,
} from '../controllers/volunteerController.js'

const router = express.Router()

router.get('/', getVolunteers)
router.post('/', createVolunteer)
router.patch('/:id', updateVolunteerStatus)
router.delete('/:id', deleteVolunteer)

export default router