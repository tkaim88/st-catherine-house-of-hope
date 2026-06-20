import fs from 'fs/promises'
import path from 'path'
import { pool } from '../config/database.js'

const databasePath = path.join(process.cwd(), '..', 'db.json')

async function seedActivities() {
  try {
    const rawData = await fs.readFile(databasePath, 'utf-8')
    const database = JSON.parse(rawData)

    const activities = database.activities || []

    console.log(`Found ${activities.length} activities to migrate...`)

    for (const activity of activities) {
      await pool.query(
        `
        INSERT INTO activities (
          id,
          action,
          details,
          created_at
        )
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO NOTHING
        `,
        [
          activity.id,
          activity.action || 'Activity',
          activity.details || '',
          activity.createdAt || new Date().toISOString(),
        ]
      )
    }

    console.log('Activities migration completed successfully.')

    await pool.end()
  } catch (error) {
    console.error('Activities migration failed:')
    console.error(error)

    await pool.end()
  }
}

seedActivities()