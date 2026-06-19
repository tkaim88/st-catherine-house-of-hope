import { Navigate } from 'react-router-dom'
import { hasPermission } from '../utils/adminPermissions'

function ProtectedRoute({ children, requiredPermission }) {
  const token = localStorage.getItem('adminToken')

  if (!token) {
    return <Navigate to="/admin-login" replace />
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/admin/access-denied" replace />
  }

  return children
}

export default ProtectedRoute