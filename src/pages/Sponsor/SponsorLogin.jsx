import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'

function SponsorLogin() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const response = await fetch(
        'https://st-catherine-house-of-hope-api.onrender.com/api/sponsor-auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      localStorage.setItem('sponsorToken', data.token)
      localStorage.setItem('sponsorUser', JSON.stringify(data.sponsor))

      navigate('/sponsor')
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Could not log in.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />

      <section className="section">
        <div className="container">
          <p className="eyebrow">Sponsor Portal</p>
          <h1>Sponsor Login</h1>

          <p className="mt-4">
            Access your sponsored child profile, sponsorship details, birthday
            reminders, and future progress updates.
          </p>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <form className="donation-form" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Sponsor Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Sponsor Password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>

            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Login to Sponsor Portal'}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default SponsorLogin