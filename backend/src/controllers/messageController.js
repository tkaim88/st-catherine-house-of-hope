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

export const getMessages = async (req, res) => {
  try {
    const database = await readDatabase()

    res.json(database.messages || [])
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to fetch messages',
    })
  }
}

export const createMessage = async (req, res) => {
  try {
    const database = await readDatabase()

    const newMessage = {
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone || '',
      subject: req.body.subject,
      message: req.body.message,
      status: 'unread',
      createdAt: new Date().toISOString(),
      id: Date.now(),
    }

    database.messages = [...(database.messages || []), newMessage]

    await writeDatabase(database)

    res.status(201).json({
      message: 'Message created successfully',
      data: newMessage,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to create message',
    })
  }
}

export const updateMessageStatus = async (req, res) => {
  try {
    const database = await readDatabase()
    const messageId = Number(req.params.id)
    const { status } = req.body

    const allowedStatuses = ['unread', 'read', 'archived']

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid message status',
      })
    }

    const messageExists = database.messages.some(
      (message) => Number(message.id) === messageId
    )

    if (!messageExists) {
      return res.status(404).json({
        message: 'Message not found',
      })
    }

    database.messages = database.messages.map((message) =>
      Number(message.id) === messageId ? { ...message, status } : message
    )

    await writeDatabase(database)

    const updatedMessage = database.messages.find(
      (message) => Number(message.id) === messageId
    )

    res.json({
      message: 'Message status updated successfully',
      data: updatedMessage,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to update message status',
    })
  }
}

export const deleteMessage = async (req, res) => {
  try {
    const database = await readDatabase()
    const messageId = Number(req.params.id)

    const messageExists = database.messages.some(
      (message) => Number(message.id) === messageId
    )

    if (!messageExists) {
      return res.status(404).json({
        message: 'Message not found',
      })
    }

    database.messages = database.messages.filter(
      (message) => Number(message.id) !== messageId
    )

    await writeDatabase(database)

    res.json({
      message: 'Message deleted successfully',
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to delete message',
    })
  }
}