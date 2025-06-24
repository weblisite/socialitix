# 🎬 Shotstack.io Integration Setup Guide

This guide will help you set up Shotstack.io for viral video clip generation in your Socialitix platform.

## 🚀 Why Shotstack.io?

Shotstack.io is a cloud-based video editing API that's perfect for Socialitix because:

- ✅ **No Server Infrastructure** - Fully cloud-based, perfect for Vercel deployment
- ✅ **JSON-Based Editing** - Easy integration with AI-generated clip parameters
- ✅ **Concurrent Rendering** - Generate thousands of clips simultaneously
- ✅ **Platform-Optimized** - Built-in support for TikTok, Instagram, YouTube formats
- ✅ **Professional Effects** - Built-in transitions, effects, and text overlays
- ✅ **Scalable** - Pay-per-render pricing model

## 📋 Prerequisites

1. **Shotstack Account** - Sign up at [shotstack.io](https://shotstack.io)
2. **Supabase Database** - Ensure your database is set up with the clips table
3. **Vercel Deployment** - Your app should be deployed on Vercel

## 🔧 Step 1: Get Your Shotstack API Key

1. **Sign up for Shotstack**:
   - Visit [https://shotstack.io](https://shotstack.io)
   - Click "Get Started" and create an account
   - Choose the **Developer Plan** (free tier with 20 renders/month)

2. **Get Your API Key**:
   - Log into your Shotstack dashboard
   - Navigate to **Settings** → **API Keys**
   - Copy your **Stage API Key** (for development)
   - Copy your **Production API Key** (for live deployment)

3. **API Key Format**:
   ```
   Stage: 01iAnt8r9nc0ChlGf9WGIfWPGCbxbJJTwBRkWtat
   Production: 01iAnt8r9nc0ChlGf9WGIfWPGCbxbJJTwBRkWtat
   ```

## 🌍 Step 2: Configure Environment Variables

### For Local Development (.env.local):
```bash
# Add this to your .env.local file
SHOTSTACK_API_KEY=your-stage-api-key-here
```

### For Vercel Deployment:
1. Go to your Vercel dashboard
2. Select your Socialitix project
3. Navigate to **Settings** → **Environment Variables**
4. Add:
   - **Name**: `SHOTSTACK_API_KEY`
   - **Value**: Your production API key
   - **Environment**: Production, Preview, Development

## 🗄️ Step 3: Database Setup

Ensure your Supabase database has the clips table. Run this SQL in your Supabase SQL Editor:

```sql
-- Create clips table if it doesn't exist
CREATE TABLE IF NOT EXISTS clips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time NUMERIC NOT NULL,
    end_time NUMERIC NOT NULL,
    platform TEXT NOT NULL DEFAULT 'tiktok',
    status TEXT NOT NULL DEFAULT 'processing',
    url TEXT,
    file_path TEXT,
    file_size BIGINT DEFAULT 0,
    duration NUMERIC,
    format TEXT DEFAULT 'mp4',
    hook TEXT,
    type TEXT DEFAULT 'short',
    ai_score NUMERIC DEFAULT 0,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    processing_progress INTEGER DEFAULT 0,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own clips" ON clips
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own clips" ON clips
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own clips" ON clips
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clips" ON clips
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS clips_user_id_idx ON clips(user_id);
CREATE INDEX IF NOT EXISTS clips_video_id_idx ON clips(video_id);
CREATE INDEX IF NOT EXISTS clips_status_idx ON clips(status);
CREATE INDEX IF NOT EXISTS clips_platform_idx ON clips(platform);
```

## 🚀 Step 4: Deploy to Vercel

1. **Commit Your Changes**:
   ```bash
   git add -A
   git commit -m "Add Shotstack.io integration"
   git push origin main
   ```

2. **Automatic Deployment**:
   - Vercel will automatically deploy your changes
   - Check the deployment logs for any errors

3. **Verify Environment Variables**:
   - Ensure `SHOTSTACK_API_KEY` is set in Vercel
   - Check that all other environment variables are configured

## 🧪 Step 5: Test the Integration

### 1. Test Video Upload
1. Go to your deployed app: `https://your-app.vercel.app`
2. Upload a test video
3. Verify it appears in your video library

### 2. Test Clip Generation
1. Navigate to **Video Editor** page
2. Select an uploaded video
3. Set start time, end time, and platform
4. Click "Generate Clip"
5. Monitor the progress in real-time

### 3. Expected Workflow
```
1. User clicks "Generate Clip"
2. Clip record created in database (status: processing)
3. Shotstack render job started (status: rendering)
4. Job queue polls Shotstack for status
5. When complete, clip URL updated (status: completed)
6. User can download the viral clip
```

## 📊 Platform-Specific Settings

The integration automatically optimizes clips for different platforms:

### TikTok / Instagram Reels
- **Aspect Ratio**: 9:16 (vertical)
- **Resolution**: 1080x1920
- **Duration**: 15-60 seconds
- **Effects**: Zoom, transitions, trending hashtags

### YouTube Shorts
- **Aspect Ratio**: 9:16 (vertical)
- **Resolution**: 1080x1920
- **Duration**: Up to 60 seconds
- **Effects**: Professional transitions, captions

### Twitter
- **Aspect Ratio**: 16:9 (horizontal)
- **Resolution**: 1280x720
- **Duration**: 15-30 seconds
- **Effects**: Clean, minimal styling

## 🎨 Viral Features Included

### AI-Powered Hooks
- Automatic text overlays with viral hooks
- Platform-specific trending hashtags
- Emotional engagement triggers

### Professional Effects
- **Zoom effects** for engagement
- **Fade transitions** between clips
- **Text animations** (slide up/down)
- **Background music** support

### Optimization
- **Auto-cropping** for platform requirements
- **Quality optimization** for fast loading
- **Format standardization** (MP4)

## 💰 Pricing Considerations

### Shotstack Pricing (as of 2024):
- **Developer Plan**: Free - 20 renders/month
- **Starter Plan**: $39/month - 500 renders
- **Professional Plan**: $99/month - 2000 renders
- **Enterprise**: Custom pricing

### Cost Optimization Tips:
1. **Cache popular clips** to avoid re-rendering
2. **Batch process** multiple clips together
3. **Use development API** for testing
4. **Monitor usage** in Shotstack dashboard

## 🐛 Troubleshooting

### Common Issues:

#### 1. "Shotstack API error: 401"
- **Cause**: Invalid API key
- **Solution**: Check your `SHOTSTACK_API_KEY` in environment variables

#### 2. "Render failed" status
- **Cause**: Invalid video URL or parameters
- **Solution**: Check video URL accessibility and clip duration

#### 3. Clips stuck in "processing"
- **Cause**: Job queue not running
- **Solution**: Check Vercel function logs and job processor

#### 4. "No more than 12 Serverless Functions"
- **Cause**: Vercel hobby plan limit
- **Solution**: Upgrade to Pro plan or optimize function count

### Debug Commands:

```bash
# Check environment variables
vercel env ls

# View function logs
vercel logs --follow

# Test API endpoint
curl https://your-app.vercel.app/api/clips/generate

# Check database
# Run in Supabase SQL Editor:
SELECT * FROM clips ORDER BY created_at DESC LIMIT 10;
```

## 📈 Monitoring & Analytics

### Track Key Metrics:
1. **Render Success Rate** - % of successful clip generations
2. **Processing Time** - Average time from request to completion
3. **Popular Platforms** - Which platforms users prefer
4. **Viral Score** - AI-generated engagement predictions

### Shotstack Dashboard:
- Monitor render usage and costs
- View render history and errors
- Track API performance

## 🚀 Next Steps

Once Shotstack is working:

1. **Add More Effects**: Explore Shotstack's effect library
2. **Batch Processing**: Generate multiple clips simultaneously
3. **AI Integration**: Use OpenAI to generate better hooks
4. **Analytics**: Track which clips perform best
5. **Social Sharing**: Add direct posting to social platforms

## 🔗 Useful Links

- [Shotstack Documentation](https://shotstack.io/docs/)
- [Shotstack API Reference](https://shotstack.io/docs/api/)
- [Video Editor Examples](https://shotstack.io/examples/)
- [Pricing Plans](https://shotstack.io/pricing/)

---

**🎉 Congratulations!** You've successfully integrated Shotstack.io for viral video clip generation. Your users can now create professional, platform-optimized clips with AI-powered viral elements! 