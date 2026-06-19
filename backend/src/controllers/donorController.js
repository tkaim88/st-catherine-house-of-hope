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

export const getDonors = async (req, res) => {
  try {
    const database = await readDatabase()

    res.json(database.donors || [])
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to fetch donors.',
    })
  }
}

export const createDonor = async (req, res) => {
  try {
    const database = await readDatabase()

    const newDonor = {
      id: Date.now(),
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone || '',
      country: req.body.country || '',
      profileImage: req.body.profileImage || '',
      preferredCurrency: req.body.preferredCurrency || 'KSH',
      donorType: req.body.donorType || 'individual',
      notes: req.body.notes || '',
      status: req.body.status || 'active',
      createdAt: new Date().toISOString(),
    }

    database.donors = [...(database.donors || []), newDonor]

    createActivity(
      database,
      'Donor Created',
      `${newDonor.fullName} was added as a donor.`
    )

    await writeDatabase(database)

    res.status(201).json({
      message: 'Donor created successfully.',
      data: newDonor,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to create donor.',
    })
  }
}

export const updateDonor = async (req, res) => {
  try {
    const database = await readDatabase()
    const donorId = Number(req.params.id)

    const donorExists = (database.donors || []).some(
      (donor) => Number(donor.id) === donorId
    )

    if (!donorExists) {
      return res.status(404).json({
        message: 'Donor not found.',
      })
    }

    database.donors = database.donors.map((donor) =>
      Number(donor.id) === donorId
        ? {
            ...donor,
            ...req.body,
            updatedAt: new Date().toISOString(),
          }
        : donor
    )

    const updatedDonor = database.donors.find(
      (donor) => Number(donor.id) === donorId
    )

    createActivity(
      database,
      'Donor Updated',
      `${updatedDonor.fullName} donor profile was updated.`
    )

    await writeDatabase(database)

    res.json({
      message: 'Donor updated successfully.',
      data: updatedDonor,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to update donor.',
    })
  }
}

export const deleteDonor = async (req, res) => {
  try {
    const database = await readDatabase()
    const donorId = Number(req.params.id)

    const donor = (database.donors || []).find(
      (item) => Number(item.id) === donorId
    )

    if (!donor) {
      return res.status(404).json({
        message: 'Donor not found.',
      })
    }

    database.donors = database.donors.filter(
      (item) => Number(item.id) !== donorId
    )

    createActivity(
      database,
      'Donor Deleted',
      `${donor.fullName} donor profile was deleted.`
    )

    await writeDatabase(database)

    res.json({
      message: 'Donor deleted successfully.',
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to delete donor.',
    })
  }
}