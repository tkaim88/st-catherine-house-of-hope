import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import { API_BASE_URL } from '../../config/api'

function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const totalMessages = messages.length

  const unreadMessages = messages.filter(
    (message) => message.status === 'unread'
  ).length

  const readMessages = messages.filter(
    (message) => message.status === 'read'
  ).length

  const archivedMessages = messages.filter(
    (message) => message.status === 'archived'
  ).length

  const filteredMessages = messages
    .filter((message) => {
      if (statusFilter === 'all') return true
      return message.status === statusFilter
    })
    .filter((message) => {
      const searchValue = searchTerm.toLowerCase()

      return (
        message.fullName?.toLowerCase().includes(searchValue) ||
        message.email?.toLowerCase().includes(searchValue) ||
        message.subject?.toLowerCase().includes(searchValue) ||
        message.message?.toLowerCase().includes(searchValue)
      )
    })

  async function fetchMessages() {
    try {
      const response = await fetch(`${API_BASE_URL}/messages`)

      if (!response.ok) {
        throw new Error('Failed to load messages')
      }

      const data = await response.json()

      const sortedMessages = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )

      setMessages(sortedMessages)
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not load messages.')
    } finally {
      setLoading(false)
    }
  }

  async function updateMessageStatus(id, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update message')
      }

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === id ? { ...message, status } : message
        )
      )

      setSuccessMessage(`Message marked as ${status}.`)
      setErrorMessage('')
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not update message.')
      setSuccessMessage('')
    }
  }

  async function deleteMessage(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this message?'
    )

    if (!confirmed) return

    try {
      const response = await fetch(`${API_BASE_URL}/messages/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete message')
      }

      setMessages((currentMessages) =>
        currentMessages.filter((message) => message.id !== id)
      )

      setSuccessMessage('Message deleted.')
      setErrorMessage('')
    } catch (error) {
      console.error(error)
      setErrorMessage('Could not delete message.')
      setSuccessMessage('')
    }
  }

  function getStatusClass(status) {
    if (status === 'read') return 'status-badge status-badge--approved'
    if (status === 'archived') return 'status-badge status-badge--rejected'
    return 'status-badge status-badge--pending'
  }

  function getPriorityLabel(subject, message) {
    const text = `${subject} ${message}`.toLowerCase()

    if (text.includes('sponsor')) return 'Sponsor Inquiry'
    if (text.includes('donation') || text.includes('donate')) return 'Donation Inquiry'
    if (text.includes('volunteer')) return 'Volunteer Inquiry'
    if (text.includes('urgent') || text.includes('emergency')) return 'Urgent'
    return 'General Message'
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  return (
    <>
      <Navbar />

      <section className="section">
        <div className="container">
          <p className="eyebrow">Admin Dashboard</p>
          <h1>Contact Messages</h1>

          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="admin-summary">
            <article className="summary-card">
              <span>Total Messages</span>
              <strong>{totalMessages}</strong>
            </article>

            <article className="summary-card">
              <span>Unread</span>
              <strong>{unreadMessages}</strong>
            </article>

            <article className="summary-card">
              <span>Read</span>
              <strong>{readMessages}</strong>
            </article>

            <article className="summary-card">
              <span>Archived</span>
              <strong>{archivedMessages}</strong>
            </article>
          </div>

          <div className="admin-search">
            <input
              type="text"
              placeholder="Search messages by name, email, subject, or message..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {loading && <p>Loading messages...</p>}

          {!loading && messages.length === 0 && (
            <p>No contact messages found.</p>
          )}

          {!loading &&
            messages.length > 0 &&
            filteredMessages.length === 0 && (
              <p>No messages match your current search or filter.</p>
            )}

          <div className="admin-list">
            {filteredMessages.map((message) => (
              <article className="admin-card" key={message.id}>
                <div className="admin-card__header">
                  <div>
                    <h3>{message.fullName}</h3>
                    <p>{message.email}</p>
                  </div>

                  <span className={getStatusClass(message.status)}>
                    {message.status}
                  </span>
                </div>

                <div className="admin-card__details">
                  <p>
                    <strong>Phone:</strong>{' '}
                    {message.phone || 'No phone provided'}
                  </p>

                  <p>
                    <strong>Subject:</strong> {message.subject}
                  </p>

                  <p>
                    <strong>Priority:</strong>{' '}
                    {getPriorityLabel(message.subject, message.message)}
                  </p>

                  <p>
                    <strong>Message:</strong> {message.message}
                  </p>

                  <p>
                    <strong>Received:</strong>{' '}
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="admin-actions">
                  {message.status !== 'read' && (
                    <button
                      className="btn btn--primary"
                      type="button"
                      onClick={() => updateMessageStatus(message.id, 'read')}
                    >
                      Mark Read
                    </button>
                  )}

                  {message.status !== 'archived' && (
                    <button
                      className="btn btn--secondary-dark"
                      type="button"
                      onClick={() =>
                        updateMessageStatus(message.id, 'archived')
                      }
                    >
                      Archive
                    </button>
                  )}

                  <button
                    className="btn btn--danger"
                    type="button"
                    onClick={() => deleteMessage(message.id)}
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

export default AdminMessages