# Socialitix - AI-First Video Clipping Platform

Socialitix is a comprehensive SaaS platform that uses AI to convert long-form videos into viral short clips optimized for social media platforms like TikTok, Instagram Reels, and X (Twitter).

## 🚀 Features

### AI-Powered Video Analysis
- **Engagement Detection**: AI analyzes audio tone, speech pace, and visual dynamics to identify the most engaging 15-second segments
- **Hook Identification**: Automatically detects attention-grabbing moments like questions, bold statements, and surprising visuals
- **Trending Integration**: Suggests clips aligned with trending topics and hashtags from X API
- **Auto-Subtitles**: AI-generated subtitles with viral phrasing suggestions

### Video Processing
- **Multiple Input Types**: Support for .mp4, .mov files and YouTube URLs
- **Timeline Editor**: Visual waveform interface with AI-highlighted engagement peaks
- **Social Media Presets**: Pre-configured exports for TikTok (9:16), Instagram Reels (9:16), and X (1:1)
- **Quality Options**: Export in 720p, 1080p, or 4K based on subscription tier

### Subscription Management
- **Tiered Plans**: Free, Basic ($12/mo), Pro ($35/mo), and Enterprise ($99/mo)
- **Polar.sh Integration**: Global tax compliance and payment processing
- **Usage Tracking**: Monitor uploads, clips created, and storage used
- **Team Collaboration**: Multi-user access for Pro/Enterprise tiers

### Analytics & Insights
- **Performance Tracking**: Monitor clip views, shares, and engagement
- **AI Feedback Loop**: System learns from user preferences to improve suggestions
- **Export Analytics**: Track which clips perform best on different platforms

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Query** for API calls
- **WaveSurfer.js** for audio visualization
- **React Player** for video preview
- **Chart.js** for analytics

### Backend
- **Node.js** with Express and TypeScript
- **MongoDB** with Mongoose for data storage
- **Redis** for caching and session management
- **FFmpeg** for video processing
- **AssemblyAI** for transcription and audio analysis
- **AWS Rekognition** for visual analysis
- **Polar.sh SDK** for payment processing

### Infrastructure
- **Frontend**: Vercel deployment
- **Backend**: AWS ECS with auto-scaling
- **Storage**: AWS S3 with CloudFront CDN
- **Database**: MongoDB Atlas
- **AI Compute**: AWS SageMaker
- **Monitoring**: AWS CloudWatch + Sentry

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 6.0+
- Redis 6.0+
- FFmpeg 4.4+
- AWS Account (for S3, Rekognition, SageMaker)
- AssemblyAI API Key
- Polar.sh Account

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/socialitix.git
cd socialitix
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### 3. Environment Configuration

Create `.env` files:

**Backend (.env)**:
```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/socialitix

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=socialitix-videos

# AI Services
ASSEMBLYAI_API_KEY=your-assemblyai-key
OPENAI_API_KEY=your-openai-key

# Polar.sh
POLAR_API_KEY=your-polar-api-key
POLAR_WEBHOOK_SECRET=your-polar-webhook-secret

# X API (Optional)
X_API_KEY=your-x-api-key
X_API_SECRET=your-x-api-secret
X_BEARER_TOKEN=your-x-bearer-token

# Email (for notifications)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

**Frontend (.env.local)**:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Socialitix
VITE_POLAR_PUBLIC_KEY=your-polar-public-key
```

### 4. Database Setup

Start MongoDB and Redis:
```bash
# Using Docker
docker run -d -p 27017:27017 mongo:6.0
docker run -d -p 6379:6379 redis:6.0

# Or using local installation
mongod
redis-server
```

