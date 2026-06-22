export async function createActivity(action, details) {
  try {
    await fetch('https://st-catherine-house-of-hope-api.onrender.com/api/activities', {
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