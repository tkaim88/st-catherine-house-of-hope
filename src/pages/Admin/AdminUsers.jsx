import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import { API_BASE_URL } from '../../config/api'

function AdminUsers() {
  const navigate = useNavigate()

  const [adminUsers, setAdminUsers] = useState([])
  const [newAdmin, setNewAdmin] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'admin',
  })

  const [resetPasswordData, setResetPasswordData] = useState({
    adminId: '',
    newPassword: '',
  })

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  function getAdminToken() {
    return localStorage.getItem('adminToken')
  }

  function getAuthHeaders() {
    const token = getAdminToken()

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  }

  function handleUnauthorized() {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    navigate('/admin-login')
  }

  const totalAdmins = adminUsers.length

  const superAdminCount = adminUsers.filter(
    (admin) => admin.role === 'super-admin'
  ).length

  const adminCount = adminUsers.filter((admin) => admin.role === 'admin').length

  const staffCount = adminUsers.filter((admin) => admin.role === 'staff').length

  const financeCount = adminUsers.filter(
    (admin) => admin.role === 'finance'
  ).length

  function handleNewAdminChange(event) {
    const { name, value } = event.target

    setNewAdmin((currentAdmin) => ({
      ...currentAdmin,
      [name]: value,
    }))
  }

  function handleResetPasswordChange(event) {
    const { name, value } = event.target

    setResetPasswordData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  async function fetchAdminUsers() {
    try {
      const token = getAdminToken()

      if (!token) {
        handleUnauthorized()
        return
      }

      const response = await fetch(`${API_BASE_URL}/admin-users`, {
        headers: getAuthHeaders(),
      })

      const data = await response.json()

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load admin users')
      }

      setAdminUsers(data)
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Could not load admin users.')
    } finally {
      setLoading(false)
    }
  }

  async function createAdminUser(event) {
    event.preventDefault()

    if (newAdmin.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      setSuccessMessage('')
      return
    }

    setIsCreating(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/admin-users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newAdmin),
      })

      const data = await response.json()

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create admin user')
      }

      setAdminUsers((currentUsers) => [...currentUsers, data.data])

      setNewAdmin({
        fullName: '',
        email: '',
        password: '',
        role: 'admin',
      })

      setSuccessMessage('Admin user created successfully.')
      setErrorMessage('')
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Could not create admin user.')
      setSuccessMessage('')
    } finally {
      setIsCreating(false)
    }
  }

  async function updateAdminRole(id, role) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin-users/${id}/role`,
        {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ role }),
        }
      )

      const data = await response.json()

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update admin role')
      }

      setAdminUsers((currentUsers) =>
        currentUsers.map((admin) =>
          admin.id === id ? { ...admin, role } : admin
        )
      )

      setSuccessMessage('Admin role updated successfully.')
      setErrorMessage('')
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Could not update admin role.')
      setSuccessMessage('')
    }
  }

  async function resetAdminPassword(event) {
    event.preventDefault()

    if (!resetPasswordData.adminId) {
      setErrorMessage('Please select an admin user.')
      setSuccessMessage('')
      return
    }

    if (resetPasswordData.newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.')
      setSuccessMessage('')
      return
    }

    setIsResetting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin-users/${resetPasswordData.adminId}/password`,
        {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            newPassword: resetPasswordData.newPassword,
          }),
        }
      )

      const data = await response.json()

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password')
      }

      setResetPasswordData({
        adminId: '',
        newPassword: '',
      })

      setSuccessMessage('Admin password reset successfully.')
      setErrorMessage('')
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Could not reset admin password.')
      setSuccessMessage('')
    } finally {
      setIsResetting(false)
    }
  }

  async function deleteAdminUser(id) {
    const currentAdmin = JSON.parse(localStorage.getItem('adminUser'))

    if (String(currentAdmin?.id) === String(id)) {
      setErrorMessage('You cannot delete your own admin account while logged in.')
      setSuccessMessage('')
      return
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this admin user?'
    )

    if (!confirmed) return

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin-users/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      )

      const data = await response.json()

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete admin user')
      }

      setAdminUsers((currentUsers) =>
        currentUsers.filter((admin) => admin.id !== id)
      )

      setSuccessMessage('Admin user deleted successfully.')
      setErrorMessage('')
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message || 'Could not delete admin user.')
      setSuccessMessage('')
    }
  }

  function getRoleLabel(role) {
    if (role === 'super-admin') return 'Super Admin'
    if (role === 'admin') return 'Admin'
    if (role === 'staff') return 'Staff'
    if (role === 'finance') return 'Finance'
    return role
  }

  function getRoleDescription(role) {
    if (role === 'super-admin') {
      return 'Full access to all admin sections and user management.'
    }

    if (role === 'admin') {
      return 'Can manage volunteers, donations, messages, and reports.'
    }

    if (role === 'staff') {
      return 'Can manage volunteers and contact messages.'
    }

    if (role === 'finance') {
      return 'Can manage donations and reports.'
    }

    return 'No description available.'
  }

  useEffect(() => {
    fetchAdminUsers()
  }, [])

  return (
    <>
      <Navbar />

      <section className="section">
        <div className="container">
          <p className="eyebrow">Admin Dashboard</p>
          <h1>Admin User Management</h1>

          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="admin-summary">
            <article className="summary-card">
              <span>Total Users</span>
              <strong>{totalAdmins}</strong>
            </article>

            <article className="summary-card">
              <span>Super Admins</span>
              <strong>{superAdminCount}</strong>
            </article>

            <article className="summary-card">
              <span>Admins</span>
              <strong>{adminCount}</strong>
            </article>

            <article className="summary-card">
              <span>Staff</span>
              <strong>{staffCount}</strong>
            </article>

            <article className="summary-card">
              <span>Finance</span>
              <strong>{financeCount}</strong>
            </article>
          </div>

          <section className="admin-quick-actions">
            <h3>Create New Admin User</h3>

            <form className="donation-form" onSubmit={createAdminUser}>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={newAdmin.fullName}
                onChange={handleNewAdminChange}
              />

              <input
                type="email"
                name="email"
                placeholder="Admin Email"
                value={newAdmin.email}
                onChange={handleNewAdminChange}
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Temporary Password"
                value={newAdmin.password}
                onChange={handleNewAdminChange}
                required
              />

              <select
                name="role"
                value={newAdmin.role}
                onChange={handleNewAdminChange}
                required
              >
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="finance">Finance</option>
                <option value="super-admin">Super Admin</option>
              </select>

              <button
                className="btn btn--primary"
                type="submit"
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Admin User'}
              </button>
            </form>
          </section>

          <section className="admin-quick-actions">
            <h3>Reset Admin Password</h3>

            <form className="donation-form" onSubmit={resetAdminPassword}>
              <select
                name="adminId"
                value={resetPasswordData.adminId}
                onChange={handleResetPasswordChange}
                required
              >
                <option value="">Select Admin User</option>

                {adminUsers.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.email} - {getRoleLabel(admin.role)}
                  </option>
                ))}
              </select>

              <input
                type="password"
                name="newPassword"
                placeholder="New Temporary Password"
                value={resetPasswordData.newPassword}
                onChange={handleResetPasswordChange}
                required
              />

              <button
                className="btn btn--primary"
                type="submit"
                disabled={isResetting}
              >
                {isResetting ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </section>

          <section className="admin-quick-actions">
            <h3>Existing Admin Users</h3>

            {loading && <p>Loading admin users...</p>}

            {!loading && adminUsers.length === 0 && (
              <p>No admin users found.</p>
            )}

            <div className="admin-list">
              {adminUsers.map((admin) => (
                <article className="admin-card" key={admin.id}>
                  <div className="admin-card__header">
                    <div>
                      <h3>{admin.email}</h3>
                      <p>{getRoleDescription(admin.role)}</p>
                    </div>

                    <span className="status-badge status-badge--approved">
                      {getRoleLabel(admin.role)}
                    </span>
                  </div>

                  <div className="admin-card__details">
                    {admin.fullName && (
                      <p>
                        <strong>Name:</strong> {admin.fullName}
                      </p>
                    )}

                    <p>
                      <strong>User ID:</strong> {admin.id}
                    </p>

                    <p>
                      <strong>Role:</strong> {getRoleLabel(admin.role)}
                    </p>

                    <p>
                      <strong>Status:</strong> {admin.status || 'active'}
                    </p>

                    <p>
                      <strong>Created:</strong>{' '}
                      {admin.createdAt
                        ? new Date(admin.createdAt).toLocaleString()
                        : 'Not recorded'}
                    </p>
                  </div>

                  <div className="admin-actions">
  {(() => {
    const currentAdmin = JSON.parse(localStorage.getItem('adminUser'))
    const isCurrentUser = String(currentAdmin?.id) === String(admin.id)
    const isLastSuperAdmin =
      admin.role === 'super-admin' && superAdminCount <= 1
    const shouldProtectUser = isCurrentUser || isLastSuperAdmin

    return (
      <>
        <select
          value={admin.role}
          disabled={shouldProtectUser}
          onChange={(event) =>
            updateAdminRole(admin.id, event.target.value)
          }
          title={
            shouldProtectUser
              ? 'This protected admin account cannot be demoted.'
              : 'Change admin role'
          }
        >
          <option value="super-admin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="finance">Finance</option>
        </select>

        {!shouldProtectUser && (
          <button
            className="btn btn--danger"
            type="button"
            onClick={() => deleteAdminUser(admin.id)}
          >
            Delete User
          </button>
        )}

        {shouldProtectUser && (
          <span className="status-badge status-badge--approved">
            Protected Account
          </span>
        )}
      </>
    )
  })()}
</div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default AdminUsers