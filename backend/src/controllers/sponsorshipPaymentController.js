import fs from 'fs/promises'
import path from 'path'

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

export const getSponsorshipPayments = async (req, res) => {
  try {
    const database = await readDatabase()

    res.json(database.sponsorshipPayments || [])
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to load sponsorship payments.',
    })
  }
}

export const createSponsorshipPayment = async (req, res) => {
  try {
    const database = await readDatabase()

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
        message:
          'Sponsor, child, and payment amount are required.',
      })
    }

    const newPayment = {
      id: Date.now(),
      sponsorId: Number(sponsorId),
      sponsorName,
      childId: Number(childId),
      childName,
      amount: Number(amount),
      currency: currency || 'KSH',
      paymentMethod: paymentMethod || 'Manual',
      paymentReference: paymentReference || '',
      paymentDate: paymentDate || new Date().toISOString(),
      status: status || 'paid',
      notes: notes || '',
      createdAt: new Date().toISOString(),
    }

    database.sponsorshipPayments = [
      ...(database.sponsorshipPayments || []),
      newPayment,
    ]

    createActivity(
      database,
      'Sponsorship Payment Recorded',
      `${sponsorName} payment of ${newPayment.currency} ${Number(
        newPayment.amount
      ).toLocaleString('en-US')} for ${childName} was recorded as ${
        newPayment.status
      }.`
    )

    await writeDatabase(database)

    res.status(201).json({
      message: 'Sponsorship payment recorded successfully.',
      data: newPayment,
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
    const database = await readDatabase()
    const paymentId = Number(req.params.id)

    const payments = database.sponsorshipPayments || []

    const paymentExists = payments.some(
      (payment) => Number(payment.id) === paymentId
    )

    if (!paymentExists) {
      return res.status(404).json({
        message: 'Sponsorship payment not found.',
      })
    }

    database.sponsorshipPayments = payments.map((payment) =>
      Number(payment.id) === paymentId
        ? {
            ...payment,
            ...req.body,
            amount:
              req.body.amount !== undefined
                ? Number(req.body.amount)
                : payment.amount,
            updatedAt: new Date().toISOString(),
          }
        : payment
    )

    const updatedPayment = database.sponsorshipPayments.find(
      (payment) => Number(payment.id) === paymentId
    )

    createActivity(
      database,
      'Sponsorship Payment Updated',
      `${updatedPayment.sponsorName} payment record for ${updatedPayment.childName} was updated.`
    )

    await writeDatabase(database)

    res.json({
      message: 'Sponsorship payment updated successfully.',
      data: updatedPayment,
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
    const database = await readDatabase()
    const paymentId = Number(req.params.id)

    const payments = database.sponsorshipPayments || []

    const payment = payments.find(
      (item) => Number(item.id) === paymentId
    )

    if (!payment) {
      return res.status(404).json({
        message: 'Sponsorship payment not found.',
      })
    }

    database.sponsorshipPayments = payments.filter(
      (item) => Number(item.id) !== paymentId
    )

    createActivity(
      database,
      'Sponsorship Payment Deleted',
      `${payment.sponsorName} payment record for ${payment.childName} was deleted.`
    )

    await writeDatabase(database)

    res.json({
      message: 'Sponsorship payment deleted successfully.',
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to delete sponsorship payment.',
    })
  }
}