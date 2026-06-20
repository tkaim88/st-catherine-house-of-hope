import express from 'express'
import {
  initiateMpesaPayment,
  verifyMpesaPayment,
} from '../controllers/paymentController.js'

const router = express.Router()

router.post('/mpesa/initiate', initiateMpesaPayment)
router.post('/mpesa/verify', verifyMpesaPayment)

export default router