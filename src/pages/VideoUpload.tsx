import React, { useState, useRef, useCallback } from 'react';
import { useDirectUpload } from '../hooks/useDirectUpload';
import { supabase } from '../lib/supabase';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  thumbnail?: string;
  duration?: string;
  aiClipsGenerated?: number;
  videoId?: string;
}

interface AISettings {
  autoGenerate: boolean;
  viralThreshold: number;
  platforms: string[];
  clipDuration: number;
  maxClips: number;
}

export const VideoUpload: React.FC = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [aiSettings, setAiSettings] = useState<AISettings>({
    autoGenerate: true,
    viralThreshold: 75,
    platforms: ['TikTok', 'Instagram', 'YouTube'],
    clipDuration: 60,
    maxClips: 5
  });

  const { uploadFile } = useDirectUpload({
    onProgress: (progress) => {
      // Update progress for the currently uploading file
      setUploadedFiles(prev => 
        prev.map(f => 
          f.status === 'uploading' 
            ? { ...f, progress: progress.percentage }
            : f
        )
      );
    },
    onComplete: (result) => {
      if (result.success && result.videoId) {
        // Update file status to processing and start polling
        setUploadedFiles(prev => 
          prev.map(f => 
            f.status === 'uploading' 
              ? { 
                  ...f, 
                  status: 'processing',
                  progress: 100,
                  videoId: result.videoId,
                  duration: 'Processing...'
                }
              : f
          )
        );
        
        // Start polling for processing status
        if (result.videoId) {
          pollProcessingStatus(result.videoId);
        }
      } else {
        // Mark as error
        setUploadedFiles(prev => 
          prev.map(f => 
            f.status === 'uploading' 
              ? { ...f, status: 'error' }
              : f
          )
        );
      }
    }
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  }, []);

  const handleFiles = async (files: File[]) => {
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    for (const file of videoFiles) {
      const fileId = Math.random().toString(36).substr(2, 9);
      
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'uploading',
        thumbnail: '🎬',
        duration: '0:00'
      };

      setUploadedFiles(prev => [...prev, newFile]);

      try {
        await uploadFile(file, file.name);
      } catch (error) {
        console.error('Upload failed:', error);
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'error' }
              : f
          )
        );
      }
    }
  };

  const pollProcessingStatus = async (videoId: string) => {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        
        const response = await fetch(`/api/videos/${videoId}/status`, {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          setUploadedFiles(prev => 
            prev.map(f => 
              f.videoId === videoId 
                ? {
                    ...f,
                    status: data.status === 'completed' ? 'completed' : 'processing',
                    progress: data.progress || f.progress,
                    duration: data.duration ? formatDuration(data.duration) : f.duration,
                    aiClipsGenerated: data.ai_suggestions?.clips?.length || 0
                  }
                : f
            )
          );

          if (data.status === 'completed' || data.status === 'failed' || attempts >= maxAttempts) {
            return; // Stop polling
          }

          // Continue polling
          setTimeout(poll, 5000);
        } else {
          console.error('Failed to fetch video status');
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000);
          }
        }
      } catch (error) {
        console.error('Error polling video status:', error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        }
      }
    };

    poll();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading': return 'text-blue-600';
      case 'processing': return 'text-yellow-600';
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading': return '⬆️';
      case 'processing': return '⚙️';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '📝';
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const generateClips = async (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file || !file.videoId) return;

    try {
      const response = await fetch('/api/clips/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          videoId: file.videoId,
          settings: aiSettings
        }),
      });

      if (response.ok) {
        console.log('Clip generation started');
      } else {
        console.error('Failed to start clip generation');
      }
    } catch (error) {
      console.error('Error generating clips:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-indigo-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Upload Your <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Videos</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Upload your videos and let our AI create viral clips automatically. 
              Support for all major video formats up to 4K resolution.
            </p>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Upload Area */}
            <div className="lg:col-span-2">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  isDragOver
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-slate-600 hover:border-purple-500/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <div className="space-y-4">
                  <div className="text-6xl">🎬</div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Drop your videos here
                    </h3>
                    <p className="text-gray-400 mb-6">
                      or click to browse your files
                    </p>
                  </div>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-semibold transition-all"
                  >
                    Select Videos
                  </button>
                  
                  <div className="text-sm text-gray-500 mt-4">
                    Supports MP4, MOV, AVI, MKV • Max 2GB per file
                  </div>
                </div>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Uploaded Videos</h3>
                  <div className="space-y-4">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="bg-slate-700/50 rounded-lg p-4">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{file.thumbnail}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-white font-medium">{file.name}</h4>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm ${getStatusColor(file.status)}`}>
                                  {getStatusIcon(file.status)} {file.status}
                                </span>
                                <button
                                  onClick={() => removeFile(file.id)}
                                  className="text-gray-400 hover:text-red-400 text-sm"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                              <span>{formatFileSize(file.size)}</span>
                              <span>{file.duration}</span>
                              {file.aiClipsGenerated && (
                                <span className="text-purple-400">
                                  {file.aiClipsGenerated} clips generated
                                </span>
                              )}
                            </div>

                            {file.status === 'uploading' && (
                              <div className="w-full bg-slate-600 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                                  style={{ width: `${file.progress}%` }}
                                ></div>
                              </div>
                            )}

                            {file.status === 'processing' && (
                              <div className="w-full bg-slate-600 rounded-full h-2">
                                <div className="bg-yellow-500 h-2 rounded-full animate-pulse w-full"></div>
                              </div>
                            )}

                            {file.status === 'completed' && !file.aiClipsGenerated && (
                              <button
                                onClick={() => generateClips(file.id)}
                                disabled={isProcessing}
                                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                Generate AI Clips
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Settings */}
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">AI Settings</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">Auto-Generate Clips</div>
                      <div className="text-gray-400 text-sm">Generate clips automatically after upload</div>
                    </div>
                    <button
                      onClick={() => setAiSettings(prev => ({ ...prev, autoGenerate: !prev.autoGenerate }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        aiSettings.autoGenerate ? 'bg-purple-600' : 'bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          aiSettings.autoGenerate ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Viral Threshold ({aiSettings.viralThreshold}%)
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="95"
                      value={aiSettings.viralThreshold}
                      onChange={(e) => setAiSettings(prev => ({ ...prev, viralThreshold: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>50%</span>
                      <span>95%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Target Platforms</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['TikTok', 'Instagram', 'YouTube', 'Twitter'].map((platform) => (
                        <button
                          key={platform}
                          onClick={() => {
                            setAiSettings(prev => ({
                              ...prev,
                              platforms: prev.platforms.includes(platform)
                                ? prev.platforms.filter(p => p !== platform)
                                : [...prev.platforms, platform]
                            }));
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            aiSettings.platforms.includes(platform)
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                          }`}
                        >
                          {platform}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Clips per Video
                    </label>
                    <select
                      value={aiSettings.maxClips}
                      onChange={(e) => setAiSettings(prev => ({ ...prev, maxClips: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value={3}>3 clips</option>
                      <option value={5}>5 clips</option>
                      <option value={8}>8 clips</option>
                      <option value={10}>10 clips</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Clip Duration
                    </label>
                    <select
                      value={aiSettings.clipDuration}
                      onChange={(e) => setAiSettings(prev => ({ ...prev, clipDuration: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value={15}>15 seconds</option>
                      <option value={30}>30 seconds</option>
                      <option value={60}>60 seconds</option>
                      <option value={90}>90 seconds</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Upload Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Videos</span>
                    <span className="text-white">{uploadedFiles.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Completed</span>
                    <span className="text-green-400">
                      {uploadedFiles.filter(f => f.status === 'completed').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Processing</span>
                    <span className="text-yellow-400">
                      {uploadedFiles.filter(f => f.status === 'processing').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">AI Clips Generated</span>
                    <span className="text-purple-400">
                      {uploadedFiles.reduce((sum, f) => sum + (f.aiClipsGenerated || 0), 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">💡 Pro Tip</h3>
                <p className="text-gray-300 text-sm">
                  Upload videos with clear speech and engaging visuals for best AI clip results. 
                  Our algorithm works best with content that has natural pauses and highlights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}; 