### 5. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:frontend  # Runs on http://localhost:3000
npm run dev:backend   # Runs on http://localhost:5000
```

## 🏗 Project Structure

```
socialitix/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── layout/      # Layout components
│   │   │   ├── video/       # Video-related components
│   │   │   └── ui/          # Generic UI components
│   │   ├── pages/           # Page components
│   │   ├── stores/          # Zustand state stores
│   │   ├── utils/           # Utility functions
│   │   └── hooks/           # Custom React hooks
│   ├── public/              # Static assets
│   └── dist/                # Build output
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   │   ├── aiService.ts      # AI analysis
│   │   │   ├── videoService.ts   # Video processing
│   │   │   ├── polarService.ts   # Payment handling
│   │   │   └── storageService.ts # File storage
│   │   └── utils/           # Utility functions
│   └── dist/                # Compiled JavaScript
└── docs/                    # Documentation
```

## 🔌 API Documentation

### Authentication
```
POST /api/auth/register       # User registration
POST /api/auth/login          # User login
POST /api/auth/logout         # User logout
GET  /api/auth/me            # Get current user
```

### Videos
```
POST   /api/videos/upload        # Upload video file
POST   /api/videos/youtube       # Import from YouTube
GET    /api/videos               # List user videos
GET    /api/videos/:id           # Get specific video
PUT    /api/videos/:id           # Update video metadata
DELETE /api/videos/:id           # Delete video
POST   /api/videos/:id/analyze   # Trigger AI analysis
```

### Clips
```
POST   /api/clips               # Create new clip
GET    /api/clips               # List user clips
GET    /api/clips/:id           # Get specific clip
PUT    /api/clips/:id           # Update clip
DELETE /api/clips/:id           # Delete clip
POST   /api/clips/:id/export    # Export clip
```

### Subscriptions (Polar.sh)
```
POST   /api/subscriptions/create-checkout  # Create Polar.sh checkout
GET    /api/subscriptions/current          # Get current subscription
POST   /api/subscriptions/cancel           # Cancel subscription
GET    /api/subscriptions/usage            # Get usage statistics
```

### AI Analysis
```
GET    /api/ai/analyze/:videoId     # Get analysis results
POST   /api/ai/feedback             # Provide feedback on suggestions
GET    /api/ai/trending             # Get trending topics
```

## 🔄 Deployment

### Frontend (Vercel)

```bash
# Build and deploy to Vercel
cd frontend
npm run build
vercel --prod
```

### Backend (AWS ECS)

1. **Build Docker Image**:
```bash
cd backend
docker build -t socialitix-api .
```

2. **Push to ECR**:
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URI
docker tag socialitix-api:latest YOUR_ECR_URI/socialitix-api:latest
docker push YOUR_ECR_URI/socialitix-api:latest
```

3. **Deploy to ECS**:
```bash
aws ecs update-service --cluster socialitix-cluster --service socialitix-api --force-new-deployment
```

### Environment Variables (Production)

Set these in your deployment platform:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/socialitix
REDIS_URL=redis://your-redis-instance:6379
CORS_ORIGIN=https://socialitix.com
```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test              # Run unit tests
npm run test:e2e      # Run end-to-end tests
```

### Backend Tests
```bash
cd backend
npm test              # Run unit tests
npm run test:integration  # Run integration tests
```

### API Testing
Use the included Postman collection:
```bash
# Import the collection
postman collection run docs/Socialitix-API.postman_collection.json
```

## 🔧 Development

### Code Quality
```bash
npm run lint          # ESLint check
npm run lint:fix      # Auto-fix linting issues
npm run format        # Prettier formatting
```

### Database Management
```bash
# Run migrations
npm run migrate

# Seed test data
npm run seed

# Backup database
npm run backup
```

## 📊 Monitoring

### Health Checks
- Frontend: `https://socialitix.com/health`
- Backend: `https://api.socialitix.com/health`

### Logging
- Application logs: CloudWatch
- Error tracking: Sentry
- Performance: New Relic

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Documentation: [docs.socialitix.com](https://docs.socialitix.com)
- Email: support@socialitix.com
- Discord: [Socialitix Community](https://discord.gg/socialitix)

## 🗺 Roadmap

### Q1 2024
- [x] Core video clipping functionality
- [x] AI engagement analysis
- [x] Polar.sh payment integration
- [ ] Mobile responsive design

### Q2 2024
- [ ] Advanced AI models
- [ ] Real-time collaboration
- [ ] API rate limiting improvements
- [ ] Advanced analytics dashboard

### Q3 2024
- [ ] Mobile app (React Native)
- [ ] Advanced video effects
- [ ] Team management features
- [ ] White-label solutions

---

Built with ❤️ by the Socialitix team 