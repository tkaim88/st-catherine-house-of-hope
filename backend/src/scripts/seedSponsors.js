import fs from 'fs/promises'
import path from 'path'
import { pool } from '../config/database.js'

const databasePath = path.join(process.cwd(), '..', 'db.json')

async function seedSponsors() {
  try {
    const rawData = await fs.readFile(databasePath, 'utf-8')
    const database = JSON.parse(rawData)

    const sponsors = database.sponsors || []

    console.log(`Found ${sponsors.length} sponsors to migrate...`)

    for (const sponsor of sponsors) {
      await pool.query(
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
          status,
          created_at,
          updated_at
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
        )
        ON CONFLICT (id) DO NOTHING
        `,
        [
          sponsor.id,
          sponsor.fullName,
          sponsor.email || '',
          sponsor.phone || '',
          sponsor.country || '',
          sponsor.profileImage || '',
          sponsor.childId || null,
          sponsor.childName || '',
          sponsor.currency || 'KSH',
          sponsor.monthlyAmount || 0,
          sponsor.notes || '',
          sponsor.status || 'Active',
          sponsor.createdAt || new Date().toISOString(),
          sponsor.updatedAt || new Date().toISOString(),
        ]
      )
    }

    console.log('Sponsors migration completed successfully.')

    await pool.end()
  } catch (error) {
    console.error('Sponsors migration failed:')
    console.error(error)

    await pool.end()
  }
}

seedSponsors()