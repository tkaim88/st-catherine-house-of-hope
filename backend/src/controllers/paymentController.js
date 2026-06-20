import fs from 'fs/promises'
import path from 'path'
import {
  initiateMockMpesaPayment,
  verifyMockMpesaPayment,
} from '../services/mpesaService.js'

const databasePath = path.join(process.cwd(), '..', 'db.json')

async function readDatabase() {
  const data = await fs.readFile(databasePath, 'utf-8')
  return JSON.parse(data)
}

async function writeDatabase(data) {
  await fs.writeFile(databasePath, JSON.stringify(data, null, 2))
}

function createActivity(database, action, details) {
  const newActivity = {
    id: Date.now(),
    action,
    details,
    createdAt: new Date().toISOString(),
  }

  database.activities = [...(database.activities || []), newActivity]
}

function createNotification(database, type, recipient, message) {
  const newNotification = {
    id: Date.now() + 1,
    type,
    recipient,
    message,
    status: 'not sent',
    createdAt: new Date().toISOString(),
  }

  database.notifications = [...(database.notifications || []), newNotification]
}

export const initiateMpesaPayment = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      amount,
      currency,
      paymentPurpose,
      relatedChildId,
      relatedChildName,
      sponsorId,
      donorId,
      donationType,
      message,
    } = req.body

    if (!fullName || !email || !phoneNumber || !amount) {
      return res.status(400).json({
        message: 'Full name, email, phone number, and amount are required.',
      })
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: 'Payment amount must be greater than zero.',
      })
    }

    const database = await readDatabase()

    const paymentRecord = {
      id: Date.now(),
      fullName,
      email,
      phoneNumber,
      amount: Number(amount),
      currency: currency || 'KSH',
      paymentPurpose: paymentPurpose || 'donation',
      paymentProvider: 'mpesa',
      paymentMode: 'mock',
      paymentStatus: 'pending',
      relatedChildId: relatedChildId || null,
      relatedChildName: relatedChildName || '',
      sponsorId: sponsorId || null,
      donorId: donorId || null,
      donationType: donationType || 'one-time',
      message: message || '',
      createdAt: new Date().toISOString(),
    }

    const mpesaResponse = await initiateMockMpesaPayment({
      phoneNumber,
      amount,
      accountReference: 'St Catherine House of Hope',
      transactionDescription: paymentPurpose || 'Donation',
    })

    paymentRecord.checkoutRequestId = mpesaResponse.checkoutRequestId
    paymentRecord.merchantRequestId = mpesaResponse.merchantRequestId

    database.payments = [...(database.payments || []), paymentRecord]

    createActivity(
      database,
      'M-Pesa Payment Initiated',
      `${fullName} initiated a mock M-Pesa payment of ${paymentRecord.currency} ${paymentRecord.amount.toLocaleString(
        'en-US'
      )}.`
    )

    createNotification(
      database,
      'Payment Initiated',
      email,
      `Hello ${fullName}, your M-Pesa payment request has been initiated.`
    )

    await writeDatabase(database)

    res.status(201).json({
      message: 'M-Pesa payment initiated successfully.',
      data: {
        payment: paymentRecord,
        mpesa: mpesaResponse,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Failed to initiate M-Pesa payment.',
    })
  }
}

export const verifyMpesaPayment = async (req, res) => {
  try {
    const { checkoutRequestId } = req.body

    if (!checkoutRequestId) {
      return res.status(400).json({
        message: 'Checkout request ID is required.',
      })
    }

    const database = await readDatabase()

    const payment = (database.payments || []).find(
      (item) => item.checkoutRequestId === checkoutRequestId
    )

    if (!payment) {
      return res.status(404).json({
        message: 'Payment record not found.',
      })
    }

    const verification = await verifyMockMpesaPayment(checkoutRequestId)

    database.payments = (database.payments || []).map((item) =>
      item.checkoutRequestId === checkoutRequestId
        ? {
            ...item,
            paymentStatus: verification.status,
            verifiedAt: new Date().toISOString(),
          }
        : item
    )

    if (verification.status === 'paid') {
      const donationRecord = {
        id: Date.now() + 2,
        fullName: payment.fullName,
        email: payment.email,
        currency: payment.currency,
        amount: payment.amount,
        donationType: payment.donationType || 'one-time',
        paymentMethod: 'M-Pesa',
        paymentReference: checkoutRequestId,
        message: payment.message || '',
        status: 'approved',
        createdAt: new Date().toISOString(),
      }

      database.donations = [...(database.donations || []), donationRecord]

      createActivity(
        database,
        'M-Pesa Payment Verified',
        `${payment.fullName} mock M-Pesa payment of ${payment.currency} ${payment.amount.toLocaleString(
          'en-US'
        )} was verified and recorded as a donation.`
      )

      createNotification(
        database,
        'Payment Receipt',
        payment.email,
        `Hello ${payment.fullName}, your payment of ${payment.currency} ${payment.amount.toLocaleString(
          'en-US'
        )} has been received. Thank you for supporting St Catherine House of Hope.`
      )
    }

    await writeDatabase(database)

    res.json({
      message: 'M-Pesa payment verification completed.',
      data: verification,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Failed to verify M-Pesa payment.',
    })
  }
}