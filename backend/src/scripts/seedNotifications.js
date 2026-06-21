import fs from 'fs/promises'
import path from 'path'
import { pool } from '../config/database.js'

const databasePath = path.join(process.cwd(), '..', 'db.json')

async function seedNotifications() {
  try {
    const rawData = await fs.readFile(databasePath, 'utf-8')
    const database = JSON.parse(rawData)

    const notifications = database.notifications || []

    console.log(`Found ${notifications.length} notifications to migrate...`)

    for (const notification of notifications) {
      await pool.query(
        `
        INSERT INTO notifications (
          id,
          type,
          recipient,
          message,
          status,
          created_at,
          updated_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT (id) DO NOTHING
        `,
        [
          notification.id,
          notification.type || 'General Notification',
          notification.recipient || '',
          notification.message || '',
          notification.status || 'not sent',
          notification.createdAt || new Date().toISOString(),
          notification.updatedAt || new Date().toISOString(),
        ]
      )
    }

    console.log('Notifications migration completed successfully.')

    await pool.end()
  } catch (error) {
    console.error('Notifications migration failed:')
    console.error(error)

    await pool.end()
  }
}

seedNotifications()