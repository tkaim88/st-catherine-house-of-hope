import { API_BASE_URL } from '../config/api'

export async function createActivity(action, details) {
  try {
    await fetch(`${API_BASE_URL}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        details,
      }),
    })
  } catch (error) {
    console.error('Activity log failed:', error)
  }
}