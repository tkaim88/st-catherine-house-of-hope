import { pool } from '../config/database.js'

function formatPayment(row) {
  return {
    id: row.id,
    sponsorId: row.sponsor_id,
    sponsorName: row.sponsor_name,
    childId: row.child_id,
    childName: row.child_name,
    amount: Number(row.amount || 0),
    currency: row.currency,
    paymentMethod: row.payment_method,
    paymentReference: row.payment_reference,
    paymentDate: row.payment_date,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const getSponsorshipPayments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM sponsorship_payments
      ORDER BY created_at DESC
    `)

    res.json(result.rows.map(formatPayment))
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to load sponsorship payments.',
    })
  }
}

export const createSponsorshipPayment = async (req, res) => {
  try {
    const {
      sponsorId,
      sponsorName,
      childId,
      childName,
      amount,
      currency,
      paymentMethod,
      paymentReference,
      paymentDate,
      status,
      notes,
    } = req.body

    if (!sponsorId || !sponsorName || !childId || !childName || !amount) {
      return res.status(400).json({
        message: 'Sponsor, child, and payment amount are required.',
      })
    }

    const id = Date.now()

    const result = await pool.query(
      `
      INSERT INTO sponsorship_payments (
        id,
        sponsor_id,
        sponsor_name,
        child_id,
        child_name,
        amount,
        currency,
        payment_method,
        payment_reference,
        payment_date,
        status,
        notes
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
      )
      RETURNING *
      `,
      [
        id,
        Number(sponsorId),
        sponsorName,
        Number(childId),
        childName,
        Number(amount),
        currency || 'KSH',
        paymentMethod || 'Manual',
        paymentReference || '',
        paymentDate || new Date().toISOString(),
        status || 'paid',
        notes || '',
      ]
    )

    res.status(201).json({
      message: 'Sponsorship payment recorded successfully.',
      data: formatPayment(result.rows[0]),
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to record sponsorship payment.',
    })
  }
}

export const updateSponsorshipPayment = async (req, res) => {
  try {
    const paymentId = Number(req.params.id)

    const existingPaymentResult = await pool.query(
      `
      SELECT *
      FROM sponsorship_payments
      WHERE id = $1
      `,
      [paymentId]
    )

    if (existingPaymentResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Sponsorship payment not found.',
      })
    }

    const currentPayment = formatPayment(existingPaymentResult.rows[0])

    const updatedPayment = {
      sponsorId: req.body.sponsorId ?? currentPayment.sponsorId,
      sponsorName: req.body.sponsorName ?? currentPayment.sponsorName,
      childId: req.body.childId ?? currentPayment.childId,
      childName: req.body.childName ?? currentPayment.childName,
      amount:
        req.body.amount !== undefined
          ? Number(req.body.amount)
          : currentPayment.amount,
      currency: req.body.currency ?? currentPayment.currency,
      paymentMethod: req.body.paymentMethod ?? currentPayment.paymentMethod,
      paymentReference:
        req.body.paymentReference ?? currentPayment.paymentReference,
      paymentDate: req.body.paymentDate ?? currentPayment.paymentDate,
      status: req.body.status ?? currentPayment.status,
      notes: req.body.notes ?? currentPayment.notes,
    }

    const result = await pool.query(
      `
      UPDATE sponsorship_payments
      SET
        sponsor_id = $1,
        sponsor_name = $2,
        child_id = $3,
        child_name = $4,
        amount = $5,
        currency = $6,
        payment_method = $7,
        payment_reference = $8,
        payment_date = $9,
        status = $10,
        notes = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *
      `,
      [
        Number(updatedPayment.sponsorId),
        updatedPayment.sponsorName,
        Number(updatedPayment.childId),
        updatedPayment.childName,
        updatedPayment.amount,
        updatedPayment.currency,
        updatedPayment.paymentMethod,
        updatedPayment.paymentReference,
        updatedPayment.paymentDate,
        updatedPayment.status,
        updatedPayment.notes,
        paymentId,
      ]
    )

    res.json({
      message: 'Sponsorship payment updated successfully.',
      data: formatPayment(result.rows[0]),
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to update sponsorship payment.',
    })
  }
}

export const deleteSponsorshipPayment = async (req, res) => {
  try {
    const paymentId = Number(req.params.id)

    const result = await pool.query(
      `
      DELETE FROM sponsorship_payments
      WHERE id = $1
      RETURNING *
      `,
      [paymentId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Sponsorship payment not found.',
      })
    }

    res.json({
      message: 'Sponsorship payment deleted successfully.',
      data: formatPayment(result.rows[0]),
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to delete sponsorship payment.',
    })
  }
}