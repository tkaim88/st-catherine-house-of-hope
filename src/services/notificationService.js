import { API_BASE_URL } from '../config/api'

export async function createNotification(notification) {
  try {
    await fetch(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...notification,
        status: 'not sent',
      }),
    })
  } catch (error) {
    console.error('Notification creation failed:', error)
  }
}