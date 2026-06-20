import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import volunteerRoutes from './routes/volunteerRoutes.js'
import donationRoutes from './routes/donationRoutes.js'
import activityRoutes from './routes/activityRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import authRoutes from './routes/authRoutes.js'
import adminUserRoutes from './routes/adminUserRoutes.js'
import donorRoutes from './routes/donorRoutes.js'
import sponsorRoutes from './routes/sponsorRoutes.js'
import sponsorshipPaymentRoutes from './routes/sponsorshipPaymentRoutes.js'
import sponsorshipApplicationRoutes from './routes/sponsorshipApplicationRoutes.js'
import childRoutes from './routes/childRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/admin-users', adminUserRoutes)
app.use('/api/donors', donorRoutes)
app.use('/api/sponsors', sponsorRoutes)
app.use('/api/sponsorship-payments', sponsorshipPaymentRoutes)
app.use('/api/sponsorship-applications', sponsorshipApplicationRoutes)
app.use('/api/volunteers', volunteerRoutes)
app.use('/api/donations', donationRoutes)
app.use('/api/activities', activityRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/children', childRoutes)
app.use('/api/notifications', notificationRoutes)
app.get('/', (req, res) => {
  res.json({
    message: 'St Catherine House of Hope Backend Running',
  })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})