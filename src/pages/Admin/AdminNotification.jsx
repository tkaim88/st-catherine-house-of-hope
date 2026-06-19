import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'

function AdminNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const totalNotifications = notifications.length

  const notSentCount = notifications.filter(
    (notification) => notification.status === 'not sent'
  ).length

  const sentCount = notifications.filter(
    (notification) => notification.status === 'sent'
  ).length

  const failedCount = notifications.filter(
    (notification) => notification.status === 'failed'
  ).length

  const filteredNotifications = notifications.filter((notification) => {
    const searchValue = searchTerm.toLowerCase()

    return (
      notification.type?.toLowerCase().includes(searchValue) ||
      notification.recipient?.toLowerCase().includes(searchValue) ||
      notification.message?.toLowerCase().includes(searchValue) ||
      notification.status?.toLowerCase().includes(searchValue)
    )
  })

  async function fetchNotifications() {
    try {
      const response = await fetch('http://localhost:3001/notifications')

      if (!response.ok) {
        throw new Error('Failed to load notifications')
      }

      const data = await response.json()

      const sortedNotifications = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )

      setNotifications(sortedNotifications)
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not load notifications.')
    } finally {
      setLoading(false)
    }
  }

  async function updateNotificationStatus(id, status) {
    try {
      const response = await fetch(
        `http://localhost:3001/notifications/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update notification')
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.id === id
            ? { ...notification, status }
            : notification
        )
      )
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not update notification.')
    }
  }

  async function deleteNotification(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this notification record?'
    )

    if (!confirmed) return

    try {
      const response = await fetch(
        `http://localhost:3001/notifications/${id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete notification')
      }

      setNotifications((currentNotifications) =>
        currentNotifications.filter((notification) => notification.id !== id)
      )
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not delete notification.')
    }
  }

  function getStatusClass(status) {
    if (status === 'sent') return 'status-badge status-badge--approved'
    if (status === 'failed') return 'status-badge status-badge--rejected'
    return 'status-badge status-badge--pending'
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  return (
    <>
      <Navbar />

      <section className="section">
        <div className="container">
          <p className="eyebrow">Admin Dashboard</p>
          <h1>Notification Center</h1>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="admin-summary">
            <article className="summary-card">
              <span>Total Notifications</span>
              <strong>{totalNotifications}</strong>
            </article>

            <article className="summary-card">
              <span>Not Sent</span>
              <strong>{notSentCount}</strong>
            </article>

            <article className="summary-card">
              <span>Sent</span>
              <strong>{sentCount}</strong>
            </article>

            <article className="summary-card">
              <span>Failed</span>
              <strong>{failedCount}</strong>
            </article>
          </div>

          <div className="admin-search">
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          {loading && <p>Loading notifications...</p>}

          {!loading && notifications.length === 0 && (
            <p>No notifications found.</p>
          )}

          <div className="admin-list">
            {filteredNotifications.map((notification) => (
              <article className="admin-card" key={notification.id}>
                <div className="admin-card__header">
                  <div>
                    <h3>{notification.type}</h3>
                    <p>{notification.recipient}</p>
                  </div>

                  <span className={getStatusClass(notification.status)}>
                    {notification.status}
                  </span>
                </div>

                <div className="admin-card__details">
                  <p>
                    <strong>Message:</strong> {notification.message}
                  </p>

                  <p>
                    <strong>Created:</strong>{' '}
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="admin-actions">
                  <button
                    className="btn btn--primary"
                    type="button"
                    onClick={() =>
                      updateNotificationStatus(notification.id, 'sent')
                    }
                  >
                    Mark Sent
                  </button>

                  <button
                    className="btn btn--secondary-dark"
                    type="button"
                    onClick={() =>
                      updateNotificationStatus(notification.id, 'failed')
                    }
                  >
                    Mark Failed
                  </button>

                  <button
                    className="btn btn--danger"
                    type="button"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default AdminNotifications