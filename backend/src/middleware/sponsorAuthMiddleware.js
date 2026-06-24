import jwt from 'jsonwebtoken'

export function protectSponsor(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Sponsor authorization token is required.',
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.role !== 'sponsor') {
      return res.status(403).json({
        message: 'Sponsor access only.',
      })
    }

    req.sponsor = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired sponsor token.',
    })
  }
}