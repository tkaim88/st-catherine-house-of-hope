import fs from 'fs/promises'
import path from 'path'
import { pool } from '../config/database.js'

const databasePath = path.join(process.cwd(), '..', 'db.json')

async function seedVolunteers() {
  try {
    const rawData = await fs.readFile(databasePath, 'utf-8')
    const database = JSON.parse(rawData)

    const volunteers = database.volunteers || []

    console.log(`Found ${volunteers.length} volunteers to migrate...`)

    for (const volunteer of volunteers) {
      await pool.query(
        `
        INSERT INTO volunteers (
          id,
          full_name,
          email,
          phone,
          skills,
          message,
          status,
          created_at,
          updated_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (id) DO NOTHING
        `,
        [
          volunteer.id,
          volunteer.fullName,
          volunteer.email || '',
          volunteer.phone || '',
          volunteer.skills || '',
          volunteer.message || '',
          volunteer.status || 'pending',
          volunteer.createdAt || new Date().toISOString(),
          volunteer.updatedAt || new Date().toISOString(),
        ]
      )
    }

    console.log('Volunteers migration completed successfully.')

    await pool.end()
  } catch (error) {
    console.error('Volunteers migration failed:')
    console.error(error)

    await pool.end()
  }
}

seedVolunteers()