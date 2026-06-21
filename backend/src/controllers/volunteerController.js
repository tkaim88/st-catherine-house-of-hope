import { pool } from '../config/database.js'

function formatVolunteer(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    skills: row.skills,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const getVolunteers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM volunteers
      ORDER BY created_at DESC
    `)

    res.json(result.rows.map(formatVolunteer))
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to fetch volunteers',
    })
  }
}

export const createVolunteer = async (req, res) => {
  try {
    const { fullName, email, phone, skills, message } = req.body

    if (!fullName || !email || !phone || !skills) {
      return res.status(400).json({
        message: 'Full name, email, phone, and skills are required.',
      })
    }

    const result = await pool.query(
      `
      INSERT INTO volunteers (
        id,
        full_name,
        email,
        phone,
        skills,
        message,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        Date.now(),
        fullName,
        email,
        phone,
        skills,
        message || '',
        'pending',
      ]
    )

    res.status(201).json({
      message: 'Volunteer created successfully',
      data: formatVolunteer(result.rows[0]),
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to create volunteer',
    })
  }
}

export const updateVolunteerStatus = async (req, res) => {
  try {
    const volunteerId = Number(req.params.id)
    const { status } = req.body

    const allowedStatuses = ['pending', 'approved', 'rejected']

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid volunteer status',
      })
    }

    const result = await pool.query(
      `
      UPDATE volunteers
      SET status = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [status, volunteerId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Volunteer not found',
      })
    }

    res.json({
      message: 'Volunteer status updated successfully',
      data: formatVolunteer(result.rows[0]),
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to update volunteer status',
    })
  }
}

export const deleteVolunteer = async (req, res) => {
  try {
    const volunteerId = Number(req.params.id)

    const result = await pool.query(
      `
      DELETE FROM volunteers
      WHERE id = $1
      RETURNING *
      `,
      [volunteerId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Volunteer not found',
      })
    }

    res.json({
      message: 'Volunteer deleted successfully',
      data: formatVolunteer(result.rows[0]),
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to delete volunteer',
    })
  }
}