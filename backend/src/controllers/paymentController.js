import { pool } from '../config/database.js'
import {
  initiateMockMpesaPayment,
  verifyMockMpesaPayment,
} from '../services/mpesaService.js'

function formatPayment(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phoneNumber: row.phone_number,
    amount: Number(row.amount || 0),
    currency: row.currency,
    paymentPurpose: row.payment_purpose,
    paymentProvider: row.payment_provider,
    paymentMode: row.payment_mode,
    paymentStatus: row.payment_status,
    relatedChildId: row.related_child_id,
    relatedChildName: row.related_child_name,
    sponsorId: row.sponsor_id,
    donorId: row.donor_id,
    donationType: row.donation_type,
    message: row.message,
    checkoutRequestId: row.checkout_request_id,
    merchantRequestId: row.merchant_request_id,
    verifiedAt: row.verified_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
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

    const mpesaResponse = await initiateMockMpesaPayment({
      phoneNumber,
      amount,
      accountReference: 'St Catherine House of Hope',
      transactionDescription: paymentPurpose || 'Donation',
    })

    const paymentResult = await pool.query(
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
        merchant_request_id
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18
      )
      RETURNING *
      `,
      [
        Date.now(),
        fullName,
        email,
        phoneNumber,
        Number(amount),
        currency || 'KSH',
        paymentPurpose || 'donation',
        'mpesa',
        'mock',
        'pending',
        relatedChildId || null,
        relatedChildName || '',
        sponsorId || null,
        donorId || null,
        donationType || 'one-time',
        message || '',
        mpesaResponse.checkoutRequestId,
        mpesaResponse.merchantRequestId,
      ]
    )

    const payment = paymentResult.rows[0]

    await pool.query(
      `
      INSERT INTO activities (
        id,
        action,
        details
      )
      VALUES ($1, $2, $3)
      `,
      [
        Date.now() + 1,
        'M-Pesa Payment Initiated',
        `${fullName} initiated a mock M-Pesa payment of ${
          currency || 'KSH'
        } ${Number(amount).toLocaleString('en-US')}.`,
      ]
    )

    await pool.query(
      `
      INSERT INTO notifications (
        id,
        type,
        recipient,
        message,
        status
      )
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        Date.now() + 2,
        'Payment Initiated',
        email,
        `Hello ${fullName}, your M-Pesa payment request has been initiated.`,
        'not sent',
      ]
    )

    res.status(201).json({
      message: 'M-Pesa payment initiated successfully.',
      data: {
        payment: formatPayment(payment),
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
  const client = await pool.connect()

  try {
    const { checkoutRequestId } = req.body

    if (!checkoutRequestId) {
      client.release()

      return res.status(400).json({
        message: 'Checkout request ID is required.',
      })
    }

    await client.query('BEGIN')

    const paymentResult = await client.query(
      `
      SELECT *
      FROM payments
      WHERE checkout_request_id = $1
      `,
      [checkoutRequestId]
    )

    const payment = paymentResult.rows[0]

    if (!payment) {
      await client.query('ROLLBACK')
      client.release()

      return res.status(404).json({
        message: 'Payment record not found.',
      })
    }

    const verification = await verifyMockMpesaPayment(checkoutRequestId)

    const updatedPaymentResult = await client.query(
      `
      UPDATE payments
      SET payment_status = $1,
          verified_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE checkout_request_id = $2
      RETURNING *
      `,
      [verification.status, checkoutRequestId]
    )

    if (verification.status === 'paid') {
      await client.query(
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
          status
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT (id) DO NOTHING
        `,
        [
          Date.now() + 1,
          payment.full_name,
          payment.email,
          payment.currency,
          Number(payment.amount),
          payment.donation_type || 'one-time',
          'M-Pesa',
          checkoutRequestId,
          payment.message || '',
          'approved',
        ]
      )

      await client.query(
        `
        INSERT INTO activities (
          id,
          action,
          details
        )
        VALUES ($1, $2, $3)
        `,
        [
          Date.now() + 2,
          'M-Pesa Payment Verified',
          `${payment.full_name} mock M-Pesa payment of ${
            payment.currency
          } ${Number(payment.amount).toLocaleString(
            'en-US'
          )} was verified and recorded as a donation.`,
        ]
      )

      await client.query(
        `
        INSERT INTO notifications (
          id,
          type,
          recipient,
          message,
          status
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          Date.now() + 3,
          'Payment Receipt',
          payment.email,
          `Hello ${payment.full_name}, your payment of ${
            payment.currency
          } ${Number(payment.amount).toLocaleString(
            'en-US'
          )} has been received. Thank you for supporting St Catherine House of Hope.`,
          'not sent',
        ]
      )
    }

    await client.query('COMMIT')

    res.json({
      message: 'M-Pesa payment verification completed.',
      data: {
        ...verification,
        payment: formatPayment(updatedPaymentResult.rows[0]),
      },
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error(error)

    res.status(500).json({
      message: 'Failed to verify M-Pesa payment.',
    })
  } finally {
    client.release()
  }
}