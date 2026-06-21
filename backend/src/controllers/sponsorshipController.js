import { pool } from '../config/database.js'

function formatSponsorship(row) {
  return {
    id: row.id,
    childId: row.child_id,
    childName: row.child_name,
    sponsorId: row.sponsor_id,
    sponsorName: row.sponsor_name,
    sponsorEmail: row.sponsor_email,
    amount: Number(row.amount || 0),
    currency: row.currency,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const getSponsorships = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM sponsorships
      ORDER BY start_date DESC
    `)

    res.json(result.rows.map(formatSponsorship))
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to load sponsorships.' })
  }
}