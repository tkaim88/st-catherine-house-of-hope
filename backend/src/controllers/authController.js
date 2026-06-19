import fs from 'fs/promises'
import path from 'path'
import bcrypt from 'bcryptjs'

const databasePath = path.join(process.cwd(), '..', 'db.json')
const SALT_ROUNDS = 10

async function readDatabase() {
  const data = await fs.readFile(databasePath, 'utf-8')
  return JSON.parse(data)
}

async function writeDatabase(data) {
  await fs.writeFile(databasePath, JSON.stringify(data, null, 2))
}

function isHashedPassword(password) {
  return typeof password === 'string' && password.startsWith('$2')
}

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.',
      })
    }

    const database = await readDatabase()
    const admins = database.admins || []

    const adminUser = admins.find((admin) => admin.email === email)

    if (!adminUser) {
      return res.status(401).json({
        message: 'Invalid admin login details.',
      })
    }

    let passwordMatches = false

    if (isHashedPassword(adminUser.password)) {
      passwordMatches = await bcrypt.compare(password, adminUser.password)
    } else {
      passwordMatches = adminUser.password === password
    }

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid admin login details.',
      })
    }

    if (!isHashedPassword(adminUser.password)) {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

      database.admins = admins.map((admin) =>
        admin.email === email
          ? { ...admin, password: hashedPassword }
          : admin
      )

      await writeDatabase(database)
    }

    res.json({
      message: 'Login successful',
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
      },
      token: 'temporary-admin-token',
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to log in.',
    })
  }
}

export const changeAdminPassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body

    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Email, current password, and new password are required.',
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters long.',
      })
    }

    const database = await readDatabase()
    const admins = database.admins || []

    const adminUser = admins.find((admin) => admin.email === email)

    if (!adminUser) {
      return res.status(404).json({
        message: 'Admin account not found.',
      })
    }

    let currentPasswordMatches = false

    if (isHashedPassword(adminUser.password)) {
      currentPasswordMatches = await bcrypt.compare(
        currentPassword,
        adminUser.password
      )
    } else {
      currentPasswordMatches = adminUser.password === currentPassword
    }

    if (!currentPasswordMatches) {
      return res.status(401).json({
        message: 'Current password is incorrect.',
      })
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)

    database.admins = admins.map((admin) =>
      admin.email === email
        ? { ...admin, password: hashedNewPassword }
        : admin
    )

    await writeDatabase(database)

    res.json({
      message: 'Password changed successfully.',
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to change password.',
    })
  }
}

export const logoutAdmin = (req, res) => {
  res.json({
    message: 'Logout successful',
  })
}