export async function createNotification(notification) {
  try {
    await fetch('http://localhost:5000/api/notifications', {
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