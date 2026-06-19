import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import { createActivity } from '../../services/activityService'
import { createNotification } from '../../services/notificationService'

function AdminVolunteers() {
  const [volunteers, setVolunteers] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState('newest')
  const [selectedVolunteer, setSelectedVolunteer] = useState(null)

  const pendingCount = volunteers.filter(
    (volunteer) => volunteer.status === 'pending'
  ).length

  const approvedCount = volunteers.filter(
    (volunteer) => volunteer.status === 'approved'
  ).length

  const rejectedCount = volunteers.filter(
    (volunteer) => volunteer.status === 'rejected'
  ).length

  const filteredVolunteers = volunteers
    .filter((volunteer) => {
      if (filter === 'all') return true
      return volunteer.status === filter
    })
    .filter((volunteer) => {
      const searchValue = searchTerm.toLowerCase()

      return (
        volunteer.fullName?.toLowerCase().includes(searchValue) ||
        volunteer.email?.toLowerCase().includes(searchValue) ||
        volunteer.phone?.toLowerCase().includes(searchValue) ||
        volunteer.skills?.toLowerCase().includes(searchValue) ||
        volunteer.message?.toLowerCase().includes(searchValue)
      )
    })
    .sort((a, b) => {
      if (sortOption === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt)
      }

      if (sortOption === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt)
      }

      if (sortOption === 'name') {
        return a.fullName.localeCompare(b.fullName)
      }

      return 0
    })

  const recentActivities = [...volunteers]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  async function fetchVolunteers() {
    try {
      const response = await fetch('http://localhost:5000/api/volunteers')

      if (!response.ok) {
        throw new Error('Failed to load volunteer applications')
      }

      const data = await response.json()
      setVolunteers(data)
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not load volunteer applications.')
    } finally {
      setLoading(false)
    }
  }

  async function updateVolunteerStatus(id, status) {
    const volunteer = volunteers.find((item) => item.id === id)

    try {
      const response = await fetch(`http://localhost:5000/api/volunteers/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update volunteer status')
      }

      await createActivity(
        status === 'approved' ? 'Volunteer Approved' : 'Volunteer Rejected',
        `${volunteer?.fullName || 'Volunteer'} application was marked as ${status}.`
      )

      await createNotification({
        type: 'Volunteer Application',
        recipient: volunteer?.email || 'No email provided',
        message:
          status === 'approved'
            ? `Hello ${volunteer?.fullName || 'Volunteer'}, your volunteer application has been approved.`
            : `Hello ${volunteer?.fullName || 'Volunteer'}, your volunteer application was not approved at this time.`,
      })

      setVolunteers((currentVolunteers) =>
        currentVolunteers.map((item) =>
          item.id === id ? { ...item, status } : item
        )
      )

      if (selectedVolunteer?.id === id) {
        setSelectedVolunteer((currentVolunteer) => ({
          ...currentVolunteer,
          status,
        }))
      }

      setSuccessMessage(`Volunteer application marked as ${status}.`)
      setErrorMessage('')
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not update volunteer status.')
    }
  }

  async function deleteVolunteer(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this volunteer application?'
    )

    if (!confirmed) return

    const volunteer = volunteers.find((item) => item.id === id)

    try {
      const response = await fetch(`http://localhost:5000/api/volunteers/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete volunteer application')
      }

      await createActivity(
        'Volunteer Deleted',
        `${volunteer?.fullName || 'Volunteer'} application was deleted.`
      )

      setVolunteers((currentVolunteers) =>
        currentVolunteers.filter((item) => item.id !== id)
      )

      if (selectedVolunteer?.id === id) {
        setSelectedVolunteer(null)
      }

      setSuccessMessage('Volunteer application deleted.')
      setErrorMessage('')
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not delete volunteer application.')
    }
  }

  async function resetVolunteers() {
    const confirmed = window.confirm(
      'Are you sure you want to delete ALL volunteer applications?'
    )

    if (!confirmed) return

    try {
      await Promise.all(
        volunteers.map((volunteer) =>
          fetch(`http://localhost:5000/api/volunteers/${volunteer.id}`, {
            method: 'DELETE',
          })
        )
      )

      await createActivity(
        'Volunteers Reset',
        'All volunteer applications were deleted.'
      )

      setVolunteers([])
      setSelectedVolunteer(null)
      setSuccessMessage('All volunteer applications have been deleted.')
      setErrorMessage('')
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not reset volunteer applications.')
    }
  }

  function exportVolunteersToCSV() {
    if (volunteers.length === 0) {
      setErrorMessage('There are no volunteer applications to export.')
      return
    }

    const headers = ['Name', 'Email', 'Phone', 'Skills', 'Status', 'Submitted']

    const rows = volunteers.map((volunteer) => [
      volunteer.fullName,
      volunteer.email,
      volunteer.phone,
      volunteer.skills,
      volunteer.status,
      new Date(volunteer.createdAt).toLocaleString(),
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${value}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'volunteer-applications.csv'
    link.click()

    URL.revokeObjectURL(url)
    setSuccessMessage('Volunteer applications exported successfully.')
  }

  function getStatusClass(status) {
    if (status === 'approved') return 'status-badge status-badge--approved'
    if (status === 'rejected') return 'status-badge status-badge--rejected'
    return 'status-badge status-badge--pending'
  }

  useEffect(() => {
    fetchVolunteers()
  }, [])

  return (
    <>
      <Navbar />

      <section className="section">
        <div className="container">
          <p className="eyebrow">Admin Dashboard</p>
          <h1>Volunteer Applications</h1>

          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="admin-summary">
            <article className="summary-card">
              <span>Pending</span>
              <strong>{pendingCount}</strong>
            </article>

            <article className="summary-card">
              <span>Approved</span>
              <strong>{approvedCount}</strong>
            </article>

            <article className="summary-card">
              <span>Rejected</span>
              <strong>{rejectedCount}</strong>
            </article>
          </div>

          <div className="admin-metrics">
            <article className="metric-card">
              <h4>Total Applications</h4>
              <strong>{volunteers.length}</strong>
            </article>

            <article className="metric-card">
              <h4>Approval Rate</h4>
              <strong>
                {volunteers.length > 0
                  ? Math.round((approvedCount / volunteers.length) * 100)
                  : 0}
                %
              </strong>
            </article>

            <article className="metric-card">
              <h4>Latest Applications</h4>
              <strong>{recentActivities.length}</strong>
            </article>
          </div>

          <section className="admin-quick-actions">
            <h3>Quick Actions</h3>

            <div className="quick-actions-grid">
              <button
                className="quick-action-card"
                type="button"
                onClick={() =>
                  document
                    .querySelector('.admin-list')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                View Volunteers
              </button>

              <button
                className="quick-action-card"
                type="button"
                onClick={exportVolunteersToCSV}
              >
                Export CSV
              </button>

              <button className="quick-action-card" type="button">
                View Donations
              </button>

              <button className="quick-action-card" type="button">
                View Children
              </button>

              <button
                className="quick-action-card quick-action-card--danger"
                type="button"
                onClick={resetVolunteers}
              >
                Reset Applications
              </button>
            </div>
          </section>

          <section className="recent-activity">
            <h3>Recent Activity</h3>

            <div className="activity-list">
              {recentActivities.length === 0 && (
                <p className="empty-state">No recent activity yet.</p>
              )}

              {recentActivities.map((volunteer) => (
                <article key={volunteer.id} className="activity-item">
                  <div>
                    <strong>{volunteer.fullName}</strong>

                    <p>
                      Volunteer application was{' '}
                      <span className={getStatusClass(volunteer.status)}>
                        {volunteer.status}
                      </span>
                    </p>
                  </div>

                  <small>
                    {new Date(volunteer.createdAt).toLocaleDateString()}
                  </small>
                </article>
              ))}
            </div>
          </section>

          <div className="admin-filters">
            <button
              className={filter === 'all' ? 'active' : ''}
              type="button"
              onClick={() => setFilter('all')}
            >
              All
            </button>

            <button
              className={filter === 'pending' ? 'active' : ''}
              type="button"
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>

            <button
              className={filter === 'approved' ? 'active' : ''}
              type="button"
              onClick={() => setFilter('approved')}
            >
              Approved
            </button>

            <button
              className={filter === 'rejected' ? 'active' : ''}
              type="button"
              onClick={() => setFilter('rejected')}
            >
              Rejected
            </button>
          </div>

          <div className="admin-search">
            <input
              type="text"
              placeholder="Search volunteers..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>

          {loading && <p>Loading volunteer applications...</p>}

          {!loading && volunteers.length === 0 && (
            <p>No volunteer applications found.</p>
          )}

          {!loading &&
            volunteers.length > 0 &&
            filteredVolunteers.length === 0 && (
              <p>No volunteer applications match your current filter/search.</p>
            )}

          <div className="admin-list">
            {filteredVolunteers.map((volunteer) => (
              <article className="admin-card" key={volunteer.id}>
                <div className="admin-card__header">
                  <div>
                    <h3>{volunteer.fullName}</h3>
                    <p>{volunteer.skills}</p>
                  </div>

                  <span className={getStatusClass(volunteer.status)}>
                    {volunteer.status}
                  </span>
                </div>

                <div className="admin-card__details">
                  <p>
                    <strong>Email:</strong> {volunteer.email}
                  </p>

                  <p>
                    <strong>Phone:</strong> {volunteer.phone}
                  </p>

                  <p>
                    <strong>Message:</strong> {volunteer.message}
                  </p>

                  <p>
                    <strong>Submitted:</strong>{' '}
                    {new Date(volunteer.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="admin-actions">
                  <button
                    className="btn"
                    type="button"
                    onClick={() => setSelectedVolunteer(volunteer)}
                  >
                    View Details
                  </button>

                  {volunteer.status === 'pending' && (
                    <>
                      <button
                        className="btn btn--primary"
                        type="button"
                        onClick={() =>
                          updateVolunteerStatus(volunteer.id, 'approved')
                        }
                      >
                        Approve
                      </button>

                      <button
                        className="btn btn--secondary-dark"
                        type="button"
                        onClick={() =>
                          updateVolunteerStatus(volunteer.id, 'rejected')
                        }
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {volunteer.status === 'approved' && (
                    <span className="decision-label decision-label--approved">
                      ✓ Approved
                    </span>
                  )}

                  {volunteer.status === 'rejected' && (
                    <span className="decision-label decision-label--rejected">
                      ✕ Rejected
                    </span>
                  )}

                  <button
                    className="btn btn--danger"
                    type="button"
                    onClick={() => deleteVolunteer(volunteer.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {selectedVolunteer && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedVolunteer(null)}
        >
          <div
            className="modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>Volunteer Profile</h2>

            <p>
              <strong>Name:</strong> {selectedVolunteer.fullName}
            </p>

            <p>
              <strong>Email:</strong> {selectedVolunteer.email}
            </p>

            <p>
              <strong>Phone:</strong> {selectedVolunteer.phone}
            </p>

            <p>
              <strong>Skills:</strong> {selectedVolunteer.skills}
            </p>

            <p>
              <strong>Status:</strong>{' '}
              <span className={getStatusClass(selectedVolunteer.status)}>
                {selectedVolunteer.status}
              </span>
            </p>

            <p>
              <strong>Message:</strong> {selectedVolunteer.message}
            </p>

            <div className="admin-actions">
              {selectedVolunteer.status === 'pending' && (
                <>
                  <button
                    className="btn btn--primary"
                    type="button"
                    onClick={() =>
                      updateVolunteerStatus(selectedVolunteer.id, 'approved')
                    }
                  >
                    Approve
                  </button>

                  <button
                    className="btn btn--secondary-dark"
                    type="button"
                    onClick={() =>
                      updateVolunteerStatus(selectedVolunteer.id, 'rejected')
                    }
                  >
                    Reject
                  </button>
                </>
              )}

              <button
                className="btn btn--danger"
                type="button"
                onClick={() => deleteVolunteer(selectedVolunteer.id)}
              >
                Delete
              </button>

              <button
                className="btn btn--primary"
                type="button"
                onClick={() => setSelectedVolunteer(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}

export default AdminVolunteers