export const rolePermissions = {
  'super-admin': [
    'dashboard',
    'volunteers',
    'donations',
    'donors',
    'children',
    'sponsors',
    'messages',
    'activities',
    'reports',
    'notifications',
    'settings',
    'users',
  ],
  admin: [
    'dashboard',
    'volunteers',
    'donations',
    'donors',
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