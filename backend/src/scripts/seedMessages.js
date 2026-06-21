import fs from 'fs/promises'
import path from 'path'
import { pool } from '../config/database.js'

const databasePath = path.join(process.cwd(), '..', 'db.json')

async function seedMessages() {
  try {
    const rawData = await fs.readFile(databasePath, 'utf-8')
    const database = JSON.parse(rawData)

    const messages = database.messages || []

    console.log(`Found ${messages.length} messages to migrate...`)

    for (const message of messages) {
      await pool.query(
        `
        INSERT INTO messages (
          id,
          full_name,
          email,
          phone,
          subject,
          message,
          status,
          created_at,
          updated_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (id) DO NOTHING
        `,
        [
          message.id,
          message.fullName,
          message.email || '',
          message.phone || '',
          message.subject || '',
          message.message || '',
          message.status || 'unread',
          message.createdAt || new Date().toISOString(),
          message.updatedAt || new Date().toISOString(),
        ]
      )
    }

    console.log('Messages migration completed successfully.')

    await pool.end()
  } catch (error) {
    console.error('Messages migration failed:')
    console.error(error)

    await pool.end()
  }
}

seedMessages()