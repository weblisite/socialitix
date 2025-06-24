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

export function VideoEditor() {
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
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#6366f1',
        progressColor: '#4f46e5',
        cursorColor: '#ef4444',
        barWidth: 2,
        barRadius: 1,
        responsive: true,
        height: 80,
        normalize: true,
        backend: 'WebAudio',
        mediaControls: false
      });

      // Load audio from video
      wavesurferRef.current.load(video.url);

      // Sync with video player
      wavesurferRef.current.on('audioprocess', (time) => {
        setCurrentTime(time);
        if (videoRef.current) {
          videoRef.current.currentTime = time;
        }
      });

      wavesurferRef.current.on('seek', (progress) => {
        const time = progress * video.duration;
        setCurrentTime(time);
        if (videoRef.current) {
          videoRef.current.currentTime = time;
        }
      });

      wavesurferRef.current.on('ready', () => {
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
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Video Editor</h1>
          <p className="text-slate-400">Create viral clips with AI-powered suggestions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Preview */}
            <div className="bg-slate-800 rounded-xl p-6">
              <div className="aspect-video bg-black rounded-lg mb-4 relative overflow-hidden">
                <video
                  ref={videoRef}
                  src={video.url}
                  className="w-full h-full object-contain"
                  muted
                />
                
                {/* Video Controls Overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/50 rounded-lg p-3 flex items-center gap-4">
                  <button
                    onClick={togglePlayPause}
                    className="flex items-center justify-center w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
                  >
                    {isPlaying ? (
                      <PauseIcon className="w-5 h-5" />
                    ) : (
                      <PlayIcon className="w-5 h-5 ml-0.5" />
                    )}
                  </button>
                  
                  <div className="flex-1 text-sm text-white">
                    {formatTime(currentTime)} / {formatTime(video.duration)}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Timeline</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAIPanel(!showAIPanel)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        showAIPanel ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      <SparklesIcon className="w-4 h-4 inline mr-1" />
                      AI Insights
                    </button>
                  </div>
                </div>

                {/* Waveform */}
                <div className="relative">
                  <div ref={waveformRef} className="waveform-container"></div>
                  
                  {/* Clip Selection Overlay */}
                  <div 
                    className="absolute top-0 bottom-0 bg-purple-500/30 border-2 border-purple-500 pointer-events-none"
                    style={{
                      left: `${(clipStart / video.duration) * 100}%`,
                      width: `${((clipEnd - clipStart) / video.duration) * 100}%`
                    }}
                  >
                    <div className="absolute -top-6 left-0 bg-purple-600 text-white px-2 py-1 rounded text-xs">
                      {formatTime(clipStart)}
                    </div>
                    <div className="absolute -top-6 right-0 bg-purple-600 text-white px-2 py-1 rounded text-xs">
                      {formatTime(clipEnd)}
                    </div>
                  </div>
                </div>

                {/* Timeline Controls */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={setClipStartTime}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors"
                  >
                    <ClockIcon className="w-4 h-4" />
                    Set Start
                  </button>
                  
                  <button
                    onClick={setClipEndTime}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
                  >
                    <ClockIcon className="w-4 h-4" />
                    Set End
                  </button>

                  <div className="flex-1 text-center text-sm text-slate-400">
                    Clip Duration: {formatTime(clipEnd - clipStart)}
                  </div>

                  <button
                    onClick={() => seekTo(clipStart)}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                  >
                    Preview Start
                  </button>
                </div>
              </div>
            </div>

            {/* Export Settings */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Export Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
                  <select
                    value={exportSettings.aspectRatio}
                    onChange={(e) => setExportSettings(prev => ({ 
                      ...prev, 
                      aspectRatio: e.target.value as '16:9' | '9:16' | '1:1' 
                    }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="9:16">9:16 (TikTok, Stories)</option>
                    <option value="1:1">1:1 (Instagram Post)</option>
                    <option value="16:9">16:9 (YouTube)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Quality</label>
                  <select
                    value={exportSettings.quality}
                    onChange={(e) => setExportSettings(prev => ({ 
                      ...prev, 
                      quality: e.target.value as 'high' | 'medium' | 'low' 
                    }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="high">High (2000k)</option>
                    <option value="medium">Medium (1000k)</option>
                    <option value="low">Low (500k)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Clip Title</label>
                  <input
                    type="text"
                    value={exportSettings.title}
                    onChange={(e) => setExportSettings(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter clip title"
                  />
                </div>
              </div>

              <button
                onClick={exportClip}
                disabled={isExporting}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                                            <ArrowDownTrayIcon className="w-5 h-5" />
                    Export Clip
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Suggestions Panel */}
          {showAIPanel && (
            <div className="lg:col-span-1 space-y-6">
              {/* Engagement Segments */}
              <div className="bg-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-purple-500" />
                  High Engagement
                </h3>
                
                <div className="space-y-3">
                  {video.engagementSegments?.map((segment, index) => (
                    <div
                      key={index}
                      onClick={() => selectEngagementSegment(segment)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedSegment === segment 
                          ? 'bg-purple-600/20 border border-purple-500' 
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {formatTime(segment.start)} - {formatTime(segment.end)}
                        </span>
                        <span className="text-xs bg-green-600 px-2 py-1 rounded">
                          {segment.score}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {segment.text}
                      </p>
                      {segment.emotions && (
                        <div className="flex gap-1 mt-2">
                          {segment.emotions.map(emotion => (
                            <span key={emotion} className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
                              {emotion}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Hooks */}
              <div className="bg-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ScissorsIcon className="w-5 h-5 text-green-500" />
                  Hook Opportunities
                </h3>
                
                <div className="space-y-3">
                  {video.hooks?.map((hook, index) => (
                    <div
                      key={index}
                      onClick={() => selectHook(hook)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedHook === hook 
                          ? 'bg-green-600/20 border border-green-500' 
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {formatTime(hook.timestamp)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          hook.type === 'question' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-yellow-600 text-white'
                        }`}>
                          {hook.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">
                        {hook.description}
                      </p>
                      <p className="text-xs text-slate-300 line-clamp-2">
                        "{hook.text}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (video.engagementSegments?.[0]) {
                        selectEngagementSegment(video.engagementSegments[0]);
                      }
                    }}
                    className="w-full text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                  >
                    Use Top Engagement
                  </button>
                  
                  <button
                    onClick={() => {
                      if (video.hooks?.[0]) {
                        selectHook(video.hooks[0]);
                      }
                    }}
                    className="w-full text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                  >
                    Use Best Hook
                  </button>
                  
                  <button
                    onClick={() => {
                      setClipStart(0);
                      setClipEnd(Math.min(60, video.duration));
                    }}
                    className="w-full text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                  >
                    First Minute Clip
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 