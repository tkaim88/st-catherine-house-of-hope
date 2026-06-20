import bcrypt from 'bcryptjs'
import { pool } from '../config/database.js'

const SALT_ROUNDS = 10
const allowedRoles = ['super-admin', 'admin', 'staff', 'finance']

function formatAdmin(admin) {
  return {
    id: admin.id,
    email: admin.email,
    role: admin.role,
    status: admin.status,
    createdAt: admin.created_at,
    updatedAt: admin.updated_at,
  }
}

export const getAdminUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT id, email, role, status, created_at, updated_at
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
      INSERT INTO admin_users (id, email, password_hash, role, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, role, status, created_at, updated_at
      `,
      [id, email, hashedPassword, role, 'active']
    )

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

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: 'Invalid admin role.',
      })
    }

    const result = await pool.query(
      `
      UPDATE admin_users
      SET role = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email, role, status, created_at, updated_at
      `,
      [role, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Admin user not found.',
      })
    }

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

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)

    const result = await pool.query(
      `
      UPDATE admin_users
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email, role, status, created_at, updated_at
      `,
      [hashedPassword, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Admin user not found.',
      })
    }

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

    const result = await pool.query(
      `
      DELETE FROM admin_users
      WHERE id = $1
      RETURNING id, email, role, status, created_at, updated_at
      `,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Admin user not found.',
      })
    }

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