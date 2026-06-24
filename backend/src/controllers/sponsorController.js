import bcrypt from 'bcryptjs'
import { pool } from '../config/database.js'

function formatSponsor(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    country: row.country,
    profileImage: row.profile_image,
    childId: row.child_id,
    childName: row.child_name,
    currency: row.currency,
    monthlyAmount: Number(row.monthly_amount || 0),
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const getSponsors = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM sponsors
      ORDER BY created_at DESC
    `)

    res.json(result.rows.map(formatSponsor))
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to load sponsors.' })
  }
}

export const createSponsor = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      country,
      profileImage,
      childId,
      currency,
      monthlyAmount,
      notes,
      status,
    } = req.body

    if (!fullName || !email || !monthlyAmount) {
      return res.status(400).json({
        message: 'Full name, email, and monthly amount are required.',
      })
    }

    let selectedChild = null

    if (childId) {
      const childResult = await pool.query(
        `
        SELECT *
        FROM children
        WHERE id = $1
        `,
        [childId]
      )

      selectedChild = childResult.rows[0]

      if (!selectedChild) {
        return res.status(404).json({
          message: 'Selected child was not found.',
        })
      }

      if (selectedChild.sponsor && selectedChild.sponsor !== 'None') {
        return res.status(409).json({
          message: 'This child already has a sponsor.',
        })
      }
    }

    const id = Date.now()

    const sponsorResult = await pool.query(
      `
      INSERT INTO sponsors (
        id,
        full_name,
        email,
        phone,
        country,
        profile_image,
        child_id,
        child_name,
        currency,
        monthly_amount,
        notes,
        status
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
      )
      RETURNING *
      `,
      [
        id,
        fullName,
        email,
        phone || '',
        country || '',
        profileImage || '',
        selectedChild ? selectedChild.id : null,
        selectedChild ? selectedChild.full_name : 'Unassigned',
        currency || 'KSH',
        Number(monthlyAmount),
        notes || '',
        status || 'Active',
      ]
    )

    const newSponsor = sponsorResult.rows[0]

    if (selectedChild) {
      await pool.query(
        `
        UPDATE children
        SET sponsor = $1,
            sponsor_id = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        `,
        [newSponsor.full_name, newSponsor.id, selectedChild.id]
      )
    }

    res.status(201).json({
      message: 'Sponsor created successfully.',
      data: formatSponsor(newSponsor),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to create sponsor.' })
  }
}

export const updateSponsor = async (req, res) => {
  try {
    const sponsorId = Number(req.params.id)

    const existingSponsorResult = await pool.query(
      `
      SELECT *
      FROM sponsors
      WHERE id = $1
      `,
      [sponsorId]
    )

    if (existingSponsorResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Sponsor not found.',
      })
    }

    const currentSponsor = formatSponsor(existingSponsorResult.rows[0])

    const updatedSponsor = {
      fullName: req.body.fullName ?? currentSponsor.fullName,
      email: req.body.email ?? currentSponsor.email,
      phone: req.body.phone ?? currentSponsor.phone,
      country: req.body.country ?? currentSponsor.country,
      profileImage: req.body.profileImage ?? currentSponsor.profileImage,
      currency: req.body.currency ?? currentSponsor.currency,
      monthlyAmount:
        req.body.monthlyAmount !== undefined
          ? Number(req.body.monthlyAmount)
          : currentSponsor.monthlyAmount,
      notes: req.body.notes ?? currentSponsor.notes,
      status: req.body.status ?? currentSponsor.status,
    }

    const result = await pool.query(
      `
      UPDATE sponsors
      SET
        full_name = $1,
        email = $2,
        phone = $3,
        country = $4,
        profile_image = $5,
        currency = $6,
        monthly_amount = $7,
        notes = $8,
        status = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
      `,
      [
        updatedSponsor.fullName,
        updatedSponsor.email,
        updatedSponsor.phone,
        updatedSponsor.country,
        updatedSponsor.profileImage,
        updatedSponsor.currency,
        updatedSponsor.monthlyAmount,
        updatedSponsor.notes,
        updatedSponsor.status,
        sponsorId,
      ]
    )

    await pool.query(
      `
      UPDATE children
      SET sponsor = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE sponsor_id = $2
      `,
      [updatedSponsor.fullName, sponsorId]
    )

    res.json({
      message: 'Sponsor updated successfully.',
      data: formatSponsor(result.rows[0]),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to update sponsor.' })
  }
}

export const assignSponsorToChild = async (req, res) => {
  try {
    const sponsorId = Number(req.params.id)
    const childId = Number(req.body.childId)

    const sponsorResult = await pool.query(
      `
      SELECT *
      FROM sponsors
      WHERE id = $1
      `,
      [sponsorId]
    )

    const childResult = await pool.query(
      `
      SELECT *
      FROM children
      WHERE id = $1
      `,
      [childId]
    )

    const sponsor = sponsorResult.rows[0]
    const child = childResult.rows[0]

    if (!sponsor) {
      return res.status(404).json({ message: 'Sponsor not found.' })
    }

    if (!child) {
      return res.status(404).json({ message: 'Child not found.' })
    }

    if (child.sponsor && child.sponsor !== 'None') {
      return res.status(409).json({
        message: 'This child already has a sponsor.',
      })
    }

    const updatedSponsorResult = await pool.query(
      `
      UPDATE sponsors
      SET child_id = $1,
          child_name = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
      `,
      [child.id, child.full_name, sponsor.id]
    )

    await pool.query(
      `
      UPDATE children
      SET sponsor = $1,
          sponsor_id = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      `,
      [sponsor.full_name, sponsor.id, child.id]
    )

    res.json({
      message: 'Sponsor assigned to child successfully.',
      data: formatSponsor(updatedSponsorResult.rows[0]),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to assign sponsor.' })
  }
}

export const updateSponsorPassword = async (req, res) => {
  try {
    const sponsorId = Number(req.params.id)
    const { password } = req.body

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: 'Sponsor password must be at least 6 characters long.',
      })
    }

    const sponsorResult = await pool.query(
      `
      SELECT *
      FROM sponsors
      WHERE id = $1
      `,
      [sponsorId]
    )

    if (sponsorResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Sponsor not found.',
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const result = await pool.query(
      `
      UPDATE sponsors
      SET password_hash = $1,
          failed_login_attempts = 0,
          locked_until = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [passwordHash, sponsorId]
    )

    res.json({
      message: 'Sponsor portal password updated successfully.',
      data: formatSponsor(result.rows[0]),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Failed to update sponsor portal password.',
    })
  }
}

export const deleteSponsor = async (req, res) => {
  try {
    const sponsorId = Number(req.params.id)

    const sponsorResult = await pool.query(
      `
      DELETE FROM sponsors
      WHERE id = $1
      RETURNING *
      `,
      [sponsorId]
    )

    if (sponsorResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Sponsor not found.',
      })
    }

    const deletedSponsor = sponsorResult.rows[0]

    await pool.query(
      `
      UPDATE children
      SET sponsor = 'None',
          sponsor_id = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE sponsor_id = $1
         OR sponsor = $2
      `,
      [deletedSponsor.id, deletedSponsor.full_name]
    )

    res.json({
      message: 'Sponsor deleted successfully.',
      data: formatSponsor(deletedSponsor),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to delete sponsor.' })
  }
}