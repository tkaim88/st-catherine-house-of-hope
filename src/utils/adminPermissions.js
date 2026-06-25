export const rolePermissions = {
  'super-admin': [
    'dashboard',
    'volunteers',
    'donations',
    'donors',
    'children',
    'sponsors',
    'sponsorshipPayments',
    'sponsorshipApplications',
    'messages',
    'activities',
    'reports',
    'notifications',
    'settings',
    'users',
    'media',
  ],
  admin: [
    'dashboard',
    'volunteers',
    'donations',
    'donors',
    'sponsors',
    'sponsorshipApplications',
    'messages',
    'reports',
  ],
  staff: [
    'dashboard',
    'volunteers',
    'messages',
  ],
  finance: [
    'dashboard',
    'donations',
    'donors',
    'sponsorshipPayments',
    'reports',
  ],
}

export function getCurrentAdmin() {
  const adminUser = localStorage.getItem('adminUser')

  if (!adminUser) {
    return null
  }

  return JSON.parse(adminUser)
}

export function hasPermission(permission) {
  const admin = getCurrentAdmin()

  if (!admin) {
    return false
  }

  const permissions = rolePermissions[admin.role] || []

  return permissions.includes(permission)
}