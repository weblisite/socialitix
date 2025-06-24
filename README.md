# Socialitix

AI-powered social media content creation platform that transforms long-form videos into viral short-form clips optimized for TikTok, Instagram Reels, YouTube Shorts, and Twitter.

## 🚀 Features

- **AI-Powered Video Analysis**: Automatically identifies the most engaging moments in your videos
- **Multi-Platform Optimization**: Creates clips optimized for TikTok (9:16), Instagram, YouTube Shorts, and Twitter
- **Viral Content Generation**: AI-generated hooks, trending hashtags, and engagement optimization
- **Cloud-Based Processing**: Professional video editing using Shotstack.io API
- **Real-Time Progress Tracking**: Monitor clip generation status with live updates
- **Secure File Storage**: Supabase storage with user authentication and access controls

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Zustand** for state management
- **React Query** for data fetching
- **Supabase** for authentication and database

### Backend
- **Vercel Serverless Functions** (Node.js)
- **Shotstack.io** for professional video processing and editing
- **Supabase** for database and file storage
- **AI Services** for content analysis and optimization

### Infrastructure
- **Vercel** for deployment and hosting
- **Supabase** for database, authentication, and storage
- **Shotstack.io** for cloud-based video processing

## 📋 Prerequisites

- Node.js 18+
- Supabase account and project
- Shotstack.io account and API key
- Vercel account (for deployment)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/socialitix.git
   cd socialitix
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd api && npm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Fill in your API keys and configuration

4. **Set up the database**
   ```bash
   # Run the database setup script in your Supabase SQL editor
   cat database/complete_setup.sql
   ```

5. **Start development servers**
   ```bash
   # Frontend (runs on http://localhost:3000)
   npm run dev
   
   # API is deployed to Vercel for serverless functions
   ```

## 📁 Project Structure

```
socialitix/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   └── stores/            # State management
├── api/                   # Serverless API functions
│   ├── _utils/            # Shared utilities and services
│   ├── auth/              # Authentication endpoints
│   ├── videos/            # Video management endpoints
│   ├── clips/             # Clip generation endpoints
│   └── jobs/              # Background job processing
├── database/              # Database schema and migrations
└── docs/                  # Documentation
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Shotstack Configuration
SHOTSTACK_API_KEY=your_shotstack_api_key

# Optional: Job Processing
JOB_PROCESSOR_TOKEN=your_job_processor_token
```

### Shotstack.io Setup

1. Create a Shotstack account at [shotstack.io](https://shotstack.io)
2. Get your API key from the dashboard
3. Add it to your environment variables
4. See `SHOTSTACK_SETUP.md` for detailed configuration

## 🎬 How It Works

1. **Upload**: Users upload their long-form videos through the web interface
2. **Analysis**: AI analyzes the video content to identify engaging moments
3. **Generation**: Shotstack.io creates optimized clips for different platforms
4. **Optimization**: AI adds viral hooks, trending hashtags, and platform-specific formatting
5. **Download**: Users can download their viral-ready clips

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npx vercel
   ```

2. **Configure environment variables** in the Vercel dashboard

3. **Deploy**
   ```bash
   npm run vercel-build
   ```

## 📖 API Documentation

### Video Endpoints
- `POST /api/videos/upload-url` - Get signed upload URL
- `POST /api/videos/complete-upload` - Complete video upload
- `GET /api/videos` - List user videos
- `GET /api/videos/status` - Get video processing status

### Clip Endpoints
- `POST /api/clips/generate` - Generate viral clips
- `GET /api/clips/status` - Check clip generation status

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@socialitix.com
- 💬 Discord: [Join our community](https://discord.gg/socialitix)
- 📖 Documentation: [docs.socialitix.com](https://docs.socialitix.com)

## 🙏 Acknowledgments

- [Shotstack.io](https://shotstack.io) for professional video processing
- [Supabase](https://supabase.com) for backend infrastructure
- [Vercel](https://vercel.com) for deployment platform
- [React](https://reactjs.org) and the amazing React ecosystem 