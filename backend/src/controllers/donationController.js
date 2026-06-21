import { pool } from '../config/database.js'

function formatDonation(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    currency: row.currency,
    amount: Number(row.amount || 0),
    donationType: row.donation_type,
    paymentMethod: row.payment_method,
    paymentReference: row.payment_reference,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const getDonations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM donations
      ORDER BY created_at DESC
    `)

    res.json(result.rows.map(formatDonation))
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to fetch donations',
    })
  }
}

export const createDonation = async (req, res) => {
  try {
    const {
      fullName,
      email,
      currency,
      amount,
      donationType,
      paymentMethod,
      paymentReference,
      message,
      status,
    } = req.body

    if (!fullName || !email || !amount) {
      return res.status(400).json({
        message: 'Full name, email, and amount are required.',
      })
    }

    const result = await pool.query(
      `
      INSERT INTO donations (
        id,
        full_name,
        email,
        currency,
        amount,
        donation_type,
        payment_method,
        payment_reference,
        message,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
      `,
      [
        Date.now(),
        fullName,
        email,
        currency || 'KSH',
        Number(amount),
        donationType || 'one-time',
        paymentMethod || '',
        paymentReference || '',
        message || '',
        status || 'pending',
      ]
    )

    res.status(201).json({
      message: 'Donation created successfully',
      data: formatDonation(result.rows[0]),
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
    const donationId = Number(req.params.id)
    const { status } = req.body

    const allowedStatuses = ['pending', 'approved', 'rejected']

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid donation status',
      })
    }

    const result = await pool.query(
      `
      UPDATE donations
      SET status = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [status, donationId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Donation not found',
      })
    }

    res.json({
      message: 'Donation status updated successfully',
      data: formatDonation(result.rows[0]),
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
    const donationId = Number(req.params.id)

    const result = await pool.query(
      `
      DELETE FROM donations
      WHERE id = $1
      RETURNING *
      `,
      [donationId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Donation not found',
      })
    }

    res.json({
      message: 'Donation deleted successfully',
      data: formatDonation(result.rows[0]),
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to delete donation',
    })
  }
}