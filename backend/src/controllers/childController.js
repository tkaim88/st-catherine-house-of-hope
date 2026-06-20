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

export const getChildren = async (req, res) => {
  try {
    const database = await readDatabase()
    res.json(database.children || [])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to load children.' })
  }
}

export const getChildById = async (req, res) => {
  try {
    const database = await readDatabase()
    const childId = Number(req.params.id)

    const child = (database.children || []).find(
      (item) => Number(item.id) === childId
    )

    if (!child) {
      return res.status(404).json({ message: 'Child not found.' })
    }

    res.json(child)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to load child.' })
  }
}

export const createChild = async (req, res) => {
  try {
    const database = await readDatabase()

    const newChild = {
      id: Date.now(),
      fullName: req.body.fullName,
      age: Number(req.body.age),
      gender: req.body.gender || 'Female',
      profileImage: req.body.profileImage || '',
      dateOfBirth: req.body.dateOfBirth || '',
      admissionDate: req.body.admissionDate || '',
      school: req.body.school || '',
      grade: req.body.grade || '',
      educationNotes: req.body.educationNotes || '',
      sponsor: req.body.sponsor || 'None',
      sponsorId: req.body.sponsorId || null,
      medicalNotes: req.body.medicalNotes || '',
      allergies: req.body.allergies || '',
      bloodType: req.body.bloodType || '',
      emergencyContact: req.body.emergencyContact || '',
      biography: req.body.biography || '',
      status: req.body.status || 'Active',
      createdAt: new Date().toISOString(),
    }

    if (!newChild.fullName || !newChild.age || !newChild.school || !newChild.grade) {
      return res.status(400).json({
        message: 'Full name, age, school, and grade are required.',
      })
    }

    database.children = [...(database.children || []), newChild]

    createActivity(
      database,
      'Child Record Created',
      `${newChild.fullName} was added to children records.`
    )

    await writeDatabase(database)

    res.status(201).json({
      message: 'Child record created successfully.',
      data: newChild,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to create child record.' })
  }
}

export const updateChild = async (req, res) => {
  try {
    const database = await readDatabase()
    const childId = Number(req.params.id)

    const children = database.children || []
    const childExists = children.some((child) => Number(child.id) === childId)

    if (!childExists) {
      return res.status(404).json({ message: 'Child not found.' })
    }

    database.children = children.map((child) =>
      Number(child.id) === childId
        ? {
            ...child,
            ...req.body,
            age:
              req.body.age !== undefined
                ? Number(req.body.age)
                : child.age,
            sponsor: req.body.sponsor || child.sponsor || 'None',
            updatedAt: new Date().toISOString(),
          }
        : child
    )

    const updatedChild = database.children.find(
      (child) => Number(child.id) === childId
    )

    createActivity(
      database,
      'Child Record Updated',
      `${updatedChild.fullName} record was updated.`
    )

    await writeDatabase(database)

    res.json({
      message: 'Child record updated successfully.',
      data: updatedChild,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to update child record.' })
  }
}

export const deleteChild = async (req, res) => {
  try {
    const database = await readDatabase()
    const childId = Number(req.params.id)

    const child = (database.children || []).find(
      (item) => Number(item.id) === childId
    )

    if (!child) {
      return res.status(404).json({ message: 'Child not found.' })
    }

    database.children = (database.children || []).filter(
      (item) => Number(item.id) !== childId
    )

    createActivity(
      database,
      'Child Record Deleted',
      `${child.fullName} was removed from children records.`
    )

    await writeDatabase(database)

    res.json({ message: 'Child record deleted successfully.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to delete child record.' })
  }
}