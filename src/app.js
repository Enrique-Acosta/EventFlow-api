import express from 'express'
import healthRouter from './routes/healthRouter.js'
import eventsRouter from './routes/eventsRouter.js'
import sessionRouter from './routes/sessionRouter.js'
import ticketRouter from './routes/ticketRouter.js'
import cookieParser from 'cookie-parser'
import { env } from './config/env.js'
import passport from 'passport'
import { initializePassport } from './config/passport.js'

const app = express()
initializePassport()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(env.COOKIE_SECRET))
app.use(passport.initialize())

app.use('/api/health', healthRouter)
app.use('/api/event', eventsRouter)
app.use('/api/session', sessionRouter)
app.use('/api/ticket', ticketRouter)

export default app