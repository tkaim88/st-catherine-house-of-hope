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

export const getNotifications = async (req, res) => {
  try {
    const database = await readDatabase()
    res.json(database.notifications || [])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to load notifications.' })
  }
}

export const createNotification = async (req, res) => {
  try {
    const database = await readDatabase()

    const newNotification = {
      id: Date.now(),
      type: req.body.type || 'General Notification',
      recipient: req.body.recipient || '',
      message: req.body.message || '',
      status: req.body.status || 'not sent',
      createdAt: new Date().toISOString(),
    }

    database.notifications = [
      ...(database.notifications || []),
      newNotification,
    ]

    await writeDatabase(database)

    res.status(201).json({
      message: 'Notification created successfully.',
      data: newNotification,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to create notification.' })
  }
}

export const updateNotification = async (req, res) => {
  try {
    const database = await readDatabase()
    const notificationId = Number(req.params.id)

    const notificationExists = (database.notifications || []).some(
      (notification) => Number(notification.id) === notificationId
    )

    if (!notificationExists) {
      return res.status(404).json({ message: 'Notification not found.' })
    }

    database.notifications = (database.notifications || []).map(
      (notification) =>
        Number(notification.id) === notificationId
          ? {
              ...notification,
              ...req.body,
              updatedAt: new Date().toISOString(),
            }
          : notification
    )

    const updatedNotification = database.notifications.find(
      (notification) => Number(notification.id) === notificationId
    )

    await writeDatabase(database)

    res.json({
      message: 'Notification updated successfully.',
      data: updatedNotification,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to update notification.' })
  }
}

export const deleteNotification = async (req, res) => {
  try {
    const database = await readDatabase()
    const notificationId = Number(req.params.id)

    const notification = (database.notifications || []).find(
      (item) => Number(item.id) === notificationId
    )

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' })
    }

    database.notifications = (database.notifications || []).filter(
      (item) => Number(item.id) !== notificationId
    )

    await writeDatabase(database)

    res.json({ message: 'Notification deleted successfully.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to delete notification.' })
  }
}