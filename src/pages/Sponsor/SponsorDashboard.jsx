import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import { API_BASE_URL } from '../../config/api'

function SponsorDashboard() {
  const navigate = useNavigate()

  const [sponsor, setSponsor] = useState(null)
  const [child, setChild] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  function handleLogout() {
    localStorage.removeItem('sponsorToken')
    localStorage.removeItem('sponsorUser')
    navigate('/sponsor-login')
  }

  function getSponsorToken() {
    return localStorage.getItem('sponsorToken')
  }

  function getChildInitials(fullName) {
    if (!fullName) return 'CH'

    return fullName
      .split(' ')
      .map((namePart) => namePart[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  function formatMoney(currency, amount) {
    return `${currency || 'N/A'} ${Number(amount || 0).toLocaleString(
      'en-US',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`
  }

  function formatDate(dateValue) {
    if (!dateValue) return 'Not recorded'

    return new Date(dateValue).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
  }

  function getDaysUntilBirthday(dateOfBirth) {
    if (!dateOfBirth) return null

    const today = new Date()
    const birthDate = new Date(dateOfBirth)

    if (Number.isNaN(birthDate.getTime())) return null

    const thisYearBirthday = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    )

    const nextBirthday =
      thisYearBirthday >= startOfDay(today)
        ? thisYearBirthday
        : new Date(
            today.getFullYear() + 1,
            birthDate.getMonth(),
            birthDate.getDate()
          )

    return Math.ceil((nextBirthday - startOfDay(today)) / 86400000)
  }

  function getNextAge(selectedChild) {
    if (!selectedChild?.date_of_birth) return selectedChild?.age || 'N/A'

    const today = new Date()
    const birthDate = new Date(selectedChild.date_of_birth)

    if (Number.isNaN(birthDate.getTime())) return selectedChild.age || 'N/A'

    let age = today.getFullYear() - birthDate.getFullYear()

    const hasBirthdayPassedThisYear =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() >= birthDate.getDate())

    if (!hasBirthdayPassedThisYear) age -= 1

    return age + 1
  }

  function getBirthdayMessage(selectedChild) {
    if (!selectedChild?.date_of_birth) {
      return 'Birthday has not been recorded yet.'
    }

    const daysUntilBirthday = getDaysUntilBirthday(selectedChild.date_of_birth)
    const nextAge = getNextAge(selectedChild)

    if (daysUntilBirthday === 0) {
      return `Today is ${selectedChild.full_name}'s birthday. They turn ${nextAge}.`
    }

    if (daysUntilBirthday === 1) {
      return `${selectedChild.full_name} turns ${nextAge} tomorrow.`
    }

    return `${selectedChild.full_name} turns ${nextAge} in ${daysUntilBirthday} days.`
  }

  async function fetchSponsorProfile() {
    try {
      const token = getSponsorToken()

      if (!token) {
        navigate('/sponsor-login')
        return
      }

      const response = await fetch(
        `${API_BASE_URL}/sponsor-auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('sponsorToken')
        localStorage.removeItem('sponsorUser')
        navigate('/sponsor-login')
        return
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load sponsor dashboard')
      }

      setSponsor(data.sponsor)
      setChild(data.child)
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Could not load sponsor dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSponsorProfile()
  }, [])

  return (
    <>
      <Navbar />

      <section className="section">
        <div className="container">
          <p className="eyebrow">Sponsor Portal</p>

          <div className="admin-card__header">
            <h1>Welcome, {sponsor?.fullName || 'Sponsor'}</h1>

            <button
              className="btn btn--danger"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {loading && <p>Loading sponsor dashboard...</p>}

          {!loading && sponsor && (
            <>
              <div className="admin-summary">
                <article className="summary-card">
                  <span>Sponsor Status</span>
                  <strong>{sponsor.status}</strong>
                </article>

                <article className="summary-card">
                  <span>Monthly Support</span>
                  <strong>
                    {formatMoney(sponsor.currency, sponsor.monthlyAmount)}
                  </strong>
                </article>

                <article className="summary-card">
                  <span>Sponsored Child</span>
                  <strong>{sponsor.childName || 'Unassigned'}</strong>
                </article>
              </div>

              <section className="admin-quick-actions">
                <h3>Sponsorship Summary</h3>

                <div className="admin-list">
                  <article className="admin-card">
                    <div className="admin-card__details">
                      <p>
                        <strong>Sponsor:</strong> {sponsor.fullName}
                      </p>

                      <p>
                        <strong>Email:</strong> {sponsor.email}
                      </p>

                      <p>
                        <strong>Phone:</strong>{' '}
                        {sponsor.phone || 'Not provided'}
                      </p>

                      <p>
                        <strong>Country:</strong>{' '}
                        {sponsor.country || 'Not provided'}
                      </p>

                      <p>
                        <strong>Monthly Support:</strong>{' '}
                        {formatMoney(sponsor.currency, sponsor.monthlyAmount)}
                      </p>

                      <p>
                        <strong>Last Login:</strong>{' '}
                        {formatDate(sponsor.lastLogin)}
                      </p>
                    </div>
                  </article>
                </div>
              </section>

              <section className="admin-quick-actions">
                <h3>Your Sponsored Child</h3>

                {!child && (
                  <article className="admin-card">
                    <p>
                      You do not have an assigned child yet. Please contact the
                      St Catherine House of Hope team.
                    </p>
                  </article>
                )}

                {child && (
                  <article className="child-card">
                    {child.profile_image ? (
                      <img
                        src={child.profile_image}
                        alt={child.full_name}
                        className="child-card__image"
                      />
                    ) : (
                      <div className="child-card__placeholder">
                        {getChildInitials(child.full_name)}
                      </div>
                    )}

                    <div className="child-card__content">
                      <div className="admin-card__header">
                        <div>
                          <h3>{child.full_name}</h3>
                          <p>
                            {child.age} years old • {child.gender}
                          </p>
                        </div>

                        <span className="status-badge status-badge--approved">
                          Sponsored
                        </span>
                      </div>

                      <div className="admin-card__details">
                        <p>
                          <strong>Date of Birth:</strong>{' '}
                          {formatDate(child.date_of_birth)}
                        </p>

                        <p>
                          <strong>School:</strong>{' '}
                          {child.school || 'Not recorded'}
                        </p>

                        <p>
                          <strong>Grade:</strong>{' '}
                          {child.grade || 'Not recorded'}
                        </p>

                        <p>
                          <strong>Biography:</strong>{' '}
                          {child.biography || 'No biography added yet.'}
                        </p>
                      </div>
                    </div>
                  </article>
                )}
              </section>

              <section className="admin-quick-actions">
                <h3>Birthday Reminder</h3>

                <article className="admin-card">
                  <p>{child ? getBirthdayMessage(child) : 'No child assigned.'}</p>

                  {child?.date_of_birth && (
                    <p>
                      <strong>Date of Birth:</strong>{' '}
                      {formatDate(child.date_of_birth)}
                    </p>
                  )}
                </article>
              </section>

              {child && (
                <section className="admin-quick-actions">
                  <h3>Education & Health Snapshot</h3>

                  <div className="child-profile-grid">
                    <section>
                      <h3>Education</h3>

                      <p>
                        <strong>School:</strong>{' '}
                        {child.school || 'Not recorded'}
                      </p>

                      <p>
                        <strong>Grade:</strong>{' '}
                        {child.grade || 'Not recorded'}
                      </p>

                      <p>
                        <strong>Education Notes:</strong>{' '}
                        {child.education_notes ||
                          'No education notes recorded yet.'}
                      </p>
                    </section>

                    <section>
                      <h3>Health</h3>

                      <p>
                        <strong>Medical Summary:</strong>{' '}
                        {child.medical_notes || 'No medical notes recorded.'}
                      </p>

                      <p>
                        <strong>Allergies:</strong>{' '}
                        {child.allergies || 'Not recorded'}
                      </p>

                      <p>
                        <strong>Blood Type:</strong>{' '}
                        {child.blood_type || 'Not recorded'}
                      </p>
                    </section>
                  </div>
                </section>
              )}

              <section className="admin-quick-actions">
                <h3>Coming Soon</h3>

                <div className="quick-actions-grid">
                  <article className="quick-action-card">
                    Progress Reports
                    <span>Academic and personal development updates.</span>
                  </article>

                  <article className="quick-action-card">
                    Sponsor Messages
                    <span>Send messages and birthday wishes.</span>
                  </article>

                  <article className="quick-action-card">
                    Photo Gallery
                    <span>View approved child and activity photos.</span>
                  </article>

                  <article className="quick-action-card">
                    Sponsorship Payments
                    <span>Track payment history and receipts.</span>
                  </article>
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

export default SponsorDashboard