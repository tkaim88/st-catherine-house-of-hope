export async function createNotification(notification) {
  try {
    await fetch('http://localhost:3001/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...notification,
        status: 'not sent',
        createdAt: new Date().toISOString(),
      }),
    })
  } catch (error) {
    console.error('Notification creation failed:', error)
  }
}