import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../config/database.js'

const MAX_FAILED_ATTEMPTS = 5
const LOCK_TIME_MINUTES = 15

function createSponsorToken(sponsor) {
  return jwt.sign(
    {
      id: sponsor.id,
      email: sponsor.email,
      role: 'sponsor',
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    }
  )
}

function formatSponsor(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    country: row.country,
    profileImage: row.profile_image,
    childId: row.child_id,
    childName: row.child_name,
    currency: row.currency,
    monthlyAmount: Number(row.monthly_amount || 0),
    notes: row.notes,
    status: row.status,
    lastLogin: row.last_login,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const loginSponsor = async (req, res) => {
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
      FROM sponsors
      WHERE email = $1
      `,
      [email]
    )

    const sponsor = result.rows[0]

    if (!sponsor) {
      return res.status(401).json({
        message: 'Invalid sponsor login details.',
      })
    }

    if (sponsor.status !== 'Active') {
      return res.status(403).json({
        message: 'This sponsor account is not active.',
      })
    }

    if (!sponsor.password_hash) {
      return res.status(403).json({
        message:
          'This sponsor account does not have portal access yet. Please contact the administrator.',
      })
    }

    if (sponsor.locked_until && new Date(sponsor.locked_until) > new Date()) {
      return res.status(423).json({
        message:
          'This account is temporarily locked because of too many failed login attempts. Try again later.',
      })
    }

    const passwordMatches = await bcrypt.compare(password, sponsor.password_hash)

    if (!passwordMatches) {
      const failedAttempts = Number(sponsor.failed_login_attempts || 0) + 1

      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        await pool.query(
          `
          UPDATE sponsors
          SET failed_login_attempts = $1,
              locked_until = NOW() + INTERVAL '${LOCK_TIME_MINUTES} minutes',
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          `,
          [failedAttempts, sponsor.id]
        )

        return res.status(423).json({
          message:
            'Too many failed login attempts. This account has been temporarily locked.',
        })
      }

      await pool.query(
        `
        UPDATE sponsors
        SET failed_login_attempts = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        `,
        [failedAttempts, sponsor.id]
      )

      return res.status(401).json({
        message: 'Invalid sponsor login details.',
      })
    }

    await pool.query(
      `
      UPDATE sponsors
      SET failed_login_attempts = 0,
          locked_until = NULL,
          last_login = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [sponsor.id]
    )

    const freshSponsorResult = await pool.query(
      `
      SELECT *
      FROM sponsors
      WHERE id = $1
      `,
      [sponsor.id]
    )

    const freshSponsor = freshSponsorResult.rows[0]
    const token = createSponsorToken(freshSponsor)

    res.json({
      message: 'Login successful',
      sponsor: formatSponsor(freshSponsor),
      token,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to log in.',
    })
  }
}

export const getSponsorProfile = async (req, res) => {
  try {
    const sponsorId = Number(req.sponsor?.id)

    if (!sponsorId) {
      return res.status(401).json({
        message: 'Unauthorized sponsor request.',
      })
    }

    const sponsorResult = await pool.query(
      `
      SELECT *
      FROM sponsors
      WHERE id = $1
      `,
      [sponsorId]
    )

    const sponsor = sponsorResult.rows[0]

    if (!sponsor) {
      return res.status(404).json({
        message: 'Sponsor profile not found.',
      })
    }

    let child = null

    if (sponsor.child_id) {
      const childResult = await pool.query(
        `
        SELECT *
        FROM children
        WHERE id = $1
        `,
        [sponsor.child_id]
      )

      child = childResult.rows[0] || null
    }

    res.json({
      sponsor: formatSponsor(sponsor),
      child,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Failed to load sponsor profile.',
    })
  }
}

export const logoutSponsor = (req, res) => {
  res.json({
    message: 'Logout successful',
  })
}