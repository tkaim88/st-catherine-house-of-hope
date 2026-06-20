import bcrypt from 'bcryptjs'
import { pool } from '../config/database.js'

const SALT_ROUNDS = 10

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.',
      })
    }

    const result = await pool.query(
      'SELECT * FROM admin_users WHERE email = $1',
      [email]
    )

    const adminUser = result.rows[0]

    if (!adminUser) {
      return res.status(401).json({
        message: 'Invalid admin login details.',
      })
    }

    if (adminUser.status !== 'active') {
      return res.status(403).json({
        message: 'This admin account is not active.',
      })
    }

    const passwordMatches = await bcrypt.compare(
      password,
      adminUser.password_hash
    )

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid admin login details.',
      })
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

    const result = await pool.query(
      'SELECT * FROM admin_users WHERE email = $1',
      [email]
    )

    const adminUser = result.rows[0]

    if (!adminUser) {
      return res.status(404).json({
        message: 'Admin account not found.',
      })
    }

    const currentPasswordMatches = await bcrypt.compare(
      currentPassword,
      adminUser.password_hash
    )

    if (!currentPasswordMatches) {
      return res.status(401).json({
        message: 'Current password is incorrect.',
      })
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)

    await pool.query(
      `
      UPDATE admin_users
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE email = $2
      `,
      [hashedNewPassword, email]
    )

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