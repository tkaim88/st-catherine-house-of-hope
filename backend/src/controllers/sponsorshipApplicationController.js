import { pool } from '../config/database.js'

function formatApplication(row) {
  return {
    id: row.id,
    childId: row.child_id,
    childName: row.child_name,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    country: row.country,
    monthlyAmount: Number(row.monthly_amount || 0),
    currency: row.currency,
    message: row.message,
    status: row.status,
    sponsorId: row.sponsor_id,
    approvedAt: row.approved_at,
    rejectedAt: row.rejected_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function createActivity(action, details) {
  await pool.query(
    `
    INSERT INTO activities (
      id,
      action,
      details
    )
    VALUES ($1, $2, $3)
    `,
    [Date.now(), action, details]
  )
}

export const getSponsorshipApplications = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM sponsorship_applications
      ORDER BY created_at DESC
    `)

    res.json(result.rows.map(formatApplication))
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to load sponsorship applications.' })
  }
}

export const createSponsorshipApplication = async (req, res) => {
  try {
    const {
      childId,
      childName,
      fullName,
      email,
      phone,
      country,
      monthlyAmount,
      currency,
      message,
    } = req.body

    if (!childId || !childName || !fullName || !email || !monthlyAmount) {
      return res.status(400).json({
        message:
          'Child, sponsor name, sponsor email, and monthly amount are required.',
      })
    }

    const result = await pool.query(
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
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
      `,
      [
        Date.now(),
        Number(childId),
        childName,
        fullName,
        email,
        phone || '',
        country || '',
        Number(monthlyAmount),
        currency || 'KSH',
        message || '',
        'pending',
      ]
    )

    await createActivity(
      'Sponsorship Application Submitted',
      `${fullName} applied to sponsor ${childName}.`
    )

    res.status(201).json({
      message: 'Sponsorship application submitted successfully.',
      data: formatApplication(result.rows[0]),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to submit sponsorship application.' })
  }
}

export const approveSponsorshipApplication = async (req, res) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const applicationId = Number(req.params.id)

    const applicationResult = await client.query(
      `
      SELECT *
      FROM sponsorship_applications
      WHERE id = $1
      `,
      [applicationId]
    )

    const application = applicationResult.rows[0]

    if (!application) {
      await client.query('ROLLBACK')
      return res.status(404).json({
        message: 'Sponsorship application not found.',
      })
    }

    if (application.status === 'approved') {
      await client.query('ROLLBACK')
      return res.status(409).json({
        message: 'Application is already approved.',
      })
    }

    const childResult = await client.query(
      `
      SELECT *
      FROM children
      WHERE id = $1
      `,
      [application.child_id]
    )

    const child = childResult.rows[0]

    if (!child) {
      await client.query('ROLLBACK')
      return res.status(404).json({
        message: 'Child record not found.',
      })
    }

    if (child.sponsor && child.sponsor !== 'None') {
      await client.query('ROLLBACK')
      return res.status(409).json({
        message: 'This child already has a sponsor.',
      })
    }

    const sponsorId = Date.now()

    const sponsorResult = await client.query(
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
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
      `,
      [
        sponsorId,
        application.full_name,
        application.email,
        application.phone || '',
        application.country || '',
        '',
        Number(application.child_id),
        application.child_name,
        application.currency || 'KSH',
        Number(application.monthly_amount),
        application.message || '',
        'Active',
      ]
    )

    await client.query(
      `
      UPDATE children
      SET sponsor = $1,
          sponsor_id = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      `,
      [application.full_name, sponsorId, application.child_id]
    )

    const updatedApplication = await client.query(
      `
      UPDATE sponsorship_applications
      SET status = 'approved',
          approved_at = CURRENT_TIMESTAMP,
          sponsor_id = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [sponsorId, applicationId]
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
        Date.now() + 1,
        'Sponsorship Application Approved',
        `${application.full_name} was approved to sponsor ${application.child_name}.`,
      ]
    )

    await client.query('COMMIT')

    res.json({
      message: 'Sponsorship application approved successfully.',
      data: {
        application: formatApplication(updatedApplication.rows[0]),
        sponsor: sponsorResult.rows[0],
      },
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error(error)
    res.status(500).json({ message: 'Failed to approve sponsorship application.' })
  } finally {
    client.release()
  }
}

export const rejectSponsorshipApplication = async (req, res) => {
  try {
    const applicationId = Number(req.params.id)

    const applicationResult = await pool.query(
      `
      SELECT *
      FROM sponsorship_applications
      WHERE id = $1
      `,
      [applicationId]
    )

    const application = applicationResult.rows[0]

    if (!application) {
      return res.status(404).json({
        message: 'Sponsorship application not found.',
      })
    }

    const result = await pool.query(
      `
      UPDATE sponsorship_applications
      SET status = 'rejected',
          rejected_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
      `,
      [applicationId]
    )

    await createActivity(
      'Sponsorship Application Rejected',
      `${application.full_name} application to sponsor ${application.child_name} was rejected.`
    )

    res.json({
      message: 'Sponsorship application rejected successfully.',
      data: formatApplication(result.rows[0]),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to reject sponsorship application.' })
  }
}

export const deleteSponsorshipApplication = async (req, res) => {
  try {
    const applicationId = Number(req.params.id)

    const result = await pool.query(
      `
      DELETE FROM sponsorship_applications
      WHERE id = $1
      RETURNING *
      `,
      [applicationId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Sponsorship application not found.',
      })
    }

    const deletedApplication = result.rows[0]

    await createActivity(
      'Sponsorship Application Deleted',
      `${deletedApplication.full_name} application for ${deletedApplication.child_name} was deleted.`
    )

    res.json({
      message: 'Sponsorship application deleted successfully.',
      data: formatApplication(deletedApplication),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to delete sponsorship application.' })
  }
}