import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'

function AdminSponsorshipPayments() {
  const emptyForm = {
    sponsorId: '',
    childId: '',
    amount: '',
    currency: 'KSH',
    paymentMethod: 'Manual',
    paymentReference: '',
    paymentDate: '',
    status: 'paid',
    notes: '',
  }

  const [payments, setPayments] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [children, setChildren] = useState([])
  const [formData, setFormData] = useState(emptyForm)
  const [editingPayment, setEditingPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const totalPayments = payments.length

  const paidPayments = payments.filter(
    (payment) => payment.status === 'paid'
  ).length

  const pendingPayments = payments.filter(
    (payment) => payment.status === 'pending'
  ).length

  const failedPayments = payments.filter(
    (payment) => payment.status === 'failed'
  ).length

  const totalAmount = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  )

  const filteredPayments = payments.filter((payment) => {
    const searchValue = searchTerm.toLowerCase()

    return (
      payment.sponsorName?.toLowerCase().includes(searchValue) ||
      payment.childName?.toLowerCase().includes(searchValue) ||
      payment.paymentMethod?.toLowerCase().includes(searchValue) ||
      payment.paymentReference?.toLowerCase().includes(searchValue) ||
      payment.status?.toLowerCase().includes(searchValue)
    )
  })

  async function fetchData() {
    try {
      const [paymentsResponse, sponsorsResponse, childrenResponse] =
        await Promise.all([
          fetch('https://st-catherine-house-of-hope-api.onrender.com/api/sponsorship-payments'),
          fetch('https://st-catherine-house-of-hope-api.onrender.com/api/sponsors'),
          fetch('https://st-catherine-house-of-hope-api.onrender.com/api/children'),
        ])

      if (
        !paymentsResponse.ok ||
        !sponsorsResponse.ok ||
        !childrenResponse.ok
      ) {
        throw new Error('Failed to load sponsorship payment data')
      }

      const paymentsData = await paymentsResponse.json()
      const sponsorsData = await sponsorsResponse.json()
      const childrenData = await childrenResponse.json()

      setPayments(paymentsData)
      setSponsors(sponsorsData)
      setChildren(childrenData)
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not load sponsorship payment data.')
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
    setEditingPayment(null)
  }

  function startEditingPayment(payment) {
    setEditingPayment(payment)

    setFormData({
      sponsorId: payment.sponsorId || '',
      childId: payment.childId || '',
      amount: payment.amount || '',
      currency: payment.currency || 'KSH',
      paymentMethod: payment.paymentMethod || 'Manual',
      paymentReference: payment.paymentReference || '',
      paymentDate: payment.paymentDate
        ? payment.paymentDate.slice(0, 10)
        : '',
      status: payment.status || 'paid',
      notes: payment.notes || '',
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function findSponsor(id) {
    return sponsors.find((sponsor) => Number(sponsor.id) === Number(id))
  }

  function findChild(id) {
    return children.find((child) => Number(child.id) === Number(id))
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

  async function handleSubmit(event) {
    event.preventDefault()

    if (editingPayment) {
      await updatePayment()
      return
    }

    await createPayment()
  }

  async function createPayment() {
    const sponsor = findSponsor(formData.sponsorId)
    const child = findChild(formData.childId)

    if (!sponsor || !child) {
      setErrorMessage('Please select both a sponsor and a child.')
      setSuccessMessage('')
      return
    }

    try {
      const response = await fetch(
        'https://st-catherine-house-of-hope-api.onrender.com/api/sponsorship-payments',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sponsorId: sponsor.id,
            sponsorName: sponsor.fullName,
            childId: child.id,
            childName: child.fullName,
            amount: Number(formData.amount),
            currency: formData.currency,
            paymentMethod: formData.paymentMethod,
            paymentReference: formData.paymentReference,
            paymentDate: formData.paymentDate || new Date().toISOString(),
            status: formData.status,
            notes: formData.notes,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to record payment')
      }

      setPayments((currentPayments) => [...currentPayments, data.data])
      setSuccessMessage('Sponsorship payment recorded successfully.')
      setErrorMessage('')
      resetForm()
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Could not record payment.')
      setSuccessMessage('')
    }
  }

  async function updatePayment() {
    const sponsor = findSponsor(formData.sponsorId)
    const child = findChild(formData.childId)

    try {
      const response = await fetch(
        `https://st-catherine-house-of-hope-api.onrender.com/api/sponsorship-payments/${editingPayment.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sponsorId: Number(formData.sponsorId),
            sponsorName: sponsor?.fullName || editingPayment.sponsorName,
            childId: Number(formData.childId),
            childName: child?.fullName || editingPayment.childName,
            amount: Number(formData.amount),
            currency: formData.currency,
            paymentMethod: formData.paymentMethod,
            paymentReference: formData.paymentReference,
            paymentDate: formData.paymentDate || editingPayment.paymentDate,
            status: formData.status,
            notes: formData.notes,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update payment')
      }

      setPayments((currentPayments) =>
        currentPayments.map((payment) =>
          payment.id === data.data.id ? data.data : payment
        )
      )

      setSuccessMessage('Sponsorship payment updated successfully.')
      setErrorMessage('')
      resetForm()
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Could not update payment.')
      setSuccessMessage('')
    }
  }

  async function deletePayment(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this sponsorship payment?'
    )

    if (!confirmed) return

    try {
      const response = await fetch(
        `https://st-catherine-house-of-hope-api.onrender.com/api/sponsorship-payments/${id}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete payment')
      }

      setPayments((currentPayments) =>
        currentPayments.filter((payment) => payment.id !== id)
      )

      if (editingPayment?.id === id) {
        resetForm()
      }

      setSuccessMessage('Sponsorship payment deleted successfully.')
      setErrorMessage('')
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Could not delete payment.')
      setSuccessMessage('')
    }
  }

  function getStatusClass(status) {
    if (status === 'paid') return 'status-badge status-badge--approved'
    if (status === 'pending') return 'status-badge status-badge--pending'
    return 'status-badge status-badge--rejected'
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
          <h1>Sponsorship Payments</h1>

          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="admin-summary">
            <article className="summary-card">
              <span>Total Payments</span>
              <strong>{totalPayments}</strong>
            </article>

            <article className="summary-card">
              <span>Paid</span>
              <strong>{paidPayments}</strong>
            </article>

            <article className="summary-card">
              <span>Pending</span>
              <strong>{pendingPayments}</strong>
            </article>

            <article className="summary-card">
              <span>Failed</span>
              <strong>{failedPayments}</strong>
            </article>

            <article className="summary-card">
              <span>Total Recorded</span>
              <strong>{formatMoney('KSH', totalAmount)}</strong>
            </article>
          </div>

          <section className="admin-quick-actions">
            <div className="admin-card__header">
              <h3>
                {editingPayment
                  ? 'Edit Sponsorship Payment'
                  : 'Record Sponsorship Payment'}
              </h3>

              {editingPayment && (
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
                <select
                  name="sponsorId"
                  value={formData.sponsorId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Sponsor</option>

                  {sponsors.map((sponsor) => (
                    <option key={sponsor.id} value={sponsor.id}>
                      {sponsor.fullName}
                    </option>
                  ))}
                </select>

                <select
                  name="childId"
                  value={formData.childId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Child</option>

                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.fullName}
                    </option>
                  ))}
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
                  name="amount"
                  placeholder="Payment Amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-grid">
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="Manual">Manual</option>
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                </select>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="form-grid">
                <input
                  type="text"
                  name="paymentReference"
                  placeholder="Payment Reference"
                  value={formData.paymentReference}
                  onChange={handleChange}
                />

                <div className="form-field">
                  <label htmlFor="paymentDate">Payment Date</label>
                  <input
                    id="paymentDate"
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <textarea
                name="notes"
                rows="4"
                placeholder="Payment Notes"
                value={formData.notes}
                onChange={handleChange}
              ></textarea>

              <button className="btn btn--primary" type="submit">
                {editingPayment ? 'Update Payment' : 'Record Payment'}
              </button>
            </form>
          </section>

          <div className="admin-search">
            <input
              type="text"
              placeholder="Search by sponsor, child, method, reference, or status..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          {loading && <p>Loading sponsorship payments...</p>}

          {!loading && payments.length === 0 && (
            <p>No sponsorship payment records found.</p>
          )}

          <div className="admin-list">
            {filteredPayments.map((payment) => (
              <article className="admin-card" key={payment.id}>
                <div className="admin-card__header">
                  <div>
                    <h3>{payment.sponsorName}</h3>
                    <p>For {payment.childName}</p>
                  </div>

                  <span className={getStatusClass(payment.status)}>
                    {payment.status}
                  </span>
                </div>

                <div className="admin-card__details">
                  <p>
                    <strong>Amount:</strong>{' '}
                    {formatMoney(payment.currency, payment.amount)}
                  </p>

                  <p>
                    <strong>Method:</strong> {payment.paymentMethod}
                  </p>

                  <p>
                    <strong>Reference:</strong>{' '}
                    {payment.paymentReference || 'Not provided'}
                  </p>

                  <p>
                    <strong>Payment Date:</strong>{' '}
                    {payment.paymentDate
                      ? new Date(payment.paymentDate).toLocaleDateString()
                      : 'Not recorded'}
                  </p>

                  <p>
                    <strong>Notes:</strong>{' '}
                    {payment.notes || 'No notes provided'}
                  </p>
                </div>

                <div className="admin-actions">
                  <button
                    className="btn btn--secondary"
                    type="button"
                    onClick={() => startEditingPayment(payment)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn--danger"
                    type="button"
                    onClick={() => deletePayment(payment.id)}
                  >
                    Delete
                  </button>
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

export default AdminSponsorshipPayments