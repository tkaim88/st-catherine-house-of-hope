import express from 'express'
import {
  createDonation,
  deleteDonation,
  getDonations,
  updateDonationStatus,
} from '../controllers/donationController.js'

const router = express.Router()

router.get('/', getDonations)
router.post('/', createDonation)
router.patch('/:id', updateDonationStatus)
router.delete('/:id', deleteDonation)

export default router