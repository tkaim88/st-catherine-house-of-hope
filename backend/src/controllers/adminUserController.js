import bcrypt from 'bcryptjs'
import { pool } from '../config/database.js'
import { logActivity } from '../utils/activityLogger.js'

const SALT_ROUNDS = 10
const allowedRoles = ['super-admin', 'admin', 'staff', 'finance']

function formatAdmin(admin) {
  return {
    id: admin.id,
    fullName: admin.full_name,
    email: admin.email,
    role: admin.role,
    status: admin.status,
    createdAt: admin.created_at,
    updatedAt: admin.updated_at,
  }
}

async function getSuperAdminCount() {
  const result = await pool.query(
    `
    SELECT COUNT(*) AS count
    FROM admin_users
    WHERE role = 'super-admin'
      AND status = 'active'
    `
  )

  return Number(result.rows[0].count)
}

export const getAdminUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, full_name, email, role, status, created_at, updated_at
      FROM admin_users
      ORDER BY created_at DESC
      `
    )

    res.json(result.rows.map(formatAdmin))
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to load admin users.',
    })
  }
}

export const createAdminUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body

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

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: 'Invalid admin role.',
      })
    }

    const existingAdmin = await pool.query(
      'SELECT id FROM admin_users WHERE email = $1',
      [email]
    )

    if (existingAdmin.rows.length > 0) {
      return res.status(409).json({
        message: 'An admin with this email already exists.',
      })
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    const id = Date.now()

    const result = await pool.query(
      `
      INSERT INTO admin_users (
        id,
        full_name,
        email,
        password_hash,
        role,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, full_name, email, role, status, created_at, updated_at
      `,
      [id, fullName || '', email, hashedPassword, role, 'active']
    )

    await logActivity({
      action: 'Admin User Created',
      details: `${email} was created with the ${role} role.`,
      actor: req.admin,
      module: 'Admin Users',
      entityType: 'admin_user',
      entityId: result.rows[0].id,
      newValue: result.rows[0],
      ipAddress: req.ip,
    })

    res.status(201).json({
      message: 'Admin user created successfully.',
      data: formatAdmin(result.rows[0]),
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
    const loggedInAdminId = String(req.admin?.id || '')

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: 'Invalid admin role.',
      })
    }

    const existingAdminResult = await pool.query(
      `
      SELECT *
      FROM admin_users
      WHERE id = $1
      `,
      [id]
    )

    const existingAdmin = existingAdminResult.rows[0]

    if (!existingAdmin) {
      return res.status(404).json({
        message: 'Admin user not found.',
      })
    }

    if (
      String(existingAdmin.id) === loggedInAdminId &&
      existingAdmin.role === 'super-admin' &&
      role !== 'super-admin'
    ) {
      return res.status(409).json({
        message: 'You cannot demote your own Super Admin account.',
      })
    }

    const superAdminCount = await getSuperAdminCount()

    if (
      existingAdmin.role === 'super-admin' &&
      role !== 'super-admin' &&
      superAdminCount <= 1
    ) {
      return res.status(409).json({
        message: 'The last Super Admin cannot be demoted.',
      })
    }

    const result = await pool.query(
      `
      UPDATE admin_users
      SET role = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, full_name, email, role, status, created_at, updated_at
      `,
      [role, id]
    )

    await logActivity({
      action: 'Admin Role Updated',
      details: `${existingAdmin.email} role was changed from ${existingAdmin.role} to ${role}.`,
      actor: req.admin,
      module: 'Admin Users',
      entityType: 'admin_user',
      entityId: existingAdmin.id,
      oldValue: { role: existingAdmin.role },
      newValue: { role },
      ipAddress: req.ip,
    })

    res.json({
      message: 'Admin role updated successfully.',
      data: formatAdmin(result.rows[0]),
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

    const existingAdminResult = await pool.query(
      `
      SELECT *
      FROM admin_users
      WHERE id = $1
      `,
      [id]
    )

    const existingAdmin = existingAdminResult.rows[0]

    if (!existingAdmin) {
      return res.status(404).json({
        message: 'Admin user not found.',
      })
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)

    const result = await pool.query(
      `
      UPDATE admin_users
      SET password_hash = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, full_name, email, role, status, created_at, updated_at
      `,
      [hashedPassword, id]
    )

    await logActivity({
      action: 'Admin Password Reset',
      details: `${existingAdmin.email} password was reset.`,
      actor: req.admin,
      module: 'Admin Users',
      entityType: 'admin_user',
      entityId: existingAdmin.id,
      oldValue: { passwordChanged: false },
      newValue: { passwordChanged: true },
      ipAddress: req.ip,
    })

    res.json({
      message: 'Admin password reset successfully.',
      data: formatAdmin(result.rows[0]),
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
    const loggedInAdminId = String(req.admin?.id || '')

    const existingAdminResult = await pool.query(
      `
      SELECT *
      FROM admin_users
      WHERE id = $1
      `,
      [id]
    )

    const existingAdmin = existingAdminResult.rows[0]

    if (!existingAdmin) {
      return res.status(404).json({
        message: 'Admin user not found.',
      })
    }

    if (String(existingAdmin.id) === loggedInAdminId) {
      return res.status(409).json({
        message: 'You cannot delete your own admin account.',
      })
    }

    const superAdminCount = await getSuperAdminCount()

    if (
      existingAdmin.role === 'super-admin' &&
      superAdminCount <= 1
    ) {
      return res.status(409).json({
        message: 'The last Super Admin cannot be deleted.',
      })
    }

    const result = await pool.query(
      `
      DELETE FROM admin_users
      WHERE id = $1
      RETURNING id, full_name, email, role, status, created_at, updated_at
      `,
      [id]
    )

    await logActivity({
      action: 'Admin User Deleted',
      details: `${existingAdmin.email} admin account was deleted.`,
      actor: req.admin,
      module: 'Admin Users',
      entityType: 'admin_user',
      entityId: existingAdmin.id,
      oldValue: existingAdmin,
      newValue: null,
      ipAddress: req.ip,
    })

    res.json({
      message: 'Admin user deleted successfully.',
      data: formatAdmin(result.rows[0]),
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to delete admin user.',
    })
  }
}