import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import { hasPermission } from '../../utils/adminPermissions'

function AdminDashboard() {
  const navigate = useNavigate()

  const [volunteers, setVolunteers] = useState([])
  const [donations, setDonations] = useState([])
  const [children, setChildren] = useState([])
  const [messages, setMessages] = useState([])
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const pendingVolunteers = volunteers.filter(
    (volunteer) => volunteer.status === 'pending'
  ).length

  const pendingDonations = donations.filter(
    (donation) => donation.status === 'pending'
  ).length

  const activeChildren = children.filter(
    (child) => child.status === 'Active'
  ).length

  const sponsoredChildren = children.filter(
    (child) => child.sponsor && child.sponsor !== 'None'
  ).length

  const unreadMessages = messages.filter(
    (message) => message.status === 'unread'
  ).length

  const activeDonors = donors.filter((donor) => donor.status === 'active').length

  const recentDonations = [...donations]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)

  const recentVolunteers = [...volunteers]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)

  const recentMessages = [...messages]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)

  function formatMoney(currency, amount) {
    return `${currency || 'N/A'} ${Number(amount || 0).toLocaleString(
      'en-US',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`
  }

  function handleLogout() {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    navigate('/admin-login')
  }

  async function fetchDashboardData() {
    try {
      const [
        volunteersResponse,
        donationsResponse,
        childrenResponse,
        messagesResponse,
        donorsResponse,
      ] = await Promise.all([
        fetch('http://localhost:5000/api/volunteers'),
        fetch('http://localhost:5000/api/donations'),
        fetch('http://localhost:5000/api/children'),
        fetch('http://localhost:5000/api/messages'),
        fetch('http://localhost:5000/api/donors'),
      ])

      if (
        !volunteersResponse.ok ||
        !donationsResponse.ok ||
        !childrenResponse.ok ||
        !messagesResponse.ok ||
        !donorsResponse.ok
      ) {
        throw new Error('Failed to load dashboard data')
      }

      const volunteersData = await volunteersResponse.json()
      const donationsData = await donationsResponse.json()
      const childrenData = await childrenResponse.json()
      const messagesData = await messagesResponse.json()
      const donorsData = await donorsResponse.json()

      setVolunteers(volunteersData)
      setDonations(donationsData)
      setChildren(childrenData)
      setMessages(messagesData)
      setDonors(donorsData)
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return (
    <>
      <Navbar />

      <section className="section">
        <div className="container">
          <p className="eyebrow">Admin Dashboard</p>

          <div className="admin-card__header">
            <h1>St Catherine House of Hope Admin</h1>

            <button
              className="btn btn--danger"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {loading && <p>Loading dashboard...</p>}

          {!loading && (
            <>
              <div className="admin-summary">
                <article className="summary-card">
                  <span>Total Volunteers</span>
                  <strong>{volunteers.length}</strong>
                </article>

                <article className="summary-card">
                  <span>Pending Volunteers</span>
                  <strong>{pendingVolunteers}</strong>
                </article>

                <article className="summary-card">
                  <span>Total Donations</span>
                  <strong>{donations.length}</strong>
                </article>

                <article className="summary-card">
                  <span>Pending Donations</span>
                  <strong>{pendingDonations}</strong>
                </article>

                <article className="summary-card">
                  <span>Total Donors</span>
                  <strong>{donors.length}</strong>
                </article>

                <article className="summary-card">
                  <span>Active Donors</span>
                  <strong>{activeDonors}</strong>
                </article>

                <article className="summary-card">
                  <span>Total Children</span>
                  <strong>{children.length}</strong>
                </article>

                <article className="summary-card">
                  <span>Active Children</span>
                  <strong>{activeChildren}</strong>
                </article>

                <article className="summary-card">
                  <span>Sponsored Children</span>
                  <strong>{sponsoredChildren}</strong>
                </article>

                <article className="summary-card">
                  <span>Total Messages</span>
                  <strong>{messages.length}</strong>
                </article>

                <article className="summary-card">
                  <span>Unread Messages</span>
                  <strong>{unreadMessages}</strong>
                </article>
              </div>

              <section className="admin-quick-actions">
                <h3>Admin Sections</h3>

                <div className="quick-actions-grid">
                  {hasPermission('volunteers') && (
                    <Link className="quick-action-card" to="/admin/volunteers">
                      Volunteer Applications
                    </Link>
                  )}

                  {hasPermission('donations') && (
                    <Link className="quick-action-card" to="/admin/donations">
                      Donation Management
                    </Link>
                  )}

                  {hasPermission('donors') && (
                    <Link className="quick-action-card" to="/admin/donors">
                      Donor Management
                    </Link>
                  )}

                  {hasPermission('children') && (
                    <Link className="quick-action-card" to="/admin/children">
                      Children Management
                    </Link>
                  )}

                  {hasPermission('sponsors') && (
                    <Link className="quick-action-card" to="/admin/sponsors">
                      Sponsorship Management
                    </Link>
                  )}

                  {hasPermission('messages') && (
                    <Link className="quick-action-card" to="/admin/messages">
                      Contact Messages
                    </Link>
                  )}

                  {hasPermission('reports') && (
                    <Link className="quick-action-card" to="/admin/reports">
                      Reports Center
                    </Link>
                  )}

                  {hasPermission('notifications') && (
                    <Link
                      className="quick-action-card"
                      to="/admin/notifications"
                    >
                      Notification Center
                    </Link>
                  )}

                  {hasPermission('activities') && (
                    <Link className="quick-action-card" to="/admin/activities">
                      Activity Logs
                    </Link>
                  )}

                  {hasPermission('settings') && (
                    <Link className="quick-action-card" to="/admin/settings">
                      Admin Settings
                    </Link>
                  )}

                  {hasPermission('users') && (
                    <Link className="quick-action-card" to="/admin/users">
                      Admin User Management
                    </Link>
                  )}
                </div>
              </section>

              <section className="admin-quick-actions">
                <h3>Recent Messages</h3>

                <div className="admin-list">
                  {recentMessages.length === 0 && (
                    <p>No recent messages found.</p>
                  )}

                  {recentMessages.map((message) => (
                    <article className="admin-card" key={message.id}>
                      <div className="admin-card__header">
                        <div>
                          <h3>{message.fullName}</h3>
                          <p>{message.email}</p>
                        </div>

                        <span className="status-badge status-badge--pending">
                          {message.status}
                        </span>
                      </div>

                      <p>
                        <strong>Subject:</strong> {message.subject}
                      </p>

                      <p>
                        <strong>Message:</strong> {message.message}
                      </p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="admin-quick-actions">
                <h3>Recent Donations</h3>

                <div className="admin-list">
                  {recentDonations.length === 0 && (
                    <p>No recent donations found.</p>
                  )}

                  {recentDonations.map((donation) => (
                    <article className="admin-card" key={donation.id}>
                      <div className="admin-card__header">
                        <div>
                          <h3>{donation.fullName}</h3>
                          <p>{donation.email}</p>
                        </div>

                        <span className="status-badge status-badge--pending">
                          {donation.status}
                        </span>
                      </div>

                      <p>
                        <strong>Amount:</strong>{' '}
                        {formatMoney(donation.currency, donation.amount)}
                      </p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="admin-quick-actions">
                <h3>Recent Volunteers</h3>

                <div className="admin-list">
                  {recentVolunteers.length === 0 && (
                    <p>No recent volunteers found.</p>
                  )}

                  {recentVolunteers.map((volunteer) => (
                    <article className="admin-card" key={volunteer.id}>
                      <div className="admin-card__header">
                        <div>
                          <h3>{volunteer.fullName}</h3>
                          <p>{volunteer.email}</p>
                        </div>

                        <span className="status-badge status-badge--pending">
                          {volunteer.status}
                        </span>
                      </div>

                      <p>
                        <strong>Skills:</strong> {volunteer.skills}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </section>

      <Footer />
    </>
  )
}

export default AdminDashboard