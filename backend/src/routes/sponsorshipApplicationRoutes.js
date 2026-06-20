import express from 'express'
import {
  approveSponsorshipApplication,
  createSponsorshipApplication,
  deleteSponsorshipApplication,
  getSponsorshipApplications,
  rejectSponsorshipApplication,
} from '../controllers/sponsorshipApplicationController.js'

const router = express.Router()

router.get('/', getSponsorshipApplications)
router.post('/', createSponsorshipApplication)
router.patch('/:id/approve', approveSponsorshipApplication)
router.patch('/:id/reject', rejectSponsorshipApplication)
router.delete('/:id', deleteSponsorshipApplication)

export default router