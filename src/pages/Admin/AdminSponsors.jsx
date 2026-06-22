import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'

function AdminSponsors() {
  const emptyForm = {
    fullName: '',
    email: '',
    phone: '',
    country: '',
    profileImage: '',
    childId: '',
    currency: 'KSH',
    monthlyAmount: '',
    notes: '',
    status: 'Active',
  }

  const [sponsors, setSponsors] = useState([])
  const [children, setChildren] = useState([])
  const [selectedSponsor, setSelectedSponsor] = useState(null)
  const [editingSponsor, setEditingSponsor] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [assignments, setAssignments] = useState({})
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const totalSponsors = sponsors.length

  const activeSponsors = sponsors.filter(
    (sponsor) => sponsor.status === 'Active'
  ).length

  const inactiveSponsors = sponsors.filter(
    (sponsor) => sponsor.status === 'Inactive'
  ).length

  const sponsoredChildren = children.filter(
    (child) => child.sponsor && child.sponsor !== 'None'
  ).length

  const unsponsoredChildren = children.filter(
    (child) => !child.sponsor || child.sponsor === 'None'
  ).length

  const availableChildren = children.filter(
    (child) => !child.sponsor || child.sponsor === 'None'
  )

  const filteredSponsors = sponsors.filter((sponsor) => {
    const searchValue = searchTerm.toLowerCase()

    return (
      sponsor.fullName?.toLowerCase().includes(searchValue) ||
      sponsor.email?.toLowerCase().includes(searchValue) ||
      sponsor.phone?.toLowerCase().includes(searchValue) ||
      sponsor.country?.toLowerCase().includes(searchValue) ||
      sponsor.childName?.toLowerCase().includes(searchValue) ||
      sponsor.status?.toLowerCase().includes(searchValue)
    )
  })

  function formatMoney(currency, amount) {
    return `${currency || 'N/A'} ${Number(amount || 0).toLocaleString(
      'en-US',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`
  }

  function getSponsorInitials(fullName) {
    if (!fullName) return 'SP'

    return fullName
      .split(' ')
      .map((namePart) => namePart[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  function getStatusClass(status) {
    if (status === 'Active') return 'status-badge status-badge--approved'
    return 'status-badge status-badge--rejected'
  }

  async function fetchData() {
    try {
      const [sponsorsResponse, childrenResponse] = await Promise.all([
        fetch('https://st-catherine-house-of-hope-api.onrender.com/api/sponsors'),
        fetch('https://st-catherine-house-of-hope-api.onrender.com/api/children'),
      ])

      if (!sponsorsResponse.ok || !childrenResponse.ok) {
        throw new Error('Failed to load sponsorship data')
      }

      const sponsorsData = await sponsorsResponse.json()
      const childrenData = await childrenResponse.json()

      setSponsors(sponsorsData)
      setChildren(childrenData)
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not load sponsorship data.')
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
    setEditingSponsor(null)
  }

  function startEditingSponsor(sponsor) {
    setEditingSponsor(sponsor)
    setSelectedSponsor(null)

    setFormData({
      fullName: sponsor.fullName || '',
      email: sponsor.email || '',
      phone: sponsor.phone || '',
      country: sponsor.country || '',
      profileImage: sponsor.profileImage || '',
      childId: sponsor.childId || '',
      currency: sponsor.currency || 'KSH',
      monthlyAmount: sponsor.monthlyAmount || '',
      notes: sponsor.notes || '',
      status: sponsor.status || 'Active',
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function handleAssignmentChange(sponsorId, childId) {
    setAssignments((currentAssignments) => ({
      ...currentAssignments,
      [sponsorId]: childId,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (editingSponsor) {
      await updateSponsor()
      return
    }

    await createSponsor()
  }

  async function createSponsor() {
    try {
      const response = await fetch('https://st-catherine-house-of-hope-api.onrender.com/api/sponsors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          monthlyAmount: Number(formData.monthlyAmount),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add sponsor')
      }

      setSponsors((currentSponsors) => [...currentSponsors, data.data])

      if (formData.childId) {
        setChildren((currentChildren) =>
          currentChildren.map((child) =>
            Number(child.id) === Number(formData.childId)
              ? {
                  ...child,
                  sponsor: data.data.fullName,
                  sponsorId: data.data.id,
                }
              : child
          )
        )
      }

      setSuccessMessage('Sponsor added successfully.')
      setErrorMessage('')
      resetForm()
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Could not add sponsor.')
      setSuccessMessage('')
    }
  }

  async function updateSponsor() {
    try {
      const response = await fetch(
        `https://st-catherine-house-of-hope-api.onrender.com/api/sponsors/${editingSponsor.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            country: formData.country,
            profileImage: formData.profileImage,
            currency: formData.currency,
            monthlyAmount: Number(formData.monthlyAmount),
            notes: formData.notes,
            status: formData.status,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update sponsor')
      }

      setSponsors((currentSponsors) =>
        currentSponsors.map((sponsor) =>
          sponsor.id === data.data.id ? data.data : sponsor
        )
      )

      setSuccessMessage('Sponsor updated successfully.')
      setErrorMessage('')
      resetForm()
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Could not update sponsor.')
      setSuccessMessage('')
    }
  }

  async function assignSponsorToChild(sponsor) {
    const childId = assignments[sponsor.id]

    if (!childId) {
      setErrorMessage('Please select a child before assigning.')
      setSuccessMessage('')
      return
    }

    try {
      const response = await fetch(
        `https://st-catherine-house-of-hope-api.onrender.com/api/sponsors/${sponsor.id}/assign-child`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ childId }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to assign sponsor')
      }

      const assignedChild = children.find(
        (child) => Number(child.id) === Number(childId)
      )

      setSponsors((currentSponsors) =>
        currentSponsors.map((item) =>
          item.id === sponsor.id
            ? {
                ...item,
                childId: Number(childId),
                childName: assignedChild?.fullName || 'Assigned Child',
              }
            : item
        )
      )

      setChildren((currentChildren) =>
        currentChildren.map((child) =>
          Number(child.id) === Number(childId)
            ? {
                ...child,
                sponsor: sponsor.fullName,
                sponsorId: sponsor.id,
              }
            : child
        )
      )

      setAssignments((currentAssignments) => ({
        ...currentAssignments,
        [sponsor.id]: '',
      }))

      setSuccessMessage('Sponsor assigned to child successfully.')
      setErrorMessage('')
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Could not assign sponsor.')
      setSuccessMessage('')
    }
  }

  async function deleteSponsor(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this sponsor record?'
    )

    if (!confirmed) return

    try {
      const response = await fetch(`https://st-catherine-house-of-hope-api.onrender.com/api/sponsors/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete sponsor')
      }

      const deletedSponsor = sponsors.find((sponsor) => sponsor.id === id)

      setSponsors((currentSponsors) =>
        currentSponsors.filter((sponsor) => sponsor.id !== id)
      )

      setChildren((currentChildren) =>
        currentChildren.map((child) =>
          Number(child.sponsorId) === Number(id) ||
          child.sponsor === deletedSponsor?.fullName
            ? {
                ...child,
                sponsor: 'None',
                sponsorId: null,
              }
            : child
        )
      )

      if (selectedSponsor?.id === id) {
        setSelectedSponsor(null)
      }

      if (editingSponsor?.id === id) {
        resetForm()
      }

      setSuccessMessage('Sponsor record deleted.')
      setErrorMessage('')
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Could not delete sponsor record.')
      setSuccessMessage('')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <>
      <Navbar />

      <section className="section">
        <div className="container">
          <p className="eyebrow">Admin Dashboard</p>
          <h1>Sponsorship Management</h1>

          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="admin-summary">
            <article className="summary-card">
              <span>Total Sponsors</span>
              <strong>{totalSponsors}</strong>
            </article>

            <article className="summary-card">
              <span>Active Sponsors</span>
              <strong>{activeSponsors}</strong>
            </article>

            <article className="summary-card">
              <span>Inactive Sponsors</span>
              <strong>{inactiveSponsors}</strong>
            </article>

            <article className="summary-card">
              <span>Sponsored Children</span>
              <strong>{sponsoredChildren}</strong>
            </article>

            <article className="summary-card">
              <span>Need Sponsors</span>
              <strong>{unsponsoredChildren}</strong>
            </article>
          </div>

          <section className="admin-quick-actions">
            <div className="admin-card__header">
              <h3>{editingSponsor ? 'Edit Sponsor' : 'Add Sponsor'}</h3>

              {editingSponsor && (
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
                  placeholder="Sponsor Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Sponsor Email"
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
                  name="childId"
                  value={formData.childId}
                  onChange={handleChange}
                  disabled={Boolean(editingSponsor)}
                >
                  <option value="">Assign to Child</option>

                  {availableChildren.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.fullName}
                    </option>
                  ))}
                </select>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
                name="notes"
                rows="4"
                placeholder="Sponsor Notes"
                value={formData.notes}
                onChange={handleChange}
              ></textarea>

              <button type="submit" className="btn btn--primary">
                {editingSponsor ? 'Update Sponsor' : 'Add Sponsor'}
              </button>
            </form>
          </section>

          <div className="admin-search">
            <input
              type="text"
              placeholder="Search sponsors by name, email, phone, country, child, or status..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          {loading && <p>Loading sponsors...</p>}

          {!loading && sponsors.length === 0 && (
            <p>No sponsor records found.</p>
          )}

          {!loading && sponsors.length > 0 && filteredSponsors.length === 0 && (
            <p>No sponsors match your current search.</p>
          )}

          <div className="children-card-grid">
            {filteredSponsors.map((sponsor) => (
              <article className="child-card" key={sponsor.id}>
                <button
                  className="child-card__image-button"
                  type="button"
                  onClick={() => setSelectedSponsor(sponsor)}
                >
                  {sponsor.profileImage ? (
                    <img
                      src={sponsor.profileImage}
                      alt={sponsor.fullName}
                      className="child-card__image"
                    />
                  ) : (
                    <div className="child-card__placeholder">
                      {getSponsorInitials(sponsor.fullName)}
                    </div>
                  )}
                </button>

                <div className="child-card__content">
                  <div className="admin-card__header">
                    <div>
                      <h3>{sponsor.fullName}</h3>
                      <p>{sponsor.email}</p>
                    </div>

                    <span className={getStatusClass(sponsor.status)}>
                      {sponsor.status}
                    </span>
                  </div>

                  <div className="admin-card__details">
                    <p>
                      <strong>Phone:</strong>{' '}
                      {sponsor.phone || 'Not provided'}
                    </p>

                    <p>
                      <strong>Country:</strong>{' '}
                      {sponsor.country || 'Not provided'}
                    </p>

                    <p>
                      <strong>Child Sponsored:</strong>{' '}
                      {sponsor.childName || 'Unassigned'}
                    </p>

                    <p>
                      <strong>Monthly Amount:</strong>{' '}
                      {formatMoney(sponsor.currency, sponsor.monthlyAmount)}
                    </p>

                    <p>
                      <strong>Added:</strong>{' '}
                      {sponsor.createdAt
                        ? new Date(sponsor.createdAt).toLocaleString()
                        : 'Not recorded'}
                    </p>
                  </div>

                  {!sponsor.childId && availableChildren.length > 0 && (
                    <div className="admin-actions">
                      <select
                        value={assignments[sponsor.id] || ''}
                        onChange={(event) =>
                          handleAssignmentChange(sponsor.id, event.target.value)
                        }
                      >
                        <option value="">Assign Child</option>

                        {availableChildren.map((child) => (
                          <option key={child.id} value={child.id}>
                            {child.fullName}
                          </option>
                        ))}
                      </select>

                      <button
                        className="btn btn--secondary"
                        type="button"
                        onClick={() => assignSponsorToChild(sponsor)}
                      >
                        Assign
                      </button>
                    </div>
                  )}

                  <div className="admin-actions">
                    <button
                      className="btn btn--primary"
                      type="button"
                      onClick={() => setSelectedSponsor(sponsor)}
                    >
                      View Profile
                    </button>

                    <button
                      className="btn btn--secondary"
                      type="button"
                      onClick={() => startEditingSponsor(sponsor)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn--danger"
                      type="button"
                      onClick={() => deleteSponsor(sponsor.id)}
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

      {selectedSponsor && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedSponsor(null)}
        >
          <div
            className="modal-content child-profile-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="child-profile-header">
              {selectedSponsor.profileImage ? (
                <img
                  src={selectedSponsor.profileImage}
                  alt={selectedSponsor.fullName}
                  className="child-profile-image"
                />
              ) : (
                <div className="child-profile-placeholder">
                  {getSponsorInitials(selectedSponsor.fullName)}
                </div>
              )}

              <div>
                <p className="eyebrow">Sponsor Profile</p>
                <h2>{selectedSponsor.fullName}</h2>
                <p>{selectedSponsor.email}</p>
                <span className={getStatusClass(selectedSponsor.status)}>
                  {selectedSponsor.status}
                </span>
              </div>
            </div>

            <div className="child-profile-grid">
              <section>
                <h3>Contact Information</h3>

                <p>
                  <strong>Email:</strong> {selectedSponsor.email}
                </p>

                <p>
                  <strong>Phone:</strong>{' '}
                  {selectedSponsor.phone || 'Not provided'}
                </p>

                <p>
                  <strong>Country:</strong>{' '}
                  {selectedSponsor.country || 'Not provided'}
                </p>
              </section>

              <section>
                <h3>Sponsorship Details</h3>

                <p>
                  <strong>Child Sponsored:</strong>{' '}
                  {selectedSponsor.childName || 'Unassigned'}
                </p>

                <p>
                  <strong>Monthly Amount:</strong>{' '}
                  {formatMoney(
                    selectedSponsor.currency,
                    selectedSponsor.monthlyAmount
                  )}
                </p>

                <p>
                  <strong>Status:</strong> {selectedSponsor.status}
                </p>
              </section>

              <section>
                <h3>Record Details</h3>

                <p>
                  <strong>Created:</strong>{' '}
                  {selectedSponsor.createdAt
                    ? new Date(selectedSponsor.createdAt).toLocaleString()
                    : 'Not recorded'}
                </p>

                <p>
                  <strong>Updated:</strong>{' '}
                  {selectedSponsor.updatedAt
                    ? new Date(selectedSponsor.updatedAt).toLocaleString()
                    : 'Not updated yet'}
                </p>
              </section>

              <section className="child-profile-wide">
                <h3>Sponsor Notes</h3>
                <p>{selectedSponsor.notes || 'No notes added yet.'}</p>
              </section>
            </div>

            <div className="admin-actions">
              <button
                className="btn btn--primary"
                type="button"
                onClick={() => setSelectedSponsor(null)}
              >
                Close Profile
              </button>

              <button
                className="btn btn--secondary"
                type="button"
                onClick={() => startEditingSponsor(selectedSponsor)}
              >
                Edit Sponsor
              </button>

              <button
                className="btn btn--danger"
                type="button"
                onClick={() => deleteSponsor(selectedSponsor.id)}
              >
                Delete Sponsor
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}

export default AdminSponsors