import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../config/database.js'

const SALT_ROUNDS = 10
const MAX_FAILED_ATTEMPTS = 5
const LOCK_TIME_MINUTES = 15

function createToken(adminUser) {
  return jwt.sign(
    {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    }
  )
}

function formatAdmin(adminUser) {
  return {
    id: adminUser.id,
    fullName: adminUser.full_name,
    email: adminUser.email,
    role: adminUser.role,
    status: adminUser.status,
    lastLogin: adminUser.last_login,
  }
}

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.',
      })
    }

    const result = await pool.query(
      `
      SELECT *
      FROM admin_users
      WHERE email = $1
      `,
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

    if (
      adminUser.locked_until &&
      new Date(adminUser.locked_until) > new Date()
    ) {
      return res.status(423).json({
        message:
          'This account is temporarily locked because of too many failed login attempts. Try again later.',
      })
    }

    const passwordMatches = await bcrypt.compare(
      password,
      adminUser.password_hash
    )

    if (!passwordMatches) {
      const failedAttempts = Number(adminUser.failed_login_attempts || 0) + 1

      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        await pool.query(
          `
          UPDATE admin_users
          SET failed_login_attempts = $1,
              locked_until = NOW() + INTERVAL '${LOCK_TIME_MINUTES} minutes',
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          `,
          [failedAttempts, adminUser.id]
        )

        return res.status(423).json({
          message:
            'Too many failed login attempts. This account has been temporarily locked.',
        })
      }

      await pool.query(
        `
        UPDATE admin_users
        SET failed_login_attempts = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        `,
        [failedAttempts, adminUser.id]
      )

      return res.status(401).json({
        message: 'Invalid admin login details.',
      })
    }

    await pool.query(
      `
      UPDATE admin_users
      SET failed_login_attempts = 0,
          locked_until = NULL,
          last_login = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [adminUser.id]
    )

    const freshAdminResult = await pool.query(
      `
      SELECT *
      FROM admin_users
      WHERE id = $1
      `,
      [adminUser.id]
    )

    const freshAdmin = freshAdminResult.rows[0]
    const token = createToken(freshAdmin)

    res.json({
      message: 'Login successful',
      admin: formatAdmin(freshAdmin),
      token,
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
    const adminEmail = req.admin?.email || req.body.email
    const { currentPassword, newPassword } = req.body

    if (!adminEmail || !currentPassword || !newPassword) {
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
      `
      SELECT *
      FROM admin_users
      WHERE email = $1
      `,
      [adminEmail]
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
      SET password_hash = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE email = $2
      `,
      [hashedNewPassword, adminEmail]
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