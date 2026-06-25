import { pool } from '../config/database.js'
import {
  supabase,
  SUPABASE_STORAGE_BUCKET,
} from '../config/supabase.js'

function formatMedia(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    originalFilename: row.original_filename,
    storagePath: row.storage_path,
    publicUrl: row.public_url,
    mimeType: row.mime_type,
    fileSize: row.file_size,
    category: row.category,
    relatedType: row.related_type,
    relatedId: row.related_id,
    isActive: row.is_active,
    isFeatured: row.is_featured,
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function sanitizeFilename(filename) {
  return filename
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.\-_]/g, '')
}

export const getMediaFiles = async (req, res) => {
  try {
    const { category, relatedType, relatedId } = req.query

    const conditions = []
    const values = []

    if (category) {
      values.push(category)
      conditions.push(`category = $${values.length}`)
    }

    if (relatedType) {
      values.push(relatedType)
      conditions.push(`related_type = $${values.length}`)
    }

    if (relatedId) {
      values.push(Number(relatedId))
      conditions.push(`related_id = $${values.length}`)
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const result = await pool.query(
      `
      SELECT *
      FROM media_files
      ${whereClause}
      ORDER BY created_at DESC
      `,
      values
    )

    res.json(result.rows.map(formatMedia))
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to load media files.' })
  }
}

export const uploadMediaFile = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      relatedType,
      relatedId,
      isFeatured,
    } = req.body

    if (!req.file) {
      return res.status(400).json({ message: 'Media file is required.' })
    }

    if (!title || !category) {
      return res.status(400).json({
        message: 'Title and category are required.',
      })
    }

    const id = Date.now()
    const safeFilename = sanitizeFilename(req.file.originalname)
    const storagePath = `${category}/${id}-${safeFilename}`

    const uploadResult = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      })

    if (uploadResult.error) {
      console.error(uploadResult.error)
      return res.status(500).json({
        message: 'Failed to upload file to storage.',
      })
    }

    const publicUrlResult = supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(storagePath)

    const publicUrl = publicUrlResult.data.publicUrl

    const result = await pool.query(
      `
      INSERT INTO media_files (
        id,
        title,
        description,
        original_filename,
        storage_path,
        public_url,
        mime_type,
        file_size,
        category,
        related_type,
        related_id,
        is_featured
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
      `,
      [
        id,
        title,
        description || '',
        req.file.originalname,
        storagePath,
        publicUrl,
        req.file.mimetype,
        req.file.size,
        category,
        relatedType || null,
        relatedId ? Number(relatedId) : null,
        isFeatured === 'true' || isFeatured === true,
      ]
    )

    res.status(201).json({
      message: 'Media file uploaded successfully.',
      data: formatMedia(result.rows[0]),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to upload media file.' })
  }
}

export const updateMediaFile = async (req, res) => {
  try {
    const mediaId = Number(req.params.id)

    const existingResult = await pool.query(
      `
      SELECT *
      FROM media_files
      WHERE id = $1
      `,
      [mediaId]
    )

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Media file not found.' })
    }

    const currentMedia = formatMedia(existingResult.rows[0])

    const updatedMedia = {
      title: req.body.title ?? currentMedia.title,
      description: req.body.description ?? currentMedia.description,
      category: req.body.category ?? currentMedia.category,
      relatedType: req.body.relatedType ?? currentMedia.relatedType,
      relatedId:
        req.body.relatedId !== undefined
          ? Number(req.body.relatedId)
          : currentMedia.relatedId,
      isActive:
        req.body.isActive !== undefined
          ? req.body.isActive === true || req.body.isActive === 'true'
          : currentMedia.isActive,
      isFeatured:
        req.body.isFeatured !== undefined
          ? req.body.isFeatured === true || req.body.isFeatured === 'true'
          : currentMedia.isFeatured,
    }

    const result = await pool.query(
      `
      UPDATE media_files
      SET title = $1,
          description = $2,
          category = $3,
          related_type = $4,
          related_id = $5,
          is_active = $6,
          is_featured = $7,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
      `,
      [
        updatedMedia.title,
        updatedMedia.description,
        updatedMedia.category,
        updatedMedia.relatedType,
        updatedMedia.relatedId,
        updatedMedia.isActive,
        updatedMedia.isFeatured,
        mediaId,
      ]
    )

    res.json({
      message: 'Media file updated successfully.',
      data: formatMedia(result.rows[0]),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to update media file.' })
  }
}

export const deleteMediaFile = async (req, res) => {
  try {
    const mediaId = Number(req.params.id)

    const existingResult = await pool.query(
      `
      SELECT *
      FROM media_files
      WHERE id = $1
      `,
      [mediaId]
    )

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Media file not found.' })
    }

    const media = existingResult.rows[0]

    const deleteStorageResult = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .remove([media.storage_path])

    if (deleteStorageResult.error) {
      console.error(deleteStorageResult.error)
      return res.status(500).json({
        message: 'Failed to delete file from storage.',
      })
    }

    const result = await pool.query(
      `
      DELETE FROM media_files
      WHERE id = $1
      RETURNING *
      `,
      [mediaId]
    )

    res.json({
      message: 'Media file deleted successfully.',
      data: formatMedia(result.rows[0]),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to delete media file.' })
  }
}