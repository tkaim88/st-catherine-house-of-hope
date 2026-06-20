import { pool } from '../config/database.js'

function formatActivity(row) {
  return {
    id: row.id,
    action: row.action,
    details: row.details,
    createdAt: row.created_at,
  }
}

export const getActivities = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM activities
      ORDER BY created_at DESC
    `)

    res.json(result.rows.map(formatActivity))
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to load activities',
    })
  }
}

export const createActivity = async (req, res) => {
  try {
    const id = Date.now()
    const action = req.body.action || req.body.title || 'Activity'
    const details = req.body.details || req.body.description || ''

    const result = await pool.query(
      `
      INSERT INTO activities (
        id,
        action,
        details
      )
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [id, action, details]
    )

    res.status(201).json(formatActivity(result.rows[0]))
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to create activity',
    })
  }
}