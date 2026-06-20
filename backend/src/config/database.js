import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function testDatabaseConnection() {
  const result = await pool.query('SELECT NOW()')
  return result.rows[0]
}