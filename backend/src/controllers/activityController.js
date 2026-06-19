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

export const getActivities = async (req, res) => {
  try {
    const database = await readDatabase()

    res.json(database.activities || [])
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to load activities',
    })
  }
}

export const createActivity = async (req, res) => {
  try {
    const database = await readDatabase()

    const newActivity = {
      id: Date.now(),
      action: req.body.action || req.body.title || 'Activity',
      details: req.body.details || req.body.description || '',
      createdAt: new Date().toISOString(),
    }

    database.activities = [...(database.activities || []), newActivity]

    await writeDatabase(database)

    res.status(201).json(newActivity)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to create activity',
    })
  }
}