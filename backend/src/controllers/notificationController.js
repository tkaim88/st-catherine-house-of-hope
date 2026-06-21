import { pool } from '../config/database.js'

function formatNotification(row) {
  return {
    id: row.id,
    type: row.type,
    recipient: row.recipient,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const getNotifications = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM notifications
      ORDER BY created_at DESC
    `)

    res.json(result.rows.map(formatNotification))
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to load notifications.' })
  }
}

export const createNotification = async (req, res) => {
  try {
    const result = await pool.query(
      `
      INSERT INTO notifications (
        id,
        type,
        recipient,
        message,
        status
      )
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *
      `,
      [
        Date.now(),
        req.body.type || 'General Notification',
        req.body.recipient || '',
        req.body.message || '',
        req.body.status || 'not sent',
      ]
    )

    res.status(201).json({
      message: 'Notification created successfully.',
      data: formatNotification(result.rows[0]),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to create notification.' })
  }
}

export const updateNotification = async (req, res) => {
  try {
    const notificationId = Number(req.params.id)

    const existingNotification = await pool.query(
      `
      SELECT *
      FROM notifications
      WHERE id = $1
      `,
      [notificationId]
    )

    if (existingNotification.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found.' })
    }

    const currentNotification = formatNotification(existingNotification.rows[0])

    const updatedNotification = {
      type: req.body.type ?? currentNotification.type,
      recipient: req.body.recipient ?? currentNotification.recipient,
      message: req.body.message ?? currentNotification.message,
      status: req.body.status ?? currentNotification.status,
    }

    const result = await pool.query(
      `
      UPDATE notifications
      SET
        type = $1,
        recipient = $2,
        message = $3,
        status = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
      `,
      [
        updatedNotification.type,
        updatedNotification.recipient,
        updatedNotification.message,
        updatedNotification.status,
        notificationId,
      ]
    )

    res.json({
      message: 'Notification updated successfully.',
      data: formatNotification(result.rows[0]),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to update notification.' })
  }
}

export const deleteNotification = async (req, res) => {
  try {
    const notificationId = Number(req.params.id)

    const result = await pool.query(
      `
      DELETE FROM notifications
      WHERE id = $1
      RETURNING *
      `,
      [notificationId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found.' })
    }

    res.json({
      message: 'Notification deleted successfully.',
      data: formatNotification(result.rows[0]),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to delete notification.' })
  }
}