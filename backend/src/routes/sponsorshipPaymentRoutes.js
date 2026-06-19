import express from 'express'
import {
  createSponsorshipPayment,
  deleteSponsorshipPayment,
  getSponsorshipPayments,
  updateSponsorshipPayment,
} from '../controllers/sponsorshipPaymentController.js'

const router = express.Router()

router.get('/', getSponsorshipPayments)
router.post('/', createSponsorshipPayment)
router.patch('/:id', updateSponsorshipPayment)
router.delete('/:id', deleteSponsorshipPayment)

export default router