import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import { API_BASE_URL } from '../../config/api'

function SponsorChild() {
  const { childId } = useParams()

  const [child, setChild] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  async function fetchChild() {
    try {
      const response = await fetch(`${API_BASE_URL}/children/${childId}`)

      if (!response.ok) {
        throw new Error('Child profile not found')
      }

      const data = await response.json()
      setChild(data)
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not load child profile.')
    } finally {
      setLoading(false)
    }
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

  function isSponsored(selectedChild) {
    return selectedChild?.sponsor && selectedChild.sponsor !== 'None'
  }

  useEffect(() => {
    fetchChild()
  }, [childId])

  return (
    <>
      <Navbar />

      <section className="section">
        <div className="container">
          <p className="eyebrow">Sponsor a Child</p>

          {loading && <p>Loading child profile...</p>}

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {!loading && child && (
            <>
              <div className="child-profile-header public-child-profile">
                {child.profileImage ? (
                  <img
                    src={child.profileImage}
                    alt={child.fullName}
                    className="child-profile-image"
                  />
                ) : (
                  <div className="child-profile-placeholder">
                    {getChildInitials(child.fullName)}
                  </div>
                )}

                <div>
                  <h1>{child.fullName}</h1>

                  <p>
                    {child.age} years old • {child.gender}
                  </p>

                  <span
                    className={
                      isSponsored(child)
                        ? 'status-badge status-badge--approved'
                        : 'status-badge status-badge--pending'
                    }
                  >
                    {isSponsored(child) ? 'Sponsored' : 'Needs Sponsor'}
                  </span>
                </div>
              </div>

              <div className="child-profile-grid">
                <section>
                  <h3>About {child.fullName}</h3>

                  <p>
                    {child.biography ||
                      'This child is part of the St Catherine House of Hope family and is growing through care, education, and community support.'}
                  </p>
                </section>

                <section>
                  <h3>Education</h3>

                  <p>
                    <strong>School:</strong> {child.school}
                  </p>

                  <p>
                    <strong>Grade:</strong> {child.grade}
                  </p>
                </section>

                <section>
                  <h3>Sponsorship Status</h3>

                  <p>
                    <strong>Status:</strong>{' '}
                    {isSponsored(child) ? 'Already Sponsored' : 'Needs Sponsor'}
                  </p>

                  <p>
                    <strong>Current Sponsor:</strong>{' '}
                    {isSponsored(child) ? child.sponsor : 'None yet'}
                  </p>
                </section>

                <section>
                  <h3>How Sponsorship Helps</h3>

                  <p>
                    Sponsorship helps support food, education, healthcare,
                    clothing, school supplies, mentorship, and daily care.
                  </p>
                </section>
              </div>

              <div className="admin-actions public-sponsor-actions">
                {!isSponsored(child) ? (
                  <Link
                    className="btn btn--primary"
                    to={`/sponsor-child/${child.id}/apply`}
                  >
                    Sponsor This Child
                  </Link>
                ) : (
                  <Link className="btn btn--primary" to="/gallery">
                    Sponsor Another Child
                  </Link>
                )}

                <Link className="btn btn--secondary" to="/gallery">
                  Back to Gallery
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </>
  )
}

export default SponsorChild
