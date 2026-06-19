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

export const getVolunteers = async (req, res) => {
  try {
    const database = await readDatabase()

    res.json(database.volunteers || [])
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to fetch volunteers',
    })
  }
}

export const createVolunteer = async (req, res) => {
  try {
    const database = await readDatabase()

    const newVolunteer = {
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      skills: req.body.skills,
      message: req.body.message,
      status: 'pending',
      createdAt: new Date().toISOString(),
      id: Date.now(),
    }

    database.volunteers = [...(database.volunteers || []), newVolunteer]

    await writeDatabase(database)

    res.status(201).json({
      message: 'Volunteer created successfully',
      data: newVolunteer,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to create volunteer',
    })
  }
}

export const updateVolunteerStatus = async (req, res) => {
  try {
    const database = await readDatabase()
    const volunteerId = Number(req.params.id)
    const { status } = req.body

    const allowedStatuses = ['pending', 'approved', 'rejected']

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid volunteer status',
      })
    }

    const volunteerExists = database.volunteers.some(
      (volunteer) => Number(volunteer.id) === volunteerId
    )

    if (!volunteerExists) {
      return res.status(404).json({
        message: 'Volunteer not found',
      })
    }

    database.volunteers = database.volunteers.map((volunteer) =>
      Number(volunteer.id) === volunteerId
        ? { ...volunteer, status }
        : volunteer
    )

    await writeDatabase(database)

    const updatedVolunteer = database.volunteers.find(
      (volunteer) => Number(volunteer.id) === volunteerId
    )

    res.json({
      message: 'Volunteer status updated successfully',
      data: updatedVolunteer,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to update volunteer status',
    })
  }
}

export const deleteVolunteer = async (req, res) => {
  try {
    const database = await readDatabase()
    const volunteerId = Number(req.params.id)

    const volunteerExists = database.volunteers.some(
      (volunteer) => Number(volunteer.id) === volunteerId
    )

    if (!volunteerExists) {
      return res.status(404).json({
        message: 'Volunteer not found',
      })
    }

    database.volunteers = database.volunteers.filter(
      (volunteer) => Number(volunteer.id) !== volunteerId
    )

    await writeDatabase(database)

    res.json({
      message: 'Volunteer deleted successfully',
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to delete volunteer',
    })
  }
}