import fs from 'fs/promises'
import path from 'path'
import { pool } from '../config/database.js'

const databasePath = path.join(process.cwd(), '..', 'db.json')

async function seedPayments() {
  try {
    const rawData = await fs.readFile(databasePath, 'utf-8')
    const database = JSON.parse(rawData)

    const payments = database.payments || []

    console.log(`Found ${payments.length} payments to migrate...`)

    for (const payment of payments) {
      await pool.query(
        `
        INSERT INTO payments (
          id,
          full_name,
          email,
          phone_number,
          amount,
          currency,
          payment_purpose,
          payment_provider,
          payment_mode,
          payment_status,
          related_child_id,
          related_child_name,
          sponsor_id,
          donor_id,
          donation_type,
          message,
          checkout_request_id,
          merchant_request_id,
          verified_at,
          created_at,
          updated_at
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
          $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21
        )
        ON CONFLICT (id) DO NOTHING
        `,
        [
          payment.id,
          payment.fullName,
          payment.email,
          payment.phoneNumber,
          Number(payment.amount || 0),
          payment.currency || 'KSH',
          payment.paymentPurpose || 'donation',
          payment.paymentProvider || 'mpesa',
          payment.paymentMode || 'mock',
          payment.paymentStatus || 'pending',
          payment.relatedChildId || null,
          payment.relatedChildName || '',
          payment.sponsorId || null,
          payment.donorId || null,
          payment.donationType || 'one-time',
          payment.message || '',
          payment.checkoutRequestId || '',
          payment.merchantRequestId || '',
          payment.verifiedAt || null,
          payment.createdAt || new Date().toISOString(),
          payment.updatedAt || new Date().toISOString(),
        ]
      )
    }

    console.log('Payments migration completed successfully.')

    await pool.end()
  } catch (error) {
    console.error('Payments migration failed:')
    console.error(error)

    await pool.end()
  }
}

seedPayments()