import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'

function AdminActivities() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const totalActivities = activities.length

  const filteredActivities = activities.filter((activity) => {
    const searchValue = searchTerm.toLowerCase()

    return (
      activity.action?.toLowerCase().includes(searchValue) ||
      activity.details?.toLowerCase().includes(searchValue)
    )
  })

  async function fetchActivities() {
    try {
      const response = await fetch('http://localhost:5000/api/activities')

      if (!response.ok) {
        throw new Error('Failed to load activities')
      }

      const data = await response.json()

      const sortedActivities = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )

      setActivities(sortedActivities)
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not load activity logs.')
    } finally {
      setLoading(false)
    }
  }

  async function clearActivities() {
    const confirmed = window.confirm(
      'Are you sure you want to clear all activity logs?'
    )

    if (!confirmed) return

    setErrorMessage(
      'Clear logs is temporarily disabled until the Express backend clear endpoint is added.'
    )
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  return (
    <>
      <Navbar />

      <section className="section">
        <div className="container">
          <p className="eyebrow">Admin Dashboard</p>
          <h1>Activity Logs</h1>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="admin-summary">
            <article className="summary-card">
              <span>Total Activities</span>
              <strong>{totalActivities}</strong>
            </article>
          </div>

          <div className="admin-search">
            <input
              type="text"
              placeholder="Search activity logs..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <button
              className="btn btn--danger"
              type="button"
              onClick={clearActivities}
            >
              Clear Logs
            </button>
          </div>

          {loading && <p>Loading activity logs...</p>}

          {!loading && activities.length === 0 && (
            <p>No activity logs found.</p>
          )}

          {!loading &&
            activities.length > 0 &&
            filteredActivities.length === 0 && (
              <p>No activity logs match your current search.</p>
            )}

          <div className="admin-list">
            {filteredActivities.map((activity) => (
              <article className="admin-card" key={activity.id}>
                <div className="admin-card__header">
                  <div>
                    <h3>{activity.action}</h3>
                    <p>{activity.details}</p>
                  </div>

                  <span className="status-badge status-badge--approved">
                    Log
                  </span>
                </div>

                <p>
                  <strong>Date:</strong>{' '}
                  {new Date(activity.createdAt).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default AdminActivities