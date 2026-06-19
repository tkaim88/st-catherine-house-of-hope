import fs from 'fs/promises'
import path from 'path'

const databasePath = path.join(process.cwd(), '..', 'db.json')

async function readDatabase() {
  const data = await fs.readFile(databasePath, 'utf-8')
  return JSON.parse(data)
}

async function writeDatabase(data) {
  await fs.writeFile(databasePath, JSON.stringify(data, null, 2))
}

export const getDonations = async (req, res) => {
  try {
    const database = await readDatabase()

    res.json(database.donations || [])
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to fetch donations',
    })
  }
}

export const createDonation = async (req, res) => {
  try {
    const database = await readDatabase()

    const newDonation = {
      fullName: req.body.fullName,
      email: req.body.email,
      currency: req.body.currency,
      amount: Number(req.body.amount),
      donationType: req.body.donationType,
      message: req.body.message || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      id: Date.now(),
    }

    database.donations = [...(database.donations || []), newDonation]

    await writeDatabase(database)

    res.status(201).json({
      message: 'Donation created successfully',
      data: newDonation,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to create donation',
    })
  }
}

export const updateDonationStatus = async (req, res) => {
  try {
    const database = await readDatabase()
    const donationId = Number(req.params.id)
    const { status } = req.body

    const allowedStatuses = ['pending', 'approved', 'rejected']

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid donation status',
      })
    }

    const donationExists = database.donations.some(
      (donation) => Number(donation.id) === donationId
    )

    if (!donationExists) {
      return res.status(404).json({
        message: 'Donation not found',
      })
    }

    database.donations = database.donations.map((donation) =>
      Number(donation.id) === donationId
        ? { ...donation, status }
        : donation
    )

    await writeDatabase(database)

    const updatedDonation = database.donations.find(
      (donation) => Number(donation.id) === donationId
    )

    res.json({
      message: 'Donation status updated successfully',
      data: updatedDonation,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to update donation status',
    })
  }
}

export const deleteDonation = async (req, res) => {
  try {
    const database = await readDatabase()
    const donationId = Number(req.params.id)

    const donationExists = database.donations.some(
      (donation) => Number(donation.id) === donationId
    )

    if (!donationExists) {
      return res.status(404).json({
        message: 'Donation not found',
      })
    }

    database.donations = database.donations.filter(
      (donation) => Number(donation.id) !== donationId
    )

    await writeDatabase(database)

    res.json({
      message: 'Donation deleted successfully',
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to delete donation',
    })
  }
}