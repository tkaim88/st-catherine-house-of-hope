import { useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'

function Donate() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    currency: 'KSH',
    amount: '',
    donationType: 'one-time',
    message: '',
  })

  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (Number(formData.amount) <= 0) {
      setErrorMessage('Please enter a valid donation amount.')
      setSuccessMessage('')
      return
    }

    setIsSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const response = await fetch('http://localhost:5000/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit donation')
      }

      setSuccessMessage('Thank you. Your donation pledge has been recorded.')
      setErrorMessage('')

      setFormData({
        fullName: '',
        email: '',
        currency: 'KSH',
        amount: '',
        donationType: 'one-time',
        message: '',
      })
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not submit donation. Please try again.')
      setSuccessMessage('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />

      <section className="section">
        <div className="container">
          <div className="donate-layout">
            <div className="donate-content">
              <p className="eyebrow">Donate</p>
              <h1>Support Our Mission</h1>

              <p>
                Your contribution helps provide food, shelter, education,
                healthcare, and opportunities for vulnerable children.
              </p>

              <div className="donation-impact">
                <article>
                  <strong>KSH 1,000</strong>
                  <span>Can help provide meals and basic supplies.</span>
                </article>

                <article>
                  <strong>KSH 5,000</strong>
                  <span>Can support school materials and hygiene items.</span>
                </article>

                <article>
                  <strong>KSH 10,000+</strong>
                  <span>Can support healthcare, education, and shelter needs.</span>
                </article>
              </div>
            </div>

            <form className="donation-form" onSubmit={handleSubmit}>
              <h2>Donation Details</h2>

              {successMessage && (
                <p className="success-message">{successMessage}</p>
              )}

              {errorMessage && <p className="error-message">{errorMessage}</p>}

              <div className="form-grid">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-grid form-grid--amount">
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  required
                >
                  <option value="KSH">KSH - Kenyan Shilling</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>

                <input
                  type="number"
                  name="amount"
                  placeholder="Donation Amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              <select
                name="donationType"
                value={formData.donationType}
                onChange={handleChange}
              >
                <option value="one-time">One-Time Donation</option>
                <option value="monthly">Monthly Support</option>
                <option value="in-kind">In-Kind Donation</option>
              </select>

              <textarea
                name="message"
                rows="5"
                placeholder="Optional message"
                value={formData.message}
                onChange={handleChange}
              ></textarea>

              <button
                type="submit"
                className="btn btn--primary donation-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Donation'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default Donate