import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'

function AdminSponsorshipApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const pendingCount = applications.filter((app) => app.status === 'pending').length
  const approvedCount = applications.filter((app) => app.status === 'approved').length
  const rejectedCount = applications.filter((app) => app.status === 'rejected').length

  const filteredApplications = applications.filter((application) => {
    const searchValue = searchTerm.toLowerCase()

    return (
      application.fullName?.toLowerCase().includes(searchValue) ||
      application.email?.toLowerCase().includes(searchValue) ||
      application.childName?.toLowerCase().includes(searchValue) ||
      application.country?.toLowerCase().includes(searchValue) ||
      application.status?.toLowerCase().includes(searchValue)
    )
  })

  function formatMoney(currency, amount) {
    return `${currency || 'N/A'} ${Number(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  function getStatusClass(status) {
    if (status === 'approved') return 'status-badge status-badge--approved'
    if (status === 'rejected') return 'status-badge status-badge--rejected'
    return 'status-badge status-badge--pending'
  }

  async function fetchApplications() {
    try {
      const response = await fetch(
        'http://localhost:5000/api/sponsorship-applications'
      )

      if (!response.ok) {
        throw new Error('Failed to load sponsorship applications')
      }

      const data = await response.json()
      setApplications(data)
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not load sponsorship applications.')
    } finally {
      setLoading(false)
    }
  }

  async function approveApplication(id) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/sponsorship-applications/${id}/approve`,
        {
          method: 'PATCH',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to approve application')
      }

      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === id
            ? {
                ...application,
                status: 'approved',
                approvedAt: new Date().toISOString(),
                sponsorId: data.data?.id,
              }
            : application
        )
      )

      setSuccessMessage('Sponsorship application approved successfully.')
      setErrorMessage('')
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Could not approve application.')
      setSuccessMessage('')
    }
  }

  async function rejectApplication(id) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/sponsorship-applications/${id}/reject`,
        {
          method: 'PATCH',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reject application')
      }

      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === id
            ? {
                ...application,
                status: 'rejected',
                rejectedAt: new Date().toISOString(),
              }
            : application
        )
      )

      setSuccessMessage('Sponsorship application rejected successfully.')
      setErrorMessage('')
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Could not reject application.')
      setSuccessMessage('')
    }
  }

  async function deleteApplication(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this sponsorship application?'
    )

    if (!confirmed) return

    try {
      const response = await fetch(
        `http://localhost:5000/api/sponsorship-applications/${id}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete application')
      }

      setApplications((currentApplications) =>
        currentApplications.filter((application) => application.id !== id)
      )

      setSuccessMessage('Sponsorship application deleted successfully.')
      setErrorMessage('')
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Could not delete application.')
      setSuccessMessage('')
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  return (
    <>
      <Navbar />

      <section className="section">
        <div className="container">
          <p className="eyebrow">Admin Dashboard</p>
          <h1>Sponsorship Applications</h1>

          {successMessage && <p className="success-message">{successMessage}</p>}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="admin-summary">
            <article className="summary-card">
              <span>Total Applications</span>
              <strong>{applications.length}</strong>
            </article>

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

          <div className="admin-search">
            <input
              type="text"
              placeholder="Search by applicant, email, child, country, or status..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          {loading && <p>Loading sponsorship applications...</p>}

          {!loading && applications.length === 0 && (
            <p>No sponsorship applications found.</p>
          )}

          <div className="admin-list">
            {filteredApplications.map((application) => (
              <article className="admin-card" key={application.id}>
                <div className="admin-card__header">
                  <div>
                    <h3>{application.fullName}</h3>
                    <p>{application.email}</p>
                  </div>

                  <span className={getStatusClass(application.status)}>
                    {application.status}
                  </span>
                </div>

                <div className="admin-card__details">
                  <p>
                    <strong>Child:</strong> {application.childName}
                  </p>

                  <p>
                    <strong>Phone:</strong>{' '}
                    {application.phone || 'Not provided'}
                  </p>

                  <p>
                    <strong>Country:</strong>{' '}
                    {application.country || 'Not provided'}
                  </p>

                  <p>
                    <strong>Monthly Amount:</strong>{' '}
                    {formatMoney(application.currency, application.monthlyAmount)}
                  </p>

                  <p>
                    <strong>Message:</strong>{' '}
                    {application.message || 'No message provided'}
                  </p>

                  <p>
                    <strong>Submitted:</strong>{' '}
                    {application.createdAt
                      ? new Date(application.createdAt).toLocaleString()
                      : 'Not recorded'}
                  </p>
                </div>

                <div className="admin-actions">
                  {application.status === 'pending' && (
                    <>
                      <button
                        className="btn btn--primary"
                        type="button"
                        onClick={() => approveApplication(application.id)}
                      >
                        Approve
                      </button>

                      <button
                        className="btn btn--secondary"
                        type="button"
                        onClick={() => rejectApplication(application.id)}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  <button
                    className="btn btn--danger"
                    type="button"
                    onClick={() => deleteApplication(application.id)}
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

export default AdminSponsorshipApplications