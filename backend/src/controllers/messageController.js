import { pool } from '../config/database.js'

function formatMessage(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const getMessages = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM messages
      ORDER BY created_at DESC
    `)

    res.json(result.rows.map(formatMessage))
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to fetch messages',
    })
  }
}

export const createMessage = async (req, res) => {
  try {
    const { fullName, email, phone, subject, message } = req.body

    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({
        message: 'Full name, email, subject, and message are required.',
      })
    }

    const result = await pool.query(
      `
      INSERT INTO messages (
        id,
        full_name,
        email,
        phone,
        subject,
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
        phone || '',
        subject,
        message,
        'unread',
      ]
    )

    res.status(201).json({
      message: 'Message created successfully',
      data: formatMessage(result.rows[0]),
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to create message',
    })
  }
}

export const updateMessageStatus = async (req, res) => {
  try {
    const messageId = Number(req.params.id)
    const { status } = req.body

    const allowedStatuses = ['unread', 'read', 'archived']

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid message status',
      })
    }

    const result = await pool.query(
      `
      UPDATE messages
      SET status = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [status, messageId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Message not found',
      })
    }

    res.json({
      message: 'Message status updated successfully',
      data: formatMessage(result.rows[0]),
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to update message status',
    })
  }
}

export const deleteMessage = async (req, res) => {
  try {
    const messageId = Number(req.params.id)

    const result = await pool.query(
      `
      DELETE FROM messages
      WHERE id = $1
      RETURNING *
      `,
      [messageId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Message not found',
      })
    }

    res.json({
      message: 'Message deleted successfully',
      data: formatMessage(result.rows[0]),
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to delete message',
    })
  }
}