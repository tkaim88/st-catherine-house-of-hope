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

function removePasswords(admins) {
  return admins.map((admin) => {
    const { password, ...safeAdmin } = admin
    return safeAdmin
  })
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

export const getAdminUsers = async (req, res) => {
  try {
    const database = await readDatabase()
    const admins = database.admins || []

    res.json(removePasswords(admins))
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to load admin users.',
    })
  }
}

export const createAdminUser = async (req, res) => {
  try {
    const { email, password, role } = req.body

    if (!email || !password || !role) {
      return res.status(400).json({
        message: 'Email, password, and role are required.',
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long.',
      })
    }

    const allowedRoles = ['super-admin', 'admin', 'staff', 'finance']

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: 'Invalid admin role.',
      })
    }

    const database = await readDatabase()
    const admins = database.admins || []

    const adminExists = admins.some((admin) => admin.email === email)

    if (adminExists) {
      return res.status(409).json({
        message: 'An admin with this email already exists.',
      })
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const newAdmin = {
      id: Date.now(),
      email,
      password: hashedPassword,
      role,
      status: 'active',
      createdAt: new Date().toISOString(),
    }

    database.admins = [...admins, newAdmin]

    createActivity(
      database,
      'Admin User Created',
      `${email} was created with the ${role} role.`
    )

    await writeDatabase(database)

    const { password: _, ...safeAdmin } = newAdmin

    res.status(201).json({
      message: 'Admin user created successfully.',
      data: safeAdmin,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to create admin user.',
    })
  }
}

export const updateAdminUserRole = async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body

    const allowedRoles = ['super-admin', 'admin', 'staff', 'finance']

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: 'Invalid admin role.',
      })
    }

    const database = await readDatabase()
    const admins = database.admins || []

    const targetAdmin = admins.find(
      (admin) => Number(admin.id) === Number(id)
    )

    if (!targetAdmin) {
      return res.status(404).json({
        message: 'Admin user not found.',
      })
    }

    database.admins = admins.map((admin) =>
      Number(admin.id) === Number(id) ? { ...admin, role } : admin
    )

    createActivity(
      database,
      'Admin Role Updated',
      `${targetAdmin.email} role was changed from ${targetAdmin.role} to ${role}.`
    )

    await writeDatabase(database)

    res.json({
      message: 'Admin role updated successfully.',
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to update admin role.',
    })
  }
}

export const resetAdminUserPassword = async (req, res) => {
  try {
    const { id } = req.params
    const { newPassword } = req.body

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters long.',
      })
    }

    const database = await readDatabase()
    const admins = database.admins || []

    const targetAdmin = admins.find(
      (admin) => Number(admin.id) === Number(id)
    )

    if (!targetAdmin) {
      return res.status(404).json({
        message: 'Admin user not found.',
      })
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)

    database.admins = admins.map((admin) =>
      Number(admin.id) === Number(id)
        ? { ...admin, password: hashedPassword }
        : admin
    )

    createActivity(
      database,
      'Admin Password Reset',
      `${targetAdmin.email} password was reset by a super admin.`
    )

    await writeDatabase(database)

    res.json({
      message: 'Admin password reset successfully.',
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to reset admin password.',
    })
  }
}

export const deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params

    const database = await readDatabase()
    const admins = database.admins || []

    const targetAdmin = admins.find(
      (admin) => Number(admin.id) === Number(id)
    )

    if (!targetAdmin) {
      return res.status(404).json({
        message: 'Admin user not found.',
      })
    }

    database.admins = admins.filter(
      (admin) => Number(admin.id) !== Number(id)
    )

    createActivity(
      database,
      'Admin User Deleted',
      `${targetAdmin.email} admin account was deleted.`
    )

    await writeDatabase(database)

    res.json({
      message: 'Admin user deleted successfully.',
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to delete admin user.',
    })
  }
}