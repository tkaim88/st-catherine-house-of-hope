import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'

function AdminChildren() {
  const emptyForm = {
    fullName: '',
    age: '',
    gender: 'Female',
    profileImage: '',
    dateOfBirth: '',
    admissionDate: '',
    school: '',
    grade: '',
    educationNotes: '',
    sponsor: '',
    medicalNotes: '',
    allergies: '',
    bloodType: '',
    emergencyContact: '',
    biography: '',
    status: 'Active',
  }

  const [children, setChildren] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [editingChild, setEditingChild] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState(emptyForm)

  const totalChildren = children.length

  const boysCount = children.filter((child) => child.gender === 'Male').length

  const girlsCount = children.filter(
    (child) => child.gender === 'Female'
  ).length

  const sponsoredCount = children.filter(
    (child) => child.sponsor && child.sponsor !== 'None'
  ).length

  const unsponsoredCount = children.filter(
    (child) => !child.sponsor || child.sponsor === 'None'
  ).length

  const filteredChildren = children.filter((child) => {
    const searchValue = searchTerm.toLowerCase()

    return (
      child.fullName?.toLowerCase().includes(searchValue) ||
      child.school?.toLowerCase().includes(searchValue) ||
      child.grade?.toLowerCase().includes(searchValue) ||
      child.sponsor?.toLowerCase().includes(searchValue) ||
      child.status?.toLowerCase().includes(searchValue)
    )
  })

  async function fetchChildrenAndSponsors() {
    try {
      const [childrenResponse, sponsorsResponse] = await Promise.all([
        fetch('http://localhost:3001/children'),
        fetch('http://localhost:5000/api/sponsors'),
      ])

      if (!childrenResponse.ok || !sponsorsResponse.ok) {
        throw new Error('Failed to load children or sponsors')
      }

      const childrenData = await childrenResponse.json()
      const sponsorsData = await sponsorsResponse.json()

      setChildren(childrenData)
      setSponsors(sponsorsData)
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not load children records.')
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
    setEditingChild(null)
  }

  function startEditingChild(child) {
    setEditingChild(child)
    setSelectedChild(null)

    setFormData({
      fullName: child.fullName || '',
      age: child.age || '',
      gender: child.gender || 'Female',
      profileImage: child.profileImage || '',
      dateOfBirth: child.dateOfBirth || '',
      admissionDate: child.admissionDate || '',
      school: child.school || '',
      grade: child.grade || '',
      educationNotes: child.educationNotes || '',
      sponsor: child.sponsor || '',
      medicalNotes: child.medicalNotes || '',
      allergies: child.allergies || '',
      bloodType: child.bloodType || '',
      emergencyContact: child.emergencyContact || '',
      biography: child.biography || '',
      status: child.status || 'Active',
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const childPayload = {
      ...formData,
      age: Number(formData.age),
      sponsor: formData.sponsor || 'None',
      profileImage: formData.profileImage || '',
    }

    if (editingChild) {
      await updateChild(childPayload)
      return
    }

    await createChild(childPayload)
  }

  async function createChild(childPayload) {
    const newChild = {
      ...childPayload,
      createdAt: new Date().toISOString(),
    }

    try {
      const response = await fetch('http://localhost:3001/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newChild),
      })

      if (!response.ok) {
        throw new Error('Failed to add child')
      }

      const savedChild = await response.json()

      setChildren((currentChildren) => [...currentChildren, savedChild])
      setSuccessMessage('Child record added successfully.')
      setErrorMessage('')
      resetForm()
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not add child record.')
      setSuccessMessage('')
    }
  }

  async function updateChild(childPayload) {
    const updatedChild = {
      ...editingChild,
      ...childPayload,
      updatedAt: new Date().toISOString(),
    }

    try {
      const response = await fetch(
        `http://localhost:3001/children/${editingChild.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedChild),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update child')
      }

      const savedChild = await response.json()

      setChildren((currentChildren) =>
        currentChildren.map((child) =>
          child.id === savedChild.id ? savedChild : child
        )
      )

      setSuccessMessage('Child record updated successfully.')
      setErrorMessage('')
      resetForm()
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not update child record.')
      setSuccessMessage('')
    }
  }

  async function deleteChild(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this child record?'
    )

    if (!confirmed) return

    try {
      const response = await fetch(`http://localhost:3001/children/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete child')
      }

      setChildren((currentChildren) =>
        currentChildren.filter((child) => child.id !== id)
      )

      if (selectedChild?.id === id) {
        setSelectedChild(null)
      }

      if (editingChild?.id === id) {
        resetForm()
      }

      setSuccessMessage('Child record deleted.')
      setErrorMessage('')
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not delete child record.')
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

  function getSponsorStatusClass(child) {
    if (child.sponsor && child.sponsor !== 'None') {
      return 'status-badge status-badge--approved'
    }

    return 'status-badge status-badge--pending'
  }

  function findLinkedSponsor(child) {
    if (!child) return null

    if (child.sponsorId) {
      return sponsors.find(
        (sponsor) => Number(sponsor.id) === Number(child.sponsorId)
      )
    }

    return sponsors.find(
      (sponsor) =>
        sponsor.fullName?.toLowerCase() === child.sponsor?.toLowerCase()
    )
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

  useEffect(() => {
    fetchChildrenAndSponsors()
  }, [])

  const selectedChildSponsor = findLinkedSponsor(selectedChild)

  return (
    <>
      <Navbar />

      <section className="section">
        <div className="container">
          <p className="eyebrow">Admin Dashboard</p>
          <h1>Children Management</h1>

          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="admin-summary">
            <article className="summary-card">
              <span>Total Children</span>
              <strong>{totalChildren}</strong>
            </article>

            <article className="summary-card">
              <span>Boys</span>
              <strong>{boysCount}</strong>
            </article>

            <article className="summary-card">
              <span>Girls</span>
              <strong>{girlsCount}</strong>
            </article>

            <article className="summary-card">
              <span>Sponsored</span>
              <strong>{sponsoredCount}</strong>
            </article>

            <article className="summary-card">
              <span>Unsponsored</span>
              <strong>{unsponsoredCount}</strong>
            </article>
          </div>

          <section className="admin-quick-actions">
            <div className="admin-card__header">
              <h3>{editingChild ? 'Edit Child Record' : 'Add Child Record'}</h3>

              {editingChild && (
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
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />

                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={formData.age}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>

              <div className="form-grid">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <input
                type="text"
                name="profileImage"
                placeholder="Profile Image URL"
                value={formData.profileImage}
                onChange={handleChange}
              />

              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="admissionDate">Admission Date</label>
                  <input
                    id="admissionDate"
                    type="date"
                    name="admissionDate"
                    value={formData.admissionDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-grid">
                <input
                  type="text"
                  name="school"
                  placeholder="School"
                  value={formData.school}
                  onChange={handleChange}
                  required
                />

                <input
                  type="text"
                  name="grade"
                  placeholder="Grade / Class"
                  value={formData.grade}
                  onChange={handleChange}
                  required
                />
              </div>

              <textarea
                name="educationNotes"
                rows="3"
                placeholder="Education Notes"
                value={formData.educationNotes}
                onChange={handleChange}
              ></textarea>

              <input
                type="text"
                name="sponsor"
                placeholder="Sponsor Name or None"
                value={formData.sponsor}
                onChange={handleChange}
              />

              <div className="form-grid">
                <input
                  type="text"
                  name="bloodType"
                  placeholder="Blood Type"
                  value={formData.bloodType}
                  onChange={handleChange}
                />

                <input
                  type="text"
                  name="allergies"
                  placeholder="Allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                />
              </div>

              <textarea
                name="medicalNotes"
                rows="4"
                placeholder="Medical Notes"
                value={formData.medicalNotes}
                onChange={handleChange}
              ></textarea>

              <input
                type="text"
                name="emergencyContact"
                placeholder="Emergency Contact"
                value={formData.emergencyContact}
                onChange={handleChange}
              />

              <textarea
                name="biography"
                rows="4"
                placeholder="Child Biography / Background Notes"
                value={formData.biography}
                onChange={handleChange}
              ></textarea>

              <button type="submit" className="btn btn--primary">
                {editingChild ? 'Update Child' : 'Add Child'}
              </button>
            </form>
          </section>

          <div className="admin-search">
            <input
              type="text"
              placeholder="Search children by name, school, grade, sponsor, or status..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          {loading && <p>Loading children records...</p>}

          {!loading && children.length === 0 && (
            <p>No children records found.</p>
          )}

          {!loading &&
            children.length > 0 &&
            filteredChildren.length === 0 && (
              <p>No children match your current search.</p>
            )}

          <div className="children-card-grid">
            {filteredChildren.map((child) => {
              const linkedSponsor = findLinkedSponsor(child)

              return (
                <article className="child-card" key={child.id}>
                  <button
                    className="child-card__image-button"
                    type="button"
                    onClick={() => setSelectedChild(child)}
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
                  </button>

                  <div className="child-card__content">
                    <div className="admin-card__header">
                      <div>
                        <h3>{child.fullName}</h3>
                        <p>
                          {child.age} years old • {child.gender}
                        </p>
                      </div>

                      <span className="status-badge status-badge--approved">
                        {child.status}
                      </span>
                    </div>

                    <div className="admin-card__details">
                      <p>
                        <strong>School:</strong> {child.school}
                      </p>

                      <p>
                        <strong>Grade:</strong> {child.grade}
                      </p>

                      <p>
                        <strong>Sponsor:</strong>{' '}
                        {linkedSponsor
                          ? `${linkedSponsor.fullName} (${formatMoney(
                              linkedSponsor.currency,
                              linkedSponsor.monthlyAmount
                            )}/month)`
                          : child.sponsor || 'None'}
                      </p>
                    </div>

                    <div className="admin-actions">
                      <span className={getSponsorStatusClass(child)}>
                        {getSponsorStatus(child)}
                      </span>

                      <button
                        className="btn btn--primary"
                        type="button"
                        onClick={() => setSelectedChild(child)}
                      >
                        View Profile
                      </button>

                      <button
                        className="btn btn--secondary"
                        type="button"
                        onClick={() => startEditingChild(child)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn--danger"
                        type="button"
                        onClick={() => deleteChild(child.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {selectedChild && (
        <div className="modal-overlay" onClick={() => setSelectedChild(null)}>
          <div
            className="modal-content child-profile-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="child-profile-header">
              {selectedChild.profileImage ? (
                <img
                  src={selectedChild.profileImage}
                  alt={selectedChild.fullName}
                  className="child-profile-image"
                />
              ) : (
                <div className="child-profile-placeholder">
                  {getChildInitials(selectedChild.fullName)}
                </div>
              )}

              <div>
                <p className="eyebrow">Child Profile</p>
                <h2>{selectedChild.fullName}</h2>
                <p>
                  {selectedChild.age} years old • {selectedChild.gender}
                </p>
                <span className={getSponsorStatusClass(selectedChild)}>
                  {getSponsorStatus(selectedChild)}
                </span>
              </div>
            </div>

            <div className="child-profile-grid">
              <section>
                <h3>Personal Information</h3>

                <p>
                  <strong>Status:</strong> {selectedChild.status}
                </p>

                <p>
                  <strong>Date of Birth:</strong>{' '}
                  {selectedChild.dateOfBirth || 'Not recorded'}
                </p>

                <p>
                  <strong>Admission Date:</strong>{' '}
                  {selectedChild.admissionDate || 'Not recorded'}
                </p>

                <p>
                  <strong>Emergency Contact:</strong>{' '}
                  {selectedChild.emergencyContact || 'Not recorded'}
                </p>
              </section>

              <section>
                <h3>Education</h3>

                <p>
                  <strong>School:</strong> {selectedChild.school}
                </p>

                <p>
                  <strong>Grade:</strong> {selectedChild.grade}
                </p>

                <p>
                  <strong>Education Notes:</strong>{' '}
                  {selectedChild.educationNotes || 'No education notes added'}
                </p>
              </section>

              <section>
                <h3>Medical Information</h3>

                <p>
                  <strong>Blood Type:</strong>{' '}
                  {selectedChild.bloodType || 'Not recorded'}
                </p>

                <p>
                  <strong>Allergies:</strong>{' '}
                  {selectedChild.allergies || 'Not recorded'}
                </p>

                <p>
                  <strong>Medical Notes:</strong>{' '}
                  {selectedChild.medicalNotes || 'No notes provided'}
                </p>
              </section>

              <section>
                <h3>Sponsorship</h3>

                {selectedChildSponsor ? (
                  <>
                    <p>
                      <strong>Sponsor:</strong>{' '}
                      {selectedChildSponsor.fullName}
                    </p>

                    <p>
                      <strong>Email:</strong> {selectedChildSponsor.email}
                    </p>

                    <p>
                      <strong>Phone:</strong>{' '}
                      {selectedChildSponsor.phone || 'Not provided'}
                    </p>

                    <p>
                      <strong>Country:</strong>{' '}
                      {selectedChildSponsor.country || 'Not provided'}
                    </p>

                    <p>
                      <strong>Monthly Support:</strong>{' '}
                      {formatMoney(
                        selectedChildSponsor.currency,
                        selectedChildSponsor.monthlyAmount
                      )}
                    </p>

                    <p>
                      <strong>Sponsorship Status:</strong>{' '}
                      {selectedChildSponsor.status}
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>Sponsor:</strong>{' '}
                      {selectedChild.sponsor || 'None'}
                    </p>

                    <p>
                      <strong>Sponsor Status:</strong>{' '}
                      {getSponsorStatus(selectedChild)}
                    </p>

                    <p>
                      <strong>Linked Sponsor Record:</strong> Not linked yet
                    </p>
                  </>
                )}
              </section>

              <section className="child-profile-wide">
                <h3>Biography / Background Notes</h3>

                <p>{selectedChild.biography || 'No biography added yet.'}</p>
              </section>
            </div>

            <div className="admin-actions">
              <button
                className="btn btn--primary"
                type="button"
                onClick={() => setSelectedChild(null)}
              >
                Close Profile
              </button>

              <button
                className="btn btn--secondary"
                type="button"
                onClick={() => startEditingChild(selectedChild)}
              >
                Edit Child
              </button>

              <button
                className="btn btn--danger"
                type="button"
                onClick={() => deleteChild(selectedChild.id)}
              >
                Delete Child
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}

export default AdminChildren