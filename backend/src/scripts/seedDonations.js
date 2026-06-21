import fs from 'fs/promises'
import path from 'path'
import { pool } from '../config/database.js'

const databasePath = path.join(process.cwd(), '..', 'db.json')

async function seedDonations() {
  try {
    const rawData = await fs.readFile(databasePath, 'utf-8')
    const database = JSON.parse(rawData)

    const donations = database.donations || []

    console.log(`Found ${donations.length} donations to migrate...`)

    for (const donation of donations) {
      await pool.query(
        `
        INSERT INTO donations (
          id,
          full_name,
          email,
          currency,
          amount,
          donation_type,
          payment_method,
          payment_reference,
          message,
          status,
          created_at,
          updated_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        ON CONFLICT (id) DO NOTHING
        `,
        [
          donation.id,
          donation.fullName,
          donation.email || '',
          donation.currency || 'KSH',
          Number(donation.amount || 0),
          donation.donationType || 'one-time',
          donation.paymentMethod || '',
          donation.paymentReference || '',
          donation.message || '',
          donation.status || 'pending',
          donation.createdAt || new Date().toISOString(),
          donation.updatedAt || new Date().toISOString(),
        ]
      )
    }

    console.log('Donations migration completed successfully.')

    await pool.end()
  } catch (error) {
    console.error('Donations migration failed:')
    console.error(error)

    await pool.end()
  }
}

seedDonations()