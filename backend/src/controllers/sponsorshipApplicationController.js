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

export const getSponsorshipApplications = async (req, res) => {
  try {
    const database = await readDatabase()
    res.json(database.sponsorshipApplications || [])
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

    const database = await readDatabase()

    const newApplication = {
      id: Date.now(),
      childId: Number(childId),
      childName,
      fullName,
      email,
      phone: phone || '',
      country: country || '',
      monthlyAmount: Number(monthlyAmount),
      currency: currency || 'KSH',
      message: message || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    database.sponsorshipApplications = [
      ...(database.sponsorshipApplications || []),
      newApplication,
    ]

    createActivity(
      database,
      'Sponsorship Application Submitted',
      `${fullName} applied to sponsor ${childName}.`
    )

    await writeDatabase(database)

    res.status(201).json({
      message: 'Sponsorship application submitted successfully.',
      data: newApplication,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to submit sponsorship application.' })
  }
}

export const approveSponsorshipApplication = async (req, res) => {
  try {
    const database = await readDatabase()
    const applicationId = Number(req.params.id)

    const applications = database.sponsorshipApplications || []
    const application = applications.find(
      (item) => Number(item.id) === applicationId
    )

    if (!application) {
      return res.status(404).json({ message: 'Sponsorship application not found.' })
    }

    if (application.status === 'approved') {
      return res.status(409).json({ message: 'Application is already approved.' })
    }

    const child = (database.children || []).find(
      (item) => Number(item.id) === Number(application.childId)
    )

    if (!child) {
      return res.status(404).json({ message: 'Child record not found.' })
    }

    if (child.sponsor && child.sponsor !== 'None') {
      return res.status(409).json({
        message: 'This child already has a sponsor.',
      })
    }

    const newSponsor = {
      id: Date.now(),
      fullName: application.fullName,
      email: application.email,
      phone: application.phone || '',
      country: application.country || '',
      profileImage: '',
      childId: Number(application.childId),
      childName: application.childName,
      currency: application.currency || 'KSH',
      monthlyAmount: Number(application.monthlyAmount),
      notes: application.message || '',
      status: 'Active',
      createdAt: new Date().toISOString(),
    }

    const sponsorshipRecord = {
      id: Date.now() + 1,
      childId: Number(application.childId),
      childName: application.childName,
      sponsorId: newSponsor.id,
      sponsorName: newSponsor.fullName,
      sponsorEmail: newSponsor.email,
      amount: Number(application.monthlyAmount),
      currency: application.currency || 'KSH',
      status: 'active',
      startDate: new Date().toISOString(),
    }

    database.sponsors = [...(database.sponsors || []), newSponsor]
    database.sponsorships = [
      ...(database.sponsorships || []),
      sponsorshipRecord,
    ]

    database.children = (database.children || []).map((item) =>
      Number(item.id) === Number(application.childId)
        ? {
            ...item,
            sponsor: newSponsor.fullName,
            sponsorId: newSponsor.id,
            updatedAt: new Date().toISOString(),
          }
        : item
    )

    database.sponsorshipApplications = applications.map((item) =>
      Number(item.id) === applicationId
        ? {
            ...item,
            status: 'approved',
            approvedAt: new Date().toISOString(),
            sponsorId: newSponsor.id,
          }
        : item
    )

    createActivity(
      database,
      'Sponsorship Application Approved',
      `${application.fullName} was approved to sponsor ${application.childName}.`
    )

    await writeDatabase(database)

    res.json({
      message: 'Sponsorship application approved successfully.',
      data: newSponsor,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to approve sponsorship application.' })
  }
}

export const rejectSponsorshipApplication = async (req, res) => {
  try {
    const database = await readDatabase()
    const applicationId = Number(req.params.id)

    const applications = database.sponsorshipApplications || []
    const application = applications.find(
      (item) => Number(item.id) === applicationId
    )

    if (!application) {
      return res.status(404).json({ message: 'Sponsorship application not found.' })
    }

    database.sponsorshipApplications = applications.map((item) =>
      Number(item.id) === applicationId
        ? {
            ...item,
            status: 'rejected',
            rejectedAt: new Date().toISOString(),
          }
        : item
    )

    createActivity(
      database,
      'Sponsorship Application Rejected',
      `${application.fullName} application to sponsor ${application.childName} was rejected.`
    )

    await writeDatabase(database)

    res.json({ message: 'Sponsorship application rejected successfully.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to reject sponsorship application.' })
  }
}

export const deleteSponsorshipApplication = async (req, res) => {
  try {
    const database = await readDatabase()
    const applicationId = Number(req.params.id)

    const application = (database.sponsorshipApplications || []).find(
      (item) => Number(item.id) === applicationId
    )

    if (!application) {
      return res.status(404).json({ message: 'Sponsorship application not found.' })
    }

    database.sponsorshipApplications = (
      database.sponsorshipApplications || []
    ).filter((item) => Number(item.id) !== applicationId)

    createActivity(
      database,
      'Sponsorship Application Deleted',
      `${application.fullName} application for ${application.childName} was deleted.`
    )

    await writeDatabase(database)

    res.json({ message: 'Sponsorship application deleted successfully.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to delete sponsorship application.' })
  }
}