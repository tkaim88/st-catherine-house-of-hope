import { pool } from '../config/database.js'

export async function logActivity({
  action,
  details = '',
  actor = null,
  module = '',
  entityType = '',
  entityId = null,
  oldValue = null,
  newValue = null,
  ipAddress = '',
}) {
  await pool.query(
    `
    INSERT INTO activities (
      id,
      action,
      details,
      actor_id,
      actor_email,
      actor_role,
      module,
      entity_type,
      entity_id,
      old_value,
      new_value,
      ip_address
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    `,
    [
      Date.now(),
      action,
      details,
      actor?.id || null,
      actor?.email || '',
      actor?.role || '',
      module,
      entityType,
      entityId,
      oldValue ? JSON.stringify(oldValue) : null,
      newValue ? JSON.stringify(newValue) : null,
      ipAddress,
    ]
  )
}