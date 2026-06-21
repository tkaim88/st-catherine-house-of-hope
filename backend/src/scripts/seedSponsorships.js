import fs from 'fs/promises'
import path from 'path'
import { pool } from '../config/database.js'

const databasePath = path.join(process.cwd(), '..', 'db.json')

async function seedSponsorships() {
  try {
    const rawData = await fs.readFile(databasePath, 'utf-8')
    const database = JSON.parse(rawData)

    const sponsorships = database.sponsorships || []

    console.log(`Found ${sponsorships.length} sponsorships to migrate...`)

    for (const sponsorship of sponsorships) {
      await pool.query(
        `
        INSERT INTO sponsorships (
          id,
          child_id,
          child_name,
          sponsor_id,
          sponsor_name,
          sponsor_email,
          amount,
          currency,
          status,
          start_date,
          end_date,
          created_at,
          updated_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        ON CONFLICT (id) DO NOTHING
        `,
        [
          sponsorship.id,
          sponsorship.childId,
          sponsorship.childName,
          sponsorship.sponsorId,
          sponsorship.sponsorName,
          sponsorship.sponsorEmail || '',
          Number(sponsorship.amount || 0),
          sponsorship.currency || 'KSH',
          sponsorship.status || 'active',
          sponsorship.startDate || new Date().toISOString(),
          sponsorship.endDate || null,
          sponsorship.createdAt || sponsorship.startDate || new Date().toISOString(),
          sponsorship.updatedAt || new Date().toISOString(),
        ]
      )
    }

    console.log('Sponsorships migration completed successfully.')
    await pool.end()
  } catch (error) {
    console.error('Sponsorships migration failed:')
    console.error(error)
    await pool.end()
  }
}

seedSponsorships()