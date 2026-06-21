import fs from 'fs/promises'
import path from 'path'
import { pool } from '../config/database.js'

const databasePath = path.join(process.cwd(), '..', 'db.json')

async function seedDonors() {
  try {
    const rawData = await fs.readFile(databasePath, 'utf-8')
    const database = JSON.parse(rawData)

    const donors = database.donors || []

    console.log(`Found ${donors.length} donors to migrate...`)

    for (const donor of donors) {
      await pool.query(
        `
        INSERT INTO donors (
          id,
          full_name,
          email,
          phone,
          country,
          profile_image,
          preferred_currency,
          donor_type,
          notes,
          status,
          created_at,
          updated_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        ON CONFLICT (id) DO NOTHING
        `,
        [
          donor.id,
          donor.fullName,
          donor.email || '',
          donor.phone || '',
          donor.country || '',
          donor.profileImage || '',
          donor.preferredCurrency || 'KSH',
          donor.donorType || 'individual',
          donor.notes || '',
          donor.status || 'active',
          donor.createdAt || new Date().toISOString(),
          donor.updatedAt || new Date().toISOString(),
        ]
      )
    }

    console.log('Donors migration completed successfully.')

    await pool.end()
  } catch (error) {
    console.error('Donors migration failed:')
    console.error(error)

    await pool.end()
  }
}

seedDonors()