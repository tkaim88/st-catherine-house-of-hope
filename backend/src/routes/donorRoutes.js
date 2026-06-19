import express from 'express'
import {
  createDonor,
  deleteDonor,
  getDonors,
  updateDonor,
} from '../controllers/donorController.js'

const router = express.Router()

router.get('/', getDonors)
router.post('/', createDonor)
router.patch('/:id', updateDonor)
router.delete('/:id', deleteDonor)

export default router