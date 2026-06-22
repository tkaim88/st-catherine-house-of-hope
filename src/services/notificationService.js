export async function createNotification(notification) {
  try {
    await fetch('https://st-catherine-house-of-hope-api.onrender.com/api/notifications', {
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