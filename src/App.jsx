import { Routes, Route } from 'react-router-dom'

import Home from './pages/Home/Home'
import About from './pages/About/About'
import Gallery from './pages/Gallery/Gallery'
import Donate from './pages/Donate/Donate'
import Volunteer from './pages/Volunteer/Volunteer'
import Contact from './pages/Contact/Contact'
import SponsorChild from './pages/SponsorChild/SponsorChild'
import SponsorApplication from './pages/SponsorApplication/SponsorApplication'

import ProtectedRoute from './components/ProtectedRoute'

import AdminLogin from './pages/Admin/AdminLogin'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminVolunteers from './pages/Admin/AdminVolunteers'
import AdminDonations from './pages/Admin/AdminDonations'
import AdminChildren from './pages/Admin/AdminChildren'
import AdminSponsors from './pages/Admin/AdminSponsors'
import AdminDonors from './pages/Admin/AdminDonors'
import AdminSponsorshipPayments from './pages/Admin/AdminSponsorshipPayments'
import AdminSponsorshipApplications from './pages/Admin/AdminSponsorshipApplications'
import AdminMessages from './pages/Admin/AdminMessages'
import AdminActivities from './pages/Admin/AdminActivities'
import AdminReports from './pages/Admin/AdminReports'
import AdminNotifications from './pages/Admin/AdminNotification'
import AdminSettings from './pages/Admin/AdminSettings'
import AccessDenied from './pages/Admin/AccessDenied'
import AdminUsers from './pages/Admin/AdminUsers'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/donate" element={<Donate />} />
      <Route path="/volunteer" element={<Volunteer />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/sponsor-child/:childId" element={<SponsorChild />} />
      <Route
        path="/sponsor-child/:childId/apply"
        element={<SponsorApplication />}
      />

      <Route path="/admin-login" element={<AdminLogin />} />

      <Route
        path="/admin/access-denied"
        element={
          <ProtectedRoute requiredPermission="dashboard">
            <AccessDenied />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredPermission="dashboard">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/volunteers"
        element={
          <ProtectedRoute requiredPermission="volunteers">
            <AdminVolunteers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/donations"
        element={
          <ProtectedRoute requiredPermission="donations">
            <AdminDonations />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/children"
        element={
          <ProtectedRoute requiredPermission="children">
            <AdminChildren />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/sponsors"
        element={
          <ProtectedRoute requiredPermission="sponsors">
            <AdminSponsors />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/sponsorship-applications"
        element={
          <ProtectedRoute requiredPermission="sponsorshipApplications">
            <AdminSponsorshipApplications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/sponsorship-payments"
        element={
          <ProtectedRoute requiredPermission="sponsorshipPayments">
            <AdminSponsorshipPayments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/donors"
        element={
          <ProtectedRoute requiredPermission="donors">
            <AdminDonors />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/messages"
        element={
          <ProtectedRoute requiredPermission="messages">
            <AdminMessages />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/activities"
        element={
          <ProtectedRoute requiredPermission="activities">
            <AdminActivities />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute requiredPermission="reports">
            <AdminReports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute requiredPermission="notifications">
            <AdminNotifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute requiredPermission="settings">
            <AdminSettings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requiredPermission="users">
            <AdminUsers />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App