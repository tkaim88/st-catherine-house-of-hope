import jwt from 'jsonwebtoken'

export function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authentication token is required.',
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

    req.admin = decodedToken

    next()
  } catch (error) {
    console.error(error)

    return res.status(401).json({
      message: 'Invalid or expired authentication token.',
    })
  }
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        message: 'Authentication required.',
      })
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        message: 'You do not have permission to perform this action.',
      })
    }

    next()
  }
}