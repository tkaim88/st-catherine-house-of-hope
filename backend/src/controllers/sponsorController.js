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

export const getSponsors = async (req, res) => {
  try {
    const database = await readDatabase()

    res.json(database.sponsors || [])
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to load sponsors.',
    })
  }
}

export const createSponsor = async (req, res) => {
  try {
    const database = await readDatabase()
    const children = database.children || []
    const sponsors = database.sponsors || []

    const {
      fullName,
      email,
      phone,
      country,
      profileImage,
      childId,
      currency,
      monthlyAmount,
      notes,
      status,
    } = req.body

    if (!fullName || !email || !monthlyAmount) {
      return res.status(400).json({
        message: 'Full name, email, and monthly amount are required.',
      })
    }

    let selectedChild = null

    if (childId) {
      selectedChild = children.find(
        (child) => Number(child.id) === Number(childId)
      )

      if (!selectedChild) {
        return res.status(404).json({
          message: 'Selected child was not found.',
        })
      }

      if (selectedChild.sponsor && selectedChild.sponsor !== 'None') {
        return res.status(409).json({
          message: 'This child already has a sponsor.',
        })
      }
    }

    const newSponsor = {
      id: Date.now(),
      fullName,
      email,
      phone: phone || '',
      country: country || '',
      profileImage: profileImage || '',
      childId: selectedChild ? Number(selectedChild.id) : null,
      childName: selectedChild ? selectedChild.fullName : 'Unassigned',
      currency: currency || 'KSH',
      monthlyAmount: Number(monthlyAmount),
      notes: notes || '',
      status: status || 'Active',
      createdAt: new Date().toISOString(),
    }

    database.sponsors = [...sponsors, newSponsor]

    if (selectedChild) {
      const sponsorshipRecord = {
        id: Date.now() + 1,
        childId: Number(selectedChild.id),
        childName: selectedChild.fullName,
        sponsorId: newSponsor.id,
        sponsorName: newSponsor.fullName,
        sponsorEmail: newSponsor.email,
        amount: Number(monthlyAmount),
        currency: currency || 'KSH',
        status: 'active',
        startDate: new Date().toISOString(),
      }

      database.sponsorships = [
        ...(database.sponsorships || []),
        sponsorshipRecord,
      ]

      database.children = children.map((child) =>
        Number(child.id) === Number(selectedChild.id)
          ? {
              ...child,
              sponsor: newSponsor.fullName,
              sponsorId: newSponsor.id,
            }
          : child
      )

      createActivity(
        database,
        'Sponsorship Created',
        `${newSponsor.fullName} was assigned to sponsor ${selectedChild.fullName}.`
      )
    } else {
      createActivity(
        database,
        'Sponsor Created',
        `${newSponsor.fullName} was added as a sponsor.`
      )
    }

    await writeDatabase(database)

    res.status(201).json({
      message: 'Sponsor created successfully.',
      data: newSponsor,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to create sponsor.',
    })
  }
}

export const updateSponsor = async (req, res) => {
  try {
    const database = await readDatabase()
    const sponsorId = Number(req.params.id)

    const sponsors = database.sponsors || []
    const sponsor = sponsors.find((item) => Number(item.id) === sponsorId)

    if (!sponsor) {
      return res.status(404).json({
        message: 'Sponsor not found.',
      })
    }

    database.sponsors = sponsors.map((item) =>
      Number(item.id) === sponsorId
        ? {
            ...item,
            ...req.body,
            monthlyAmount:
              req.body.monthlyAmount !== undefined
                ? Number(req.body.monthlyAmount)
                : item.monthlyAmount,
            updatedAt: new Date().toISOString(),
          }
        : item
    )

    const updatedSponsor = database.sponsors.find(
      (item) => Number(item.id) === sponsorId
    )

    createActivity(
      database,
      'Sponsor Updated',
      `${updatedSponsor.fullName} sponsor profile was updated.`
    )

    await writeDatabase(database)

    res.json({
      message: 'Sponsor updated successfully.',
      data: updatedSponsor,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to update sponsor.',
    })
  }
}

export const assignSponsorToChild = async (req, res) => {
  try {
    const database = await readDatabase()
    const sponsorId = Number(req.params.id)
    const childId = Number(req.body.childId)

    const sponsors = database.sponsors || []
    const children = database.children || []

    const sponsor = sponsors.find((item) => Number(item.id) === sponsorId)
    const child = children.find((item) => Number(item.id) === childId)

    if (!sponsor) {
      return res.status(404).json({
        message: 'Sponsor not found.',
      })
    }

    if (!child) {
      return res.status(404).json({
        message: 'Child not found.',
      })
    }

    if (child.sponsor && child.sponsor !== 'None') {
      return res.status(409).json({
        message: 'This child already has a sponsor.',
      })
    }

    database.sponsors = sponsors.map((item) =>
      Number(item.id) === sponsorId
        ? {
            ...item,
            childId: Number(child.id),
            childName: child.fullName,
            updatedAt: new Date().toISOString(),
          }
        : item
    )

    database.children = children.map((item) =>
      Number(item.id) === childId
        ? {
            ...item,
            sponsor: sponsor.fullName,
            sponsorId: sponsor.id,
            updatedAt: new Date().toISOString(),
          }
        : item
    )

    const sponsorshipRecord = {
      id: Date.now(),
      childId: Number(child.id),
      childName: child.fullName,
      sponsorId: sponsor.id,
      sponsorName: sponsor.fullName,
      sponsorEmail: sponsor.email,
      amount: Number(sponsor.monthlyAmount),
      currency: sponsor.currency,
      status: 'active',
      startDate: new Date().toISOString(),
    }

    database.sponsorships = [...(database.sponsorships || []), sponsorshipRecord]

    createActivity(
      database,
      'Sponsor Assigned',
      `${sponsor.fullName} was assigned to sponsor ${child.fullName}.`
    )

    await writeDatabase(database)

    res.json({
      message: 'Sponsor assigned to child successfully.',
      data: sponsorshipRecord,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to assign sponsor.',
    })
  }
}

export const deleteSponsor = async (req, res) => {
  try {
    const database = await readDatabase()
    const sponsorId = Number(req.params.id)

    const sponsors = database.sponsors || []
    const sponsor = sponsors.find((item) => Number(item.id) === sponsorId)

    if (!sponsor) {
      return res.status(404).json({
        message: 'Sponsor not found.',
      })
    }

    database.sponsors = sponsors.filter((item) => Number(item.id) !== sponsorId)

    database.children = (database.children || []).map((child) =>
      Number(child.sponsorId) === sponsorId || child.sponsor === sponsor.fullName
        ? {
            ...child,
            sponsor: 'None',
            sponsorId: null,
            updatedAt: new Date().toISOString(),
          }
        : child
    )

    database.sponsorships = (database.sponsorships || []).map((record) =>
      Number(record.sponsorId) === sponsorId && record.status === 'active'
        ? {
            ...record,
            status: 'ended',
            endDate: new Date().toISOString(),
          }
        : record
    )

    createActivity(
      database,
      'Sponsor Deleted',
      `${sponsor.fullName} sponsor profile was deleted.`
    )

    await writeDatabase(database)

    res.json({
      message: 'Sponsor deleted successfully.',
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to delete sponsor.',
    })
  }
}