import fs from 'fs/promises'
import path from 'path'
import { pool } from '../config/database.js'

const databasePath = path.join(process.cwd(), '..', 'db.json')

async function seedChildren() {
  try {
    const rawData = await fs.readFile(databasePath, 'utf-8')
    const database = JSON.parse(rawData)

    const children = database.children || []

    console.log(`Found ${children.length} children to migrate...`)

    for (const child of children) {
      await pool.query(
        `
        INSERT INTO children (
          id,
          full_name,
          age,
          gender,
          profile_image,
          date_of_birth,
          admission_date,
          school,
          grade,
          education_notes,
          sponsor,
          sponsor_id,
          medical_notes,
          allergies,
          blood_type,
          emergency_contact,
          biography,
          status,
          created_at,
          updated_at
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
          $11,$12,$13,$14,$15,$16,$17,$18,$19,$20
        )
        ON CONFLICT (id) DO NOTHING
        `,
        [
          child.id,
          child.fullName,
          child.age,
          child.gender,
          child.profileImage || '',
          child.dateOfBirth || null,
          child.admissionDate || null,
          child.school || '',
          child.grade || '',
          child.educationNotes || '',
          child.sponsor || '',
          child.sponsorId || null,
          child.medicalNotes || '',
          child.allergies || '',
          child.bloodType || '',
          child.emergencyContact || '',
          child.biography || '',
          child.status || 'Active',
          child.createdAt || new Date().toISOString(),
          child.updatedAt || new Date().toISOString(),
        ]
      )
    }

    console.log('Children migration completed successfully.')

    await pool.end()
  } catch (error) {
    console.error('Migration failed:')
    console.error(error)

    await pool.end()
  }
}

seedChildren()