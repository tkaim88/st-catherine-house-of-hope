import { pool } from '../config/database.js'

function formatDonor(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    country: row.country,
    profileImage: row.profile_image,
    preferredCurrency: row.preferred_currency,
    donorType: row.donor_type,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const getDonors = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM donors
      ORDER BY created_at DESC
    `)

    res.json(result.rows.map(formatDonor))
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to fetch donors.',
    })
  }
}

export const createDonor = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      country,
      profileImage,
      preferredCurrency,
      donorType,
      notes,
      status,
    } = req.body

    if (!fullName || !email) {
      return res.status(400).json({
        message: 'Full name and email are required.',
      })
    }

    const result = await pool.query(
      `
      INSERT INTO donors (
        id,
        full_name,
        email,
        phone,
        country,
        profile_image,
        preferred_currency,
        donor_type,
        notes,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
      `,
      [
        Date.now(),
        fullName,
        email,
        phone || '',
        country || '',
        profileImage || '',
        preferredCurrency || 'KSH',
        donorType || 'individual',
        notes || '',
        status || 'active',
      ]
    )

    res.status(201).json({
      message: 'Donor created successfully.',
      data: formatDonor(result.rows[0]),
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to create donor.',
    })
  }
}

export const updateDonor = async (req, res) => {
  try {
    const donorId = Number(req.params.id)

    const existingDonor = await pool.query(
      `
      SELECT *
      FROM donors
      WHERE id = $1
      `,
      [donorId]
    )

    if (existingDonor.rows.length === 0) {
      return res.status(404).json({
        message: 'Donor not found.',
      })
    }

    const currentDonor = formatDonor(existingDonor.rows[0])

    const updatedDonor = {
      fullName: req.body.fullName ?? currentDonor.fullName,
      email: req.body.email ?? currentDonor.email,
      phone: req.body.phone ?? currentDonor.phone,
      country: req.body.country ?? currentDonor.country,
      profileImage: req.body.profileImage ?? currentDonor.profileImage,
      preferredCurrency:
        req.body.preferredCurrency ?? currentDonor.preferredCurrency,
      donorType: req.body.donorType ?? currentDonor.donorType,
      notes: req.body.notes ?? currentDonor.notes,
      status: req.body.status ?? currentDonor.status,
    }

    const result = await pool.query(
      `
      UPDATE donors
      SET
        full_name = $1,
        email = $2,
        phone = $3,
        country = $4,
        profile_image = $5,
        preferred_currency = $6,
        donor_type = $7,
        notes = $8,
        status = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
      `,
      [
        updatedDonor.fullName,
        updatedDonor.email,
        updatedDonor.phone,
        updatedDonor.country,
        updatedDonor.profileImage,
        updatedDonor.preferredCurrency,
        updatedDonor.donorType,
        updatedDonor.notes,
        updatedDonor.status,
        donorId,
      ]
    )

    res.json({
      message: 'Donor updated successfully.',
      data: formatDonor(result.rows[0]),
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to update donor.',
    })
  }
}

export const deleteDonor = async (req, res) => {
  try {
    const donorId = Number(req.params.id)

    const result = await pool.query(
      `
      DELETE FROM donors
      WHERE id = $1
      RETURNING *
      `,
      [donorId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Donor not found.',
      })
    }

    res.json({
      message: 'Donor deleted successfully.',
      data: formatDonor(result.rows[0]),
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to delete donor.',
    })
  }
}