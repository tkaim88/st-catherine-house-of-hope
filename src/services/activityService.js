export async function createActivity(action, details) {
  try {
    await fetch('http://localhost:5000/api/activities', {
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