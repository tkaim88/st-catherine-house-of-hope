import express from 'express'
import {
  assignSponsorToChild,
  createSponsor,
  deleteSponsor,
  getSponsors,
  updateSponsor,
} from '../controllers/sponsorController.js'

const router = express.Router()

router.get('/', getSponsors)
router.post('/', createSponsor)
router.patch('/:id', updateSponsor)
router.patch('/:id/assign-child', assignSponsorToChild)
router.delete('/:id', deleteSponsor)

export default router