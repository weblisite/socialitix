import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { createServer } from 'http'
import winston from 'winston'
import { supabaseAdmin } from './config/supabase.js'

// Import routes
import authRoutes from './routes/auth.js'
import videoRoutes from './routes/videos.js'
import clipRoutes from './routes/clips.js'
import subscriptionRoutes from './routes/subscriptions.js'
import aiRoutes from './routes/ai.js'
import analyticsRoutes from './routes/analytics.js'
import webhookRoutes from './routes/webhooks.js'

// Import middleware
import { authenticateToken } from './middleware/auth.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()
const server = createServer(app)
const PORT = process.env.PORT || 5000

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'socialitix-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

// Rate limiting configuration
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: {
    error: 'Too many upload requests, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://socialitix.com', 'https://www.socialitix.com']
    : [
        'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 
        'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005',
        'http://localhost:3006', 'http://localhost:3007', 'http://localhost:3008',
        'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:3002',
        'http://127.0.0.1:3003', 'http://127.0.0.1:3004', 'http://127.0.0.1:3005',
        'http://127.0.0.1:3006', 'http://127.0.0.1:3007', 'http://127.0.0.1:3008'
      ],
  credentials: true
}))

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/api/videos/upload', uploadLimiter);
app.use('/api/auth/', authLimiter);

// Body parsing middleware
app.use('/api/webhooks', express.raw({ type: 'application/json' }))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`)
  next()
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/videos', authenticateToken, videoRoutes)
app.use('/api/clips', authenticateToken, clipRoutes)
app.use('/api/subscriptions', authenticateToken, subscriptionRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/analytics', authenticateToken, analyticsRoutes)
app.use('/api/webhooks', webhookRoutes)

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  })
})

// Database connection
const connectDB = async () => {
  try {
    // Test Supabase connection
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1)
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "table not found" which is ok during setup
      logger.warn('Supabase connection failed, continuing with limited functionality:', error.message)
      return // Don't exit, just warn
    }
    
    logger.info('Supabase connected successfully')
  } catch (error) {
    logger.warn('Supabase connection error, continuing with limited functionality:', error instanceof Error ? error.message : String(error))
    // Don't exit, just continue with limited functionality
  }
}

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`)
  server.close(() => {
    logger.info('HTTP server closed.')
    logger.info('Supabase connection closed.')
    process.exit(0)
  })
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Start server
const startServer = async () => {
  await connectDB()
  
  server.listen(PORT, () => {
    logger.info(`Socialitix API server running on port ${PORT}`)
    logger.info(`Environment: ${process.env.NODE_ENV}`)
    logger.info(`Health check: http://localhost:${PORT}/health`)
  })
}

startServer().catch((error) => {
  logger.error('Failed to start server:', error)
  process.exit(1)
}) 