import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'

function AdminDonors() {
  const emptyForm = {
    fullName: '',
    email: '',
    phone: '',
    country: '',
    profileImage: '',
    preferredCurrency: 'KSH',
    donorType: 'individual',
    notes: '',
    status: 'active',
  }

  const [donors, setDonors] = useState([])
  const [selectedDonor, setSelectedDonor] = useState(null)
  const [editingDonor, setEditingDonor] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const totalDonors = donors.length
  const activeDonors = donors.filter((donor) => donor.status === 'active').length
  const inactiveDonors = donors.filter(
    (donor) => donor.status === 'inactive'
  ).length
  const individualDonors = donors.filter(
    (donor) => donor.donorType === 'individual'
  ).length
  const organizationDonors = donors.filter(
    (donor) => donor.donorType === 'organization'
  ).length

  const filteredDonors = donors.filter((donor) => {
    const searchValue = searchTerm.toLowerCase()

    return (
      donor.fullName?.toLowerCase().includes(searchValue) ||
      donor.email?.toLowerCase().includes(searchValue) ||
      donor.phone?.toLowerCase().includes(searchValue) ||
      donor.country?.toLowerCase().includes(searchValue) ||
      donor.donorType?.toLowerCase().includes(searchValue) ||
      donor.status?.toLowerCase().includes(searchValue)
    )
  })

  async function fetchDonors() {
    try {
      const response = await fetch('http://localhost:5000/api/donors')

      if (!response.ok) {
        throw new Error('Failed to load donors')
      }

      const data = await response.json()
      setDonors(data)
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not load donor records.')
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

  function resetForm() {
    setFormData(emptyForm)
    setEditingDonor(null)
  }

  function getDonorInitials(fullName) {
    if (!fullName) return 'DN'

    return fullName
      .split(' ')
      .map((namePart) => namePart[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  function startEditingDonor(donor) {
    setEditingDonor(donor)
    setSelectedDonor(null)

    setFormData({
      fullName: donor.fullName || '',
      email: donor.email || '',
      phone: donor.phone || '',
      country: donor.country || '',
      profileImage: donor.profileImage || '',
      preferredCurrency: donor.preferredCurrency || 'KSH',
      donorType: donor.donorType || 'individual',
      notes: donor.notes || '',
      status: donor.status || 'active',
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (editingDonor) {
      await updateDonor()
      return
    }

    await createDonor()
  }

  async function createDonor() {
    try {
      const response = await fetch('http://localhost:5000/api/donors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create donor')
      }

      setDonors((currentDonors) => [...currentDonors, data.data])
      setSuccessMessage('Donor record created successfully.')
      setErrorMessage('')
      resetForm()
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Could not create donor record.')
      setSuccessMessage('')
    }
  }

  async function updateDonor() {
    try {
      const response = await fetch(
        `http://localhost:5000/api/donors/${editingDonor.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update donor')
      }

      setDonors((currentDonors) =>
        currentDonors.map((donor) =>
          donor.id === data.data.id ? data.data : donor
        )
      )

      setSuccessMessage('Donor record updated successfully.')
      setErrorMessage('')
      resetForm()
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Could not update donor record.')
      setSuccessMessage('')
    }
  }

  async function deleteDonor(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this donor record?'
    )

    if (!confirmed) return

    try {
      const response = await fetch(`http://localhost:5000/api/donors/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete donor')
      }

      setDonors((currentDonors) =>
        currentDonors.filter((donor) => donor.id !== id)
      )

      if (selectedDonor?.id === id) {
        setSelectedDonor(null)
      }

      if (editingDonor?.id === id) {
        resetForm()
      }

      setSuccessMessage('Donor record deleted successfully.')
      setErrorMessage('')
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Could not delete donor record.')
      setSuccessMessage('')
    }
  }

  function getStatusClass(status) {
    if (status === 'active') return 'status-badge status-badge--approved'
    return 'status-badge status-badge--rejected'
  }

  function getDonorTypeLabel(type) {
    if (type === 'organization') return 'Organization'
    return 'Individual'
  }

  useEffect(() => {
    fetchDonors()
  }, [])

  return (
    <>
      <Navbar />

      <section className="section">
        <div className="container">
          <p className="eyebrow">Admin Dashboard</p>
          <h1>Donor Management</h1>

          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="admin-summary">
            <article className="summary-card">
              <span>Total Donors</span>
              <strong>{totalDonors}</strong>
            </article>

            <article className="summary-card">
              <span>Active Donors</span>
              <strong>{activeDonors}</strong>
            </article>

            <article className="summary-card">
              <span>Inactive Donors</span>
              <strong>{inactiveDonors}</strong>
            </article>

            <article className="summary-card">
              <span>Individuals</span>
              <strong>{individualDonors}</strong>
            </article>

            <article className="summary-card">
              <span>Organizations</span>
              <strong>{organizationDonors}</strong>
            </article>
          </div>

          <section className="admin-quick-actions">
            <div className="admin-card__header">
              <h3>{editingDonor ? 'Edit Donor Record' : 'Add Donor Record'}</h3>

              {editingDonor && (
                <button
                  className="btn btn--secondary"
                  type="button"
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form className="donation-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Donor Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Donor Email"
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

              <input
                type="text"
                name="profileImage"
                placeholder="Profile Image URL"
                value={formData.profileImage}
                onChange={handleChange}
              />

              <div className="form-grid">
                <select
                  name="preferredCurrency"
                  value={formData.preferredCurrency}
                  onChange={handleChange}
                >
                  <option value="KSH">KSH - Kenyan Shilling</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="EUR">EUR - Euro</option>
                </select>

                <select
                  name="donorType"
                  value={formData.donorType}
                  onChange={handleChange}
                >
                  <option value="individual">Individual</option>
                  <option value="organization">Organization</option>
                </select>
              </div>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <textarea
                name="notes"
                rows="4"
                placeholder="Donor Notes"
                value={formData.notes}
                onChange={handleChange}
              ></textarea>

              <button type="submit" className="btn btn--primary">
                {editingDonor ? 'Update Donor' : 'Add Donor'}
              </button>
            </form>
          </section>

          <div className="admin-search">
            <input
              type="text"
              placeholder="Search donors by name, email, phone, country, type, or status..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          {loading && <p>Loading donor records...</p>}

          {!loading && donors.length === 0 && <p>No donor records found.</p>}

          {!loading && donors.length > 0 && filteredDonors.length === 0 && (
            <p>No donors match your current search.</p>
          )}

          <div className="children-card-grid">
            {filteredDonors.map((donor) => (
              <article className="child-card" key={donor.id}>
                <button
                  className="child-card__image-button"
                  type="button"
                  onClick={() => setSelectedDonor(donor)}
                >
                  {donor.profileImage ? (
                    <img
                      src={donor.profileImage}
                      alt={donor.fullName}
                      className="child-card__image"
                    />
                  ) : (
                    <div className="child-card__placeholder">
                      {getDonorInitials(donor.fullName)}
                    </div>
                  )}
                </button>

                <div className="child-card__content">
                  <div className="admin-card__header">
                    <div>
                      <h3>{donor.fullName}</h3>
                      <p>{donor.email}</p>
                    </div>

                    <span className={getStatusClass(donor.status)}>
                      {donor.status}
                    </span>
                  </div>

                  <div className="admin-card__details">
                    <p>
                      <strong>Phone:</strong> {donor.phone || 'Not provided'}
                    </p>

                    <p>
                      <strong>Country:</strong>{' '}
                      {donor.country || 'Not provided'}
                    </p>

                    <p>
                      <strong>Type:</strong>{' '}
                      {getDonorTypeLabel(donor.donorType)}
                    </p>

                    <p>
                      <strong>Currency:</strong> {donor.preferredCurrency}
                    </p>
                  </div>

                  <div className="admin-actions">
                    <button
                      className="btn btn--primary"
                      type="button"
                      onClick={() => setSelectedDonor(donor)}
                    >
                      View Profile
                    </button>

                    <button
                      className="btn btn--secondary"
                      type="button"
                      onClick={() => startEditingDonor(donor)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn--danger"
                      type="button"
                      onClick={() => deleteDonor(donor.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {selectedDonor && (
        <div className="modal-overlay" onClick={() => setSelectedDonor(null)}>
          <div
            className="modal-content child-profile-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="child-profile-header">
              {selectedDonor.profileImage ? (
                <img
                  src={selectedDonor.profileImage}
                  alt={selectedDonor.fullName}
                  className="child-profile-image"
                />
              ) : (
                <div className="child-profile-placeholder">
                  {getDonorInitials(selectedDonor.fullName)}
                </div>
              )}

              <div>
                <p className="eyebrow">Donor Profile</p>
                <h2>{selectedDonor.fullName}</h2>
                <p>{selectedDonor.email}</p>
                <span className={getStatusClass(selectedDonor.status)}>
                  {selectedDonor.status}
                </span>
              </div>
            </div>

            <div className="child-profile-grid">
              <section>
                <h3>Contact Information</h3>

                <p>
                  <strong>Email:</strong> {selectedDonor.email}
                </p>

                <p>
                  <strong>Phone:</strong>{' '}
                  {selectedDonor.phone || 'Not provided'}
                </p>

                <p>
                  <strong>Country:</strong>{' '}
                  {selectedDonor.country || 'Not provided'}
                </p>
              </section>

              <section>
                <h3>Donor Information</h3>

                <p>
                  <strong>Donor Type:</strong>{' '}
                  {getDonorTypeLabel(selectedDonor.donorType)}
                </p>

                <p>
                  <strong>Preferred Currency:</strong>{' '}
                  {selectedDonor.preferredCurrency}
                </p>

                <p>
                  <strong>Status:</strong> {selectedDonor.status}
                </p>
              </section>

              <section>
                <h3>Record Details</h3>

                <p>
                  <strong>Created:</strong>{' '}
                  {selectedDonor.createdAt
                    ? new Date(selectedDonor.createdAt).toLocaleString()
                    : 'Not recorded'}
                </p>

                <p>
                  <strong>Updated:</strong>{' '}
                  {selectedDonor.updatedAt
                    ? new Date(selectedDonor.updatedAt).toLocaleString()
                    : 'Not updated yet'}
                </p>
              </section>

              <section className="child-profile-wide">
                <h3>Donor Notes</h3>
                <p>{selectedDonor.notes || 'No notes added yet.'}</p>
              </section>
            </div>

            <div className="admin-actions">
              <button
                className="btn btn--primary"
                type="button"
                onClick={() => setSelectedDonor(null)}
              >
                Close Profile
              </button>

              <button
                className="btn btn--secondary"
                type="button"
                onClick={() => startEditingDonor(selectedDonor)}
              >
                Edit Donor
              </button>

              <button
                className="btn btn--danger"
                type="button"
                onClick={() => deleteDonor(selectedDonor.id)}
              >
                Delete Donor
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}

export default AdminDonors