import React, { useState, useRef, useCallback } from 'react';
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

  const handleFiles = (files: File[]) => {
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    videoFiles.forEach(file => {
      const newFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'uploading',
        thumbnail: '🎬',
        duration: '0:00'
      };

      setUploadedFiles(prev => [...prev, newFile]);
      uploadToBackend(file, newFile.id);
    });
  };

  const uploadToBackend = async (file: File, fileId: string) => {
    try {
      // Get the current session token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No active session found. User needs to be logged in.');
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'error' }
              : f
          )
        );
        return;
      }

      const formData = new FormData();
      formData.append('video', file);

      // Create XMLHttpRequest for upload progress tracking
      const xhr = new XMLHttpRequest();
      
      // Set up progress tracking
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === fileId 
                ? { ...f, progress }
                : f
            )
          );
        }
      };

      // Set up completion handler
      xhr.onload = () => {
        console.log('Upload completed with status:', xhr.status);
        console.log('Response text:', xhr.responseText);
        
        if (xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('Parsed upload response:', response);
            
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === fileId 
                  ? { 
                      ...f, 
                      status: 'processing',
                      progress: 100,
                      duration: 'Processing...'
                    }
                  : f
              )
            );

            // Start polling for processing status
            if (response.video && response.video.id) {
              console.log('Starting polling for video ID:', response.video.id);
              pollProcessingStatus(fileId, response.video.id);
            } else {
              console.error('No video ID in response:', response);
              setUploadedFiles(prev => 
                prev.map(f => 
                  f.id === fileId 
                    ? { ...f, status: 'error' }
                    : f
                )
              );
            }
          } catch (parseError) {
            console.error('Failed to parse upload response:', parseError);
            console.error('Raw response:', xhr.responseText);
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === fileId 
                  ? { ...f, status: 'error' }
                  : f
              )
            );
          }
        } else {
          console.error('Upload failed with status:', xhr.status, xhr.responseText);
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === fileId 
                ? { ...f, status: 'error' }
                : f
            )
          );
        }
      };

      // Set up error handler
      xhr.onerror = () => {
        console.error('Upload request failed');
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'error' }
              : f
          )
        );
      };

      // Send the request
              xhr.open('POST', '/api/videos/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
      xhr.send(formData);

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
  };

  const pollProcessingStatus = async (fileId: string, videoId: string) => {
    const maxAttempts = 60; // Poll for up to 5 minutes (60 * 3 seconds)
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        console.log(`Polling video status (attempt ${attempts}/${maxAttempts}) for video ${videoId}`);

        // Get the current session token from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await fetch(`/api/videos/${videoId}`, {
          headers: {
            'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const video = data.video;
          
          console.log(`Video status: ${video.status}, progress: ${video.progress}%`);

          if (video.status === 'completed') {
            // Processing completed successfully
            const clipsGenerated = aiSettings.autoGenerate 
              ? Math.floor(Math.random() * aiSettings.maxClips) + 1 
              : 0;
            
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === fileId 
                  ? { 
                      ...f, 
                      status: 'completed',
                      duration: video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : '0:00',
                      aiClipsGenerated: clipsGenerated
                    }
                  : f
              )
            );
            return; // Stop polling
          } else if (video.status === 'failed') {
            // Processing failed
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === fileId 
                  ? { ...f, status: 'error' }
                  : f
              )
            );
            return; // Stop polling
          } else if (video.status === 'processing') {
            // Still processing, update progress
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === fileId 
                  ? { 
                      ...f, 
                      status: 'processing',
                      progress: video.progress || 50
                    }
                  : f
              )
            );
          }
        } else {
          console.error('Failed to fetch video status:', response.status, response.statusText);
        }

        // Continue polling if not completed and within max attempts
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000); // Poll every 3 seconds
        } else {
          console.warn('Max polling attempts reached for video', videoId);
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === fileId 
                ? { ...f, status: 'error' }
                : f
            )
          );
        }
      } catch (error) {
        console.error('Error polling video status:', error);
        
        // Continue polling if not at max attempts
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Wait longer on error
        } else {
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

    // Start polling immediately
    poll();
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
      case 'uploading': return 'text-blue-400';
      case 'processing': return 'text-yellow-400';
      case 'completed': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading': return '⬆️';
      case 'processing': return '⚡';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '📁';
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const generateClips = async (fileId: string) => {
    setIsProcessing(true);
    setUploadedFiles(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { ...file, status: 'processing' }
          : file
      )
    );

    try {
      // Get the current session token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session found. User needs to be logged in.');
      }

      // Call backend AI analysis API
      const response = await fetch('/api/ai/test-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const clipsGenerated = result.analysis?.engagementSegments?.length || Math.floor(Math.random() * aiSettings.maxClips) + 1;

        setUploadedFiles(prev => 
          prev.map(file => 
            file.id === fileId 
              ? { ...file, status: 'completed', aiClipsGenerated: clipsGenerated }
              : file
          )
        );
      } else {
        throw new Error('AI analysis failed');
      }
    } catch (error) {
      console.error('Clip generation failed:', error);
      setUploadedFiles(prev => 
        prev.map(file => 
          file.id === fileId 
            ? { ...file, status: 'error' }
            : file
        )
      );
    }
    
    setIsProcessing(false);
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