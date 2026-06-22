import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'

function Gallery() {
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  async function fetchChildren() {
    try {
      const response = await fetch('https://st-catherine-house-of-hope-api.onrender.com/api/children')

      if (!response.ok) {
        throw new Error('Failed to load children')
      }

      const data = await response.json()
      setChildren(data.filter((child) => child.status === 'Active'))
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not load children gallery.')
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

  function getSponsorStatus(child) {
    if (child.sponsor && child.sponsor !== 'None') {
      return 'Sponsored'
    }

    return 'Needs Sponsor'
  }

  useEffect(() => {
    fetchChildren()
  }, [])

  return (
    <>
      <Navbar />

      <section className="section">
        <div className="container">
          <p className="eyebrow">Gallery</p>

          <h1>Meet the Children</h1>

          <p>
            Click a child&apos;s photo to view their public profile and learn
            how you can support their journey.
          </p>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {loading && <p>Loading gallery...</p>}

          {!loading && children.length === 0 && (
            <p>No child profiles are currently available.</p>
          )}

          <div className="children-card-grid">
            {children.map((child) => (
              <article className="child-card" key={child.id}>
                <Link
                  className="child-card__image-button"
                  to={`/sponsor-child/${child.id}`}
                >
                  {child.profileImage ? (
                    <img
                      src={child.profileImage}
                      alt={child.fullName}
                      className="child-card__image"
                    />
                  ) : (
                    <div className="child-card__placeholder">
                      {getChildInitials(child.fullName)}
                    </div>
                  )}
                </Link>

                <div className="child-card__content">
                  <div className="admin-card__header">
                    <div>
                      <h3>{child.fullName}</h3>
                      <p>
                        {child.age} years old • {child.gender}
                      </p>
                    </div>

                    <span
                      className={
                        child.sponsor && child.sponsor !== 'None'
                          ? 'status-badge status-badge--approved'
                          : 'status-badge status-badge--pending'
                      }
                    >
                      {getSponsorStatus(child)}
                    </span>
                  </div>

                  <div className="admin-card__details">
                    <p>
                      <strong>School:</strong> {child.school}
                    </p>

                    <p>
                      <strong>Grade:</strong> {child.grade}
                    </p>
                  </div>

                  <div className="admin-actions">
                    <Link
                      className="btn btn--primary"
                      to={`/sponsor-child/${child.id}`}
                    >
                      View Profile
                    </Link>
                  </div>
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

export default Gallery