import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import { createActivity } from '../../services/activityService'

function AdminDonations() {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currencyFilter, setCurrencyFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const totalDonations = donations.length

  const pendingDonations = donations.filter(
    (donation) => donation.status === 'pending'
  ).length

  const approvedDonations = donations.filter(
    (donation) => donation.status === 'approved'
  ).length

  const rejectedDonations = donations.filter(
    (donation) => donation.status === 'rejected'
  ).length

  const monthlyDonations = donations.filter(
    (donation) => donation.donationType === 'monthly'
  ).length

  const oneTimeDonations = donations.filter(
    (donation) => donation.donationType === 'one-time'
  ).length

  function getCurrencyTotal(currency) {
    return donations
      .filter((donation) => donation.currency === currency)
      .reduce((sum, donation) => sum + Number(donation.amount || 0), 0)
  }

  const kshTotal = getCurrencyTotal('KSH')
  const usdTotal = getCurrencyTotal('USD')
  const gbpTotal = getCurrencyTotal('GBP')
  const eurTotal = getCurrencyTotal('EUR')

  const largestDonation =
    donations.length > 0
      ? donations.reduce((largest, donation) =>
          Number(donation.amount || 0) > Number(largest.amount || 0)
            ? donation
            : largest
        )
      : null

  const newestDonation =
    donations.length > 0
      ? [...donations].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0]
      : null

  const approvalRate =
    totalDonations > 0
      ? Math.round((approvedDonations / totalDonations) * 100)
      : 0

  const mostPopularDonationType =
    monthlyDonations >= oneTimeDonations ? 'Monthly' : 'One-Time'

  const recentDonations = [...donations]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const filteredDonations = donations
    .filter((donation) => {
      if (currencyFilter === 'all') return true
      return donation.currency === currencyFilter
    })
    .filter((donation) => {
      if (typeFilter === 'all') return true
      return donation.donationType === typeFilter
    })
    .filter((donation) => {
      const searchValue = searchTerm.toLowerCase()

      return (
        donation.fullName?.toLowerCase().includes(searchValue) ||
        donation.email?.toLowerCase().includes(searchValue) ||
        donation.currency?.toLowerCase().includes(searchValue) ||
        donation.donationType?.toLowerCase().includes(searchValue)
      )
    })

  async function fetchDonations() {
    try {
      const response = await fetch('http://localhost:5000/api/donations')

      if (!response.ok) {
        throw new Error('Failed to load donations')
      }

      const data = await response.json()
      setDonations(data)
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not load donations.')
    } finally {
      setLoading(false)
    }
  }

  async function updateDonationStatus(id, status) {
    const donation = donations.find((item) => item.id === id)

    try {
      const response = await fetch(
        `http://localhost:5000/api/donations/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update donation status')
      }

      await createActivity(
        status === 'approved' ? 'Donation Approved' : 'Donation Rejected',
        `${donation?.fullName || 'Donor'} donation of ${formatMoney(
          donation?.currency,
          donation?.amount
        )} was marked as ${status}.`
      )

      setDonations((currentDonations) =>
        currentDonations.map((item) =>
          item.id === id ? { ...item, status } : item
        )
      )

      setSuccessMessage(`Donation marked as ${status}.`)
      setErrorMessage('')
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not update donation status.')
    }
  }

  async function deleteDonation(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this donation record?'
    )

    if (!confirmed) return

    const donation = donations.find((item) => item.id === id)

    try {
      const response = await fetch(
        `http://localhost:5000/api/donations/${id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete donation')
      }

      await createActivity(
        'Donation Deleted',
        `${donation?.fullName || 'Donor'} donation record of ${formatMoney(
          donation?.currency,
          donation?.amount
        )} was deleted.`
      )

      setDonations((currentDonations) =>
        currentDonations.filter((item) => item.id !== id)
      )

      setSuccessMessage('Donation record deleted.')
      setErrorMessage('')
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not delete donation.')
    }
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

  async function exportDonationsToCSV() {
    if (donations.length === 0) {
      setErrorMessage('There are no donations to export.')
      return
    }

    const headers = [
      'Name',
      'Email',
      'Amount',
      'Donation Type',
      'Status',
      'Submitted',
    ]

    const rows = donations.map((donation) => [
      donation.fullName,
      donation.email,
      formatMoney(donation.currency, donation.amount),
      donation.donationType,
      donation.status,
      new Date(donation.createdAt).toLocaleString(),
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${value}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'donations.csv'
    link.click()

    URL.revokeObjectURL(url)

    await createActivity(
      'Donations Exported',
      'Donation records were exported as a CSV file.'
    )

    setSuccessMessage('Donations exported successfully.')
    setErrorMessage('')
  }

  function getStatusClass(status) {
    if (status === 'approved') return 'status-badge status-badge--approved'
    if (status === 'rejected') return 'status-badge status-badge--rejected'
    return 'status-badge status-badge--pending'
  }

  useEffect(() => {
    fetchDonations()
  }, [])

  return (
    <>
      <Navbar />

      <section className="section">
        <div className="container">
          <p className="eyebrow">Admin Dashboard</p>
          <h1>Donation Management</h1>

          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="admin-summary">
            <article className="summary-card">
              <span>Total Donations</span>
              <strong>{totalDonations}</strong>
            </article>

            <article className="summary-card">
              <span>Pending</span>
              <strong>{pendingDonations}</strong>
            </article>

            <article className="summary-card">
              <span>Approved</span>
              <strong>{approvedDonations}</strong>
            </article>

            <article className="summary-card">
              <span>Rejected</span>
              <strong>{rejectedDonations}</strong>
            </article>

            <article className="summary-card">
              <span>Monthly</span>
              <strong>{monthlyDonations}</strong>
            </article>

            <article className="summary-card">
              <span>One-Time</span>
              <strong>{oneTimeDonations}</strong>
            </article>
          </div>

          <section className="admin-quick-actions">
            <h3>Financial Overview</h3>

            <div className="quick-actions-grid">
              <article className="quick-action-card">
                <span>KSH Total</span>
                <strong>{formatMoney('KSH', kshTotal)}</strong>
              </article>

              <article className="quick-action-card">
                <span>USD Total</span>
                <strong>{formatMoney('USD', usdTotal)}</strong>
              </article>

              <article className="quick-action-card">
                <span>GBP Total</span>
                <strong>{formatMoney('GBP', gbpTotal)}</strong>
              </article>

              <article className="quick-action-card">
                <span>EUR Total</span>
                <strong>{formatMoney('EUR', eurTotal)}</strong>
              </article>

              <article className="quick-action-card">
                <span>Largest Donation</span>
                <strong>
                  {largestDonation
                    ? formatMoney(
                        largestDonation.currency,
                        largestDonation.amount
                      )
                    : formatMoney('N/A', 0)}
                </strong>
                <small>{largestDonation?.fullName || 'No donor'}</small>
              </article>
            </div>
          </section>

          <section className="admin-quick-actions">
            <h3>Donation Analytics</h3>

            <div className="quick-actions-grid">
              <article className="quick-action-card">
                <span>Approval Rate</span>
                <strong>{approvalRate}%</strong>
              </article>

              <article className="quick-action-card">
                <span>Most Popular Type</span>
                <strong>{mostPopularDonationType}</strong>
              </article>

              <article className="quick-action-card">
                <span>Newest Donation</span>
                <strong>
                  {newestDonation
                    ? formatMoney(
                        newestDonation.currency,
                        newestDonation.amount
                      )
                    : formatMoney('N/A', 0)}
                </strong>
                <small>{newestDonation?.fullName || 'No donor'}</small>
              </article>

              <article className="quick-action-card">
                <span>Recent Records</span>
                <strong>{recentDonations.length}</strong>
              </article>
            </div>
          </section>

          <section className="admin-quick-actions">
            <h3>Quick Actions</h3>

            <div className="quick-actions-grid">
              <button
                className="quick-action-card"
                type="button"
                onClick={exportDonationsToCSV}
              >
                Export Donations CSV
              </button>
            </div>
          </section>

          <div className="admin-search">
            <input
              type="text"
              placeholder="Search donations..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <select
              value={currencyFilter}
              onChange={(event) => setCurrencyFilter(event.target.value)}
            >
              <option value="all">All Currencies</option>
              <option value="KSH">KSH</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="all">All Types</option>
              <option value="one-time">One-Time</option>
              <option value="monthly">Monthly</option>
              <option value="in-kind">In-Kind</option>
            </select>
          </div>

          {loading && <p>Loading donations...</p>}

          {!loading && donations.length === 0 && <p>No donations found.</p>}

          {!loading &&
            donations.length > 0 &&
            filteredDonations.length === 0 && (
              <p>No donations match your current filter/search.</p>
            )}

          <div className="admin-list">
            {filteredDonations.map((donation) => (
              <article className="admin-card" key={donation.id}>
                <div className="admin-card__header">
                  <div>
                    <h3>{donation.fullName}</h3>
                    <p>{donation.email}</p>
                  </div>

                  <span className={getStatusClass(donation.status)}>
                    {donation.status}
                  </span>
                </div>

                <div className="admin-card__details">
                  <p>
                    <strong>Amount:</strong>{' '}
                    {formatMoney(donation.currency, donation.amount)}
                  </p>

                  <p>
                    <strong>Donation Type:</strong> {donation.donationType}
                  </p>

                  <p>
                    <strong>Message:</strong>{' '}
                    {donation.message || 'No message provided'}
                  </p>

                  <p>
                    <strong>Submitted:</strong>{' '}
                    {new Date(donation.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="admin-actions">
                  {donation.status === 'pending' && (
                    <>
                      <button
                        className="btn btn--primary"
                        type="button"
                        onClick={() =>
                          updateDonationStatus(donation.id, 'approved')
                        }
                      >
                        Approve
                      </button>

                      <button
                        className="btn btn--secondary-dark"
                        type="button"
                        onClick={() =>
                          updateDonationStatus(donation.id, 'rejected')
                        }
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {donation.status === 'approved' && (
                    <span className="decision-label decision-label--approved">
                      ✓ Approved
                    </span>
                  )}

                  {donation.status === 'rejected' && (
                    <span className="decision-label decision-label--rejected">
                      ✕ Rejected
                    </span>
                  )}

                  <button
                    className="btn btn--danger"
                    type="button"
                    onClick={() => deleteDonation(donation.id)}
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

export default AdminDonations