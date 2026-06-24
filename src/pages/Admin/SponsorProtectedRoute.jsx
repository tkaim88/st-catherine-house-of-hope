import { Navigate } from 'react-router-dom'

function SponsorProtectedRoute({ children }) {
  const token = localStorage.getItem('sponsorToken')

  if (!token) {
    return <Navigate to="/sponsor-login" replace />
  }

  return children
}

export default SponsorProtectedRoute