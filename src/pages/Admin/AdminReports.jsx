import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import { createActivity } from '../../services/activityService'

function AdminReports() {
  const [volunteers, setVolunteers] = useState([])
  const [donations, setDonations] = useState([])
  const [children, setChildren] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function fetchReportData() {
    try {
      const [
        volunteersResponse,
        donationsResponse,
        childrenResponse,
        sponsorsResponse,
        messagesResponse,
      ] = await Promise.all([
        fetch('https://st-catherine-house-of-hope-api.onrender.com/api/volunteers'),
        fetch('https://st-catherine-house-of-hope-api.onrender.com/api/donations'),
        fetch('https://st-catherine-house-of-hope-api.onrender.com/api/children'),
        fetch('https://st-catherine-house-of-hope-api.onrender.com/api/sponsors'),
        fetch('https://st-catherine-house-of-hope-api.onrender.com/api/messages'),
      ])

      if (
        !volunteersResponse.ok ||
        !donationsResponse.ok ||
        !childrenResponse.ok ||
        !sponsorsResponse.ok ||
        !messagesResponse.ok
      ) {
        throw new Error('Failed to load report data')
      }

      setVolunteers(await volunteersResponse.json())
      setDonations(await donationsResponse.json())
      setChildren(await childrenResponse.json())
      setSponsors(await sponsorsResponse.json())
      setMessages(await messagesResponse.json())
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not load report data.')
    } finally {
      setLoading(false)
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

  async function exportCSV(fileName, headers, rows, activityName) {
    if (rows.length === 0) {
      setErrorMessage('There is no data to export.')
      setSuccessMessage('')
      return
    }

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${value || ''}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = fileName
    link.click()

    URL.revokeObjectURL(url)

    await createActivity(
      activityName,
      `${fileName} was exported from the Reports Center.`
    )

    setSuccessMessage(`${fileName} exported successfully.`)
    setErrorMessage('')
  }

  function exportVolunteers() {
    exportCSV(
      'volunteers-report.csv',
      ['Name', 'Email', 'Phone', 'Skills', 'Status', 'Submitted'],
      volunteers.map((volunteer) => [
        volunteer.fullName,
        volunteer.email,
        volunteer.phone,
        volunteer.skills,
        volunteer.status,
        new Date(volunteer.createdAt).toLocaleString(),
      ]),
      'Volunteers Report Exported'
    )
  }

  function exportDonations() {
    exportCSV(
      'donations-report.csv',
      ['Name', 'Email', 'Amount', 'Type', 'Status', 'Submitted'],
      donations.map((donation) => [
        donation.fullName,
        donation.email,
        formatMoney(donation.currency, donation.amount),
        donation.donationType,
        donation.status,
        new Date(donation.createdAt).toLocaleString(),
      ]),
      'Donations Report Exported'
    )
  }

  function exportChildren() {
    exportCSV(
      'children-report.csv',
      [
        'Name',
        'Age',
        'Gender',
        'School',
        'Grade',
        'Sponsor',
        'Status',
        'Added',
      ],
      children.map((child) => [
        child.fullName,
        child.age,
        child.gender,
        child.school,
        child.grade,
        child.sponsor || 'None',
        child.status,
        new Date(child.createdAt).toLocaleString(),
      ]),
      'Children Report Exported'
    )
  }

  function exportSponsors() {
    exportCSV(
      'sponsors-report.csv',
      [
        'Name',
        'Email',
        'Phone',
        'Country',
        'Child Sponsored',
        'Monthly Amount',
        'Status',
        'Added',
      ],
      sponsors.map((sponsor) => [
        sponsor.fullName,
        sponsor.email,
        sponsor.phone,
        sponsor.country,
        sponsor.childName,
        formatMoney(sponsor.currency, sponsor.monthlyAmount),
        sponsor.status,
        new Date(sponsor.createdAt).toLocaleString(),
      ]),
      'Sponsors Report Exported'
    )
  }

  function exportMessages() {
    exportCSV(
      'messages-report.csv',
      ['Name', 'Email', 'Phone', 'Subject', 'Message', 'Status', 'Received'],
      messages.map((message) => [
        message.fullName,
        message.email,
        message.phone,
        message.subject,
        message.message,
        message.status,
        new Date(message.createdAt).toLocaleString(),
      ]),
      'Messages Report Exported'
    )
  }

  useEffect(() => {
    fetchReportData()
  }, [])

  return (
    <>
      <Navbar />

      <section className="section">
        <div className="container">
          <p className="eyebrow">Admin Dashboard</p>
          <h1>Reports Center</h1>

          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {loading && <p>Loading reports...</p>}

          {!loading && (
            <>
              <div className="admin-summary">
                <article className="summary-card">
                  <span>Volunteers</span>
                  <strong>{volunteers.length}</strong>
                </article>

                <article className="summary-card">
                  <span>Donations</span>
                  <strong>{donations.length}</strong>
                </article>

                <article className="summary-card">
                  <span>Children</span>
                  <strong>{children.length}</strong>
                </article>

                <article className="summary-card">
                  <span>Sponsors</span>
                  <strong>{sponsors.length}</strong>
                </article>

                <article className="summary-card">
                  <span>Messages</span>
                  <strong>{messages.length}</strong>
                </article>
              </div>

              <section className="admin-quick-actions">
                <h3>Export Reports</h3>

                <div className="quick-actions-grid">
                  <button
                    className="quick-action-card"
                    type="button"
                    onClick={exportVolunteers}
                  >
                    Export Volunteers CSV
                  </button>

                  <button
                    className="quick-action-card"
                    type="button"
                    onClick={exportDonations}
                  >
                    Export Donations CSV
                  </button>

                  <button
                    className="quick-action-card"
                    type="button"
                    onClick={exportChildren}
                  >
                    Export Children CSV
                  </button>

                  <button
                    className="quick-action-card"
                    type="button"
                    onClick={exportSponsors}
                  >
                    Export Sponsors CSV
                  </button>

                  <button
                    className="quick-action-card"
                    type="button"
                    onClick={exportMessages}
                  >
                    Export Messages CSV
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
      </section>

      <Footer />
    </>
  )
}

export default AdminReports