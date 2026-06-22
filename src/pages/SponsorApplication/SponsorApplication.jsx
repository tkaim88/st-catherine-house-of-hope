import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'

function SponsorApplication() {
  const { childId } = useParams()

  const [child, setChild] = useState(null)
  const [loading, setLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    currency: 'KSH',
    monthlyAmount: '',
    message: '',
  })

  async function fetchChild() {
    try {
      const response = await fetch(`https://st-catherine-house-of-hope-api.onrender.com/api/children/${childId}`)

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

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!child) {
      setErrorMessage('Child profile is not available.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch(
        'https://st-catherine-house-of-hope-api.onrender.com/api/sponsorship-applications',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            childId: child.id,
            childName: child.fullName,
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            country: formData.country,
            monthlyAmount: Number(formData.monthlyAmount),
            currency: formData.currency,
            message: formData.message,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit application.')
      }

      setSuccessMessage(
        'Your sponsorship application has been submitted. Our team will review it and contact you.'
      )

      setFormData({
        fullName: '',
        email: '',
        phone: '',
        country: '',
        currency: 'KSH',
        monthlyAmount: '',
        message: '',
      })
    } catch (error) {
      console.error(error)
      setErrorMessage(
        error.message || 'Could not submit sponsorship application.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    fetchChild()
  }, [childId])

  return (
    <>
      <Navbar />

      <section className="section">
        <div className="container">
          <p className="eyebrow">Sponsorship Application</p>

          {loading && <p>Loading sponsorship form...</p>}

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}

          {!loading && child && (
            <>
              <h1>Sponsor {child.fullName}</h1>

              <p>
                Complete this form to apply to sponsor {child.fullName}. The
                application will be reviewed by the St Catherine House of Hope
                team before sponsorship is confirmed.
              </p>

              <section className="admin-quick-actions">
                <h3>Child Selected</h3>

                <div className="admin-card">
                  <div className="admin-card__header">
                    <div>
                      <h3>{child.fullName}</h3>
                      <p>
                        {child.age} years old • {child.gender}
                      </p>
                    </div>

                    <span className="status-badge status-badge--pending">
                      Needs Sponsor
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
                </div>
              </section>

              <form className="donation-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Your Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-grid">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                  />

                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-grid">
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                  >
                    <option value="KSH">KSH - Kenyan Shilling</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>

                  <input
                    type="number"
                    name="monthlyAmount"
                    placeholder="Monthly Sponsorship Amount"
                    value={formData.monthlyAmount}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>

                <textarea
                  name="message"
                  rows="5"
                  placeholder="Why would you like to sponsor this child?"
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>

                <button
                  className="btn btn--primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Submitting...'
                    : 'Submit Sponsorship Application'}
                </button>
              </form>

              <div className="admin-actions public-sponsor-actions">
                <Link className="btn btn--secondary" to="/gallery">
                  Back to Gallery
                </Link>

                <Link
                  className="btn btn--secondary"
                  to={`/sponsor-child/${child.id}`}
                >
                  Back to Child Profile
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

export default SponsorApplication