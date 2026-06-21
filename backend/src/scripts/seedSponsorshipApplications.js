import fs from 'fs/promises'
import path from 'path'
import { pool } from '../config/database.js'

const databasePath = path.join(process.cwd(), '..', 'db.json')

async function seedSponsorshipApplications() {
  try {
    const rawData = await fs.readFile(databasePath, 'utf-8')
    const database = JSON.parse(rawData)

    const applications = database.sponsorshipApplications || []

    console.log(`Found ${applications.length} sponsorship applications to migrate...`)

    for (const application of applications) {
      await pool.query(
        `
        INSERT INTO sponsorship_applications (
          id,
          child_id,
          child_name,
          full_name,
          email,
          phone,
          country,
          monthly_amount,
          currency,
          message,
          status,
          sponsor_id,
          approved_at,
          rejected_at,
          created_at,
          updated_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        ON CONFLICT (id) DO NOTHING
        `,
        [
          application.id,
          application.childId,
          application.childName,
          application.fullName,
          application.email,
          application.phone || '',
          application.country || '',
          Number(application.monthlyAmount || 0),
          application.currency || 'KSH',
          application.message || '',
          application.status || 'pending',
          application.sponsorId || null,
          application.approvedAt || null,
          application.rejectedAt || null,
          application.createdAt || new Date().toISOString(),
          application.updatedAt || new Date().toISOString(),
        ]
      )
    }

    console.log('Sponsorship applications migration completed successfully.')

    await pool.end()
  } catch (error) {
    console.error('Sponsorship applications migration failed:')
    console.error(error)

    await pool.end()
  }
}

seedSponsorshipApplications()