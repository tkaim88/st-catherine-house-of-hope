import { pool } from '../config/database.js'

function formatChild(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    age: row.age,
    gender: row.gender,
    profileImage: row.profile_image,
    dateOfBirth: row.date_of_birth,
    admissionDate: row.admission_date,
    school: row.school,
    grade: row.grade,
    educationNotes: row.education_notes,
    sponsor: row.sponsor,
    sponsorId: row.sponsor_id,
    medicalNotes: row.medical_notes,
    allergies: row.allergies,
    bloodType: row.blood_type,
    emergencyContact: row.emergency_contact,
    biography: row.biography,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const getChildren = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM children
      ORDER BY created_at DESC
    `)

    res.json(result.rows.map(formatChild))
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to load children.' })
  }
}

export const getChildById = async (req, res) => {
  try {
    const childId = Number(req.params.id)

    const result = await pool.query(
      `
      SELECT *
      FROM children
      WHERE id = $1
      `,
      [childId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Child not found.' })
    }

    res.json(formatChild(result.rows[0]))
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to load child.' })
  }
}

export const createChild = async (req, res) => {
  try {
    const {
      fullName,
      age,
      gender,
      profileImage,
      dateOfBirth,
      admissionDate,
      school,
      grade,
      educationNotes,
      sponsor,
      sponsorId,
      medicalNotes,
      allergies,
      bloodType,
      emergencyContact,
      biography,
      status,
    } = req.body

    if (!fullName || !age || !school || !grade) {
      return res.status(400).json({
        message: 'Full name, age, school, and grade are required.',
      })
    }

    const id = Date.now()

    const result = await pool.query(
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
        status
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18
      )
      RETURNING *
      `,
      [
        id,
        fullName,
        Number(age),
        gender || 'Female',
        profileImage || '',
        dateOfBirth || null,
        admissionDate || null,
        school || '',
        grade || '',
        educationNotes || '',
        sponsor || 'None',
        sponsorId || null,
        medicalNotes || '',
        allergies || '',
        bloodType || '',
        emergencyContact || '',
        biography || '',
        status || 'Active',
      ]
    )

    res.status(201).json({
      message: 'Child record created successfully.',
      data: formatChild(result.rows[0]),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to create child record.' })
  }
}

export const updateChild = async (req, res) => {
  try {
    const childId = Number(req.params.id)

    const existingChild = await pool.query(
      `
      SELECT *
      FROM children
      WHERE id = $1
      `,
      [childId]
    )

    if (existingChild.rows.length === 0) {
      return res.status(404).json({ message: 'Child not found.' })
    }

    const currentChild = formatChild(existingChild.rows[0])

    const updatedChild = {
      fullName: req.body.fullName ?? currentChild.fullName,
      age: req.body.age !== undefined ? Number(req.body.age) : currentChild.age,
      gender: req.body.gender ?? currentChild.gender,
      profileImage: req.body.profileImage ?? currentChild.profileImage,
      dateOfBirth: req.body.dateOfBirth ?? currentChild.dateOfBirth,
      admissionDate: req.body.admissionDate ?? currentChild.admissionDate,
      school: req.body.school ?? currentChild.school,
      grade: req.body.grade ?? currentChild.grade,
      educationNotes: req.body.educationNotes ?? currentChild.educationNotes,
      sponsor: req.body.sponsor ?? currentChild.sponsor ?? 'None',
      sponsorId: req.body.sponsorId ?? currentChild.sponsorId,
      medicalNotes: req.body.medicalNotes ?? currentChild.medicalNotes,
      allergies: req.body.allergies ?? currentChild.allergies,
      bloodType: req.body.bloodType ?? currentChild.bloodType,
      emergencyContact:
        req.body.emergencyContact ?? currentChild.emergencyContact,
      biography: req.body.biography ?? currentChild.biography,
      status: req.body.status ?? currentChild.status,
    }

    const result = await pool.query(
      `
      UPDATE children
      SET
        full_name = $1,
        age = $2,
        gender = $3,
        profile_image = $4,
        date_of_birth = $5,
        admission_date = $6,
        school = $7,
        grade = $8,
        education_notes = $9,
        sponsor = $10,
        sponsor_id = $11,
        medical_notes = $12,
        allergies = $13,
        blood_type = $14,
        emergency_contact = $15,
        biography = $16,
        status = $17,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $18
      RETURNING *
      `,
      [
        updatedChild.fullName,
        updatedChild.age,
        updatedChild.gender,
        updatedChild.profileImage,
        updatedChild.dateOfBirth || null,
        updatedChild.admissionDate || null,
        updatedChild.school,
        updatedChild.grade,
        updatedChild.educationNotes,
        updatedChild.sponsor,
        updatedChild.sponsorId,
        updatedChild.medicalNotes,
        updatedChild.allergies,
        updatedChild.bloodType,
        updatedChild.emergencyContact,
        updatedChild.biography,
        updatedChild.status,
        childId,
      ]
    )

    res.json({
      message: 'Child record updated successfully.',
      data: formatChild(result.rows[0]),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to update child record.' })
  }
}

export const deleteChild = async (req, res) => {
  try {
    const childId = Number(req.params.id)

    const result = await pool.query(
      `
      DELETE FROM children
      WHERE id = $1
      RETURNING *
      `,
      [childId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Child not found.' })
    }

    res.json({
      message: 'Child record deleted successfully.',
      data: formatChild(result.rows[0]),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to delete child record.' })
  }
}