import React, { useState, useEffect, useRef } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  ScissorsIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import WaveSurfer from 'wavesurfer.js';
import { supabase } from '../lib/supabase';

interface EngagementSegment {
  start: number;
  end: number;
  score: number;
  confidence: number;
  text: string;
  emotions?: string[];
}

interface Hook {
  timestamp: number;
  type: 'question' | 'statement' | 'visual' | 'audio' | 'transition';
  confidence: number;
  text: string;
  description: string;
  suggestedClipStart: number;
  suggestedClipEnd: number;
}

interface VideoData {
  id: string;
  title: string;
  url: string;
  duration: number;
  transcript?: string;
  engagementSegments?: EngagementSegment[];
  hooks?: Hook[];
}

interface Video {
  id: string;
  title: string;
  url: string;
  duration: number;
}

interface Clip {
  id: string;
  title: string;
  status: string;
  url?: string;
  progress: number;
  platform: string;
  startTime: number;
  endTime: number;
  error?: string;
}

export default function VideoEditor() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Clip generation form state
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(15);
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('tiktok');
  const [hook, setHook] = useState('');

  const [video, setVideo] = useState<VideoData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(30);
  const [selectedSegment, setSelectedSegment] = useState<EngagementSegment | null>(null);
  const [selectedHook, setSelectedHook] = useState<Hook | null>(null);
  const [exportSettings, setExportSettings] = useState({
    aspectRatio: '9:16' as '16:9' | '9:16' | '1:1',
    quality: 'high' as 'high' | 'medium' | 'low',
    title: ''
  });
  const [isExporting, setIsExporting] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/videos', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos || []);
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
    }
  };

  const fetchClips = async () => {
    if (!selectedVideo) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/clips?videoId=${selectedVideo.id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClips(data.clips || []);
      }
    } catch (err) {
      console.error('Error fetching clips:', err);
    }
  };

  const generateClip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVideo) return;

    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch('/api/clips/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          videoId: selectedVideo.id,
          startTime: startTime,
          endTime: endTime,
          title: title || `${selectedVideo.title} - ${platform} Clip`,
          platform: platform,
          hook: hook,
          style: {
            effect: 'zoomIn'
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate clip');
      }

      const result = await response.json();
      console.log('Clip generation started:', result);
      
      // Add the new clip to the list
      const newClip: Clip = {
        id: result.clip.id,
        title: result.clip.title,
        status: result.clip.status,
        progress: 0,
        platform: result.clip.platform,
        startTime: result.clip.startTime,
        endTime: result.clip.endTime
      };
      
      setClips(prevClips => [newClip, ...prevClips]);
      
      // Reset form
      setTitle('');
      setHook('');
      setStartTime(0);
      setEndTime(15);
      
      // Start polling for status updates
      pollClipStatus(result.clip.id);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate clip');
    } finally {
      setLoading(false);
    }
  };

  const pollClipStatus = async (clipId: string) => {
    const maxAttempts = 30; // 5 minutes max
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch(`/api/clips/status?clipId=${clipId}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const clipStatus = await response.json();
          
          // Update clip in the list
          setClips(prevClips => 
            prevClips.map(clip => 
              clip.id === clipId 
                ? { 
                    ...clip, 
                    status: clipStatus.status,
                    progress: clipStatus.progress || 0,
                    url: clipStatus.url,
                    error: clipStatus.error
                  }
                : clip
            )
          );

          // Continue polling if still processing
          if (clipStatus.status === 'rendering' || clipStatus.status === 'processing') {
            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(checkStatus, 10000); // Check every 10 seconds
            }
          }
        }
      } catch (err) {
        console.error('Error checking clip status:', err);
      }
    };

    checkStatus();
  };

  useEffect(() => {
    if (selectedVideo) {
      fetchClips();
    }
  }, [selectedVideo]);

  // Mock video data - in real app, this would come from props or API
  useEffect(() => {
    const mockVideo: VideoData = {
      id: '1',
      title: 'Sample Video for Editing',
      url: '/api/videos/sample.mp4',
      duration: 180, // 3 minutes
      transcript: 'This is a sample transcript of the video content...',
      engagementSegments: [
        {
          start: 15,
          end: 30,
          score: 92,
          confidence: 0.85,
          text: "This is where the most engaging content happens",
          emotions: ['excited', 'positive']
        },
        {
          start: 45,
          end: 60,
          score: 88,
          confidence: 0.82,
          text: "Another high-engagement moment",
          emotions: ['positive']
        },
        {
          start: 120,
          end: 135,
          score: 85,
          confidence: 0.78,
          text: "Peak moment that captures attention",
          emotions: ['surprised', 'positive']
        }
      ],
      hooks: [
        {
          timestamp: 5,
          type: 'question',
          confidence: 0.9,
          text: "Have you ever wondered why this happens?",
          description: "Engaging question hook",
          suggestedClipStart: 3,
          suggestedClipEnd: 18
        },
        {
          timestamp: 75,
          type: 'statement',
          confidence: 0.8,
          text: "This will blow your mind!",
          description: "Bold attention-grabbing statement",
          suggestedClipStart: 73,
          suggestedClipEnd: 88
        }
      ]
    };
    
    setVideo(mockVideo);
    setClipEnd(Math.min(30, mockVideo.duration));
    setExportSettings(prev => ({ ...prev, title: `Clip from ${mockVideo.title}` }));
  }, []);

  // Initialize WaveSurfer
  useEffect(() => {
    if (waveformRef.current && video && !wavesurferRef.current) {
      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#64748b',
        progressColor: '#4f46e5',
        cursorColor: '#ef4444',
        barWidth: 2,
        barRadius: 1,
        height: 80,
        normalize: true,
        backend: 'WebAudio',
        mediaControls: false
      });

      // Load audio from video
      wavesurferRef.current = wavesurfer;
      wavesurferRef.current.load(video.url);

      // Sync with video player
      wavesurferRef.current.on('audioprocess', (time: number) => {
        setCurrentTime(time);
        if (videoRef.current) {
          videoRef.current.currentTime = time;
        }
      });

      (wavesurferRef.current as any).on('seek', (progress: number) => {
        const time = (progress || 0) * (video.duration || 0);
        setCurrentTime(time);
        if (videoRef.current) {
          videoRef.current.currentTime = time;
        }
      });

      wavesurfer.on('ready', () => {
        // Add engagement segment overlays
        if (video.engagementSegments) {
          video.engagementSegments.forEach((segment, index) => {
            const startPercent = (segment.start / video.duration) * 100;
            const endPercent = (segment.end / video.duration) * 100;
            
            // Create engagement overlay element
            const overlay = document.createElement('div');
            overlay.className = 'engagement-peak';
            overlay.style.left = `${startPercent}%`;
            overlay.style.width = `${endPercent - startPercent}%`;
            overlay.style.backgroundColor = `rgba(59, 130, 246, ${segment.score / 100 * 0.5})`;
            overlay.title = `Engagement: ${segment.score}% - ${segment.text}`;
            
            waveformRef.current?.appendChild(overlay);
          });
        }

        // Add hook markers
        if (video.hooks) {
          video.hooks.forEach((hook) => {
            const percent = (hook.timestamp / video.duration) * 100;
            
            const marker = document.createElement('div');
            marker.className = 'hook-marker';
            marker.style.left = `${percent}%`;
            marker.style.backgroundColor = hook.type === 'question' ? '#10b981' : '#f59e0b';
            marker.title = `${hook.type}: ${hook.text}`;
            
            waveformRef.current?.appendChild(marker);
          });
        }
      });
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [video]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      if (isPlaying) {
        wavesurferRef.current.pause();
        if (videoRef.current) videoRef.current.pause();
      } else {
        wavesurferRef.current.play();
        if (videoRef.current) videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seekTo = (time: number) => {
    if (wavesurferRef.current && video) {
      const progress = time / video.duration;
      wavesurferRef.current.seekTo(progress);
    }
  };

  const setClipStartTime = () => {
    setClipStart(currentTime);
    if (clipEnd <= currentTime) {
      setClipEnd(Math.min(currentTime + 30, video?.duration || 30));
    }
  };

  const setClipEndTime = () => {
    setClipEnd(currentTime);
    if (clipStart >= currentTime) {
      setClipStart(Math.max(currentTime - 30, 0));
    }
  };

  const selectEngagementSegment = (segment: EngagementSegment) => {
    setSelectedSegment(segment);
    setClipStart(Math.max(0, segment.start - 2));
    setClipEnd(Math.min(video?.duration || 0, segment.end + 2));
    seekTo(segment.start);
  };

  const selectHook = (hook: Hook) => {
    setSelectedHook(hook);
    setClipStart(hook.suggestedClipStart);
    setClipEnd(hook.suggestedClipEnd);
    seekTo(hook.timestamp);
  };

  const exportClip = async () => {
    if (!video) return;

    setIsExporting(true);
    try {
      const response = await fetch(`/api/videos/${video.id}/clips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          startTime: clipStart,
          duration: clipEnd - clipStart,
          title: exportSettings.title,
          aspectRatio: exportSettings.aspectRatio,
          quality: exportSettings.quality
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Handle successful export
        alert(`Clip created successfully: ${result.title}`);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export clip');
    } finally {
      setIsExporting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!video) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading video editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Video Editor</h1>
          <p className="text-gray-600 mt-2">
            Create viral clips using AI-powered Shotstack video editing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Select Video</h2>
              <div className="space-y-3">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedVideo?.id === video.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedVideo(video)}
                  >
                    <h3 className="font-medium text-gray-900">{video.title}</h3>
                    <p className="text-sm text-gray-500">
                      Duration: {Math.round(video.duration)}s
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Clip Generation Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Generate Clip</h2>
              
              {selectedVideo ? (
                <form onSubmit={generateClip} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Clip Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={`${selectedVideo.title} - ${platform} Clip`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time (s)
                      </label>
                      <input
                        type="number"
                        value={startTime}
                        onChange={(e) => setStartTime(Number(e.target.value))}
                        min="0"
                        max={selectedVideo.duration - 1}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time (s)
                      </label>
                      <input
                        type="number"
                        value={endTime}
                        onChange={(e) => setEndTime(Number(e.target.value))}
                        min={startTime + 1}
                        max={Math.min(selectedVideo.duration, startTime + 60)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Platform
                    </label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="tiktok">TikTok</option>
                      <option value="instagram">Instagram Reels</option>
                      <option value="youtube">YouTube Shorts</option>
                      <option value="twitter">Twitter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hook Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={hook}
                      onChange={(e) => setHook(e.target.value)}
                      placeholder="Viral hook text for the clip"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm">{error}</div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || endTime <= startTime}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Generating...' : 'Generate Clip'}
                  </button>

                  <div className="text-xs text-gray-500">
                    Duration: {endTime - startTime}s (max 60s for viral content)
                  </div>
                </form>
              ) : (
                <p className="text-gray-500">Select a video to generate clips</p>
              )}
            </div>
          </div>

          {/* Generated Clips */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Generated Clips</h2>
              
              <div className="space-y-4">
                {clips.map((clip) => (
                  <div key={clip.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{clip.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        clip.status === 'completed' ? 'bg-green-100 text-green-800' :
                        clip.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {clip.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      {clip.platform} • {clip.startTime}s - {clip.endTime}s
                    </div>

                    {clip.status === 'rendering' || clip.status === 'processing' ? (
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Processing...</span>
                          <span>{clip.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${clip.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : null}

                    {clip.status === 'completed' && clip.url && (
                      <div className="mt-2">
                        <a
                          href={clip.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Download Clip
                        </a>
                      </div>
                    )}

                    {clip.status === 'failed' && clip.error && (
                      <div className="text-red-600 text-sm mt-2">
                        Error: {clip.error}
                      </div>
                    )}
                  </div>
                ))}

                {clips.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No clips generated yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 