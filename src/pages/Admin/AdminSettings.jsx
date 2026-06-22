import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'

function AdminSettings() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
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

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage('New password and confirmation password do not match.')
      setSuccessMessage('')
      return
    }

    if (formData.newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.')
      setSuccessMessage('')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const adminUser = JSON.parse(localStorage.getItem('adminUser'))

      const response = await fetch(
        'https://st-catherine-house-of-hope-api.onrender.com/api/auth/change-password',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: adminUser.email,
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password.')
      }

      setSuccessMessage('Password changed successfully. Please log in again.')
      setErrorMessage('')

      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')

      setTimeout(() => {
        navigate('/admin-login')
      }, 1500)
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Could not change password.')
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
          <p className="eyebrow">Admin Dashboard</p>
          <h1>Admin Settings</h1>

          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <form className="donation-form" onSubmit={handleSubmit}>
            <input
              type="password"
              name="currentPassword"
              placeholder="Current Password"
              value={formData.currentPassword}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default AdminSettings