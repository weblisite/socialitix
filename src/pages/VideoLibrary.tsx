import React, { useState, useEffect } from 'react';
import {
  PlayIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  VideoCameraIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';

interface Video {
  id: string;
  title: string;
  filename: string;
  original_filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  duration: number;
  file_size: number;
  url: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

// Helper functions
const formatDuration = (seconds: number): string => {
  if (seconds === 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  
  return date.toLocaleDateString();
};

export const VideoLibrary: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the current session token from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setError('Please log in to view your videos');
          setLoading(false);
          return;
        }

        // Fetch videos from the backend API
        const response = await fetch('/api/videos', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch videos: ${response.status}`);
        }

        const data = await response.json();
        setVideos(data.videos || []);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch videos');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || video.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'processing': return 'bg-yellow-500/20 text-yellow-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Video Library</h1>
        <p className="text-slate-400">Manage all your uploaded videos</p>
      </div>

      {/* Video Library Content */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Your Videos</h2>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Upload New Video
          </button>
        </div>

        {/* Search and Filter */}
        {!loading && videos.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="ml-3 text-slate-400">Loading videos...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-400 mb-2">⚠️ {error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <VideoCameraIcon className="h-16 w-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No videos found</h3>
            <p className="text-slate-400 mb-6">
              {videos.length === 0 
                ? "Upload your first video to get started!" 
                : "No videos match your current filters."}
            </p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Upload Video
            </button>
          </div>
        )}

        {/* Video Grid */}
        {!loading && !error && filteredVideos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div key={video.id} className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors">
                <div className="aspect-video bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg mb-4 flex items-center justify-center relative">
                  {video.thumbnail_url ? (
                    <img 
                      src={video.thumbnail_url} 
                      alt={video.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <VideoCameraIcon className="h-12 w-12 text-white" />
                  )}
                  
                  {/* Status Badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(video.status)}`}>
                    {video.status}
                  </div>

                  {/* Progress Bar for Processing Videos */}
                  {video.status === 'processing' && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="bg-black/50 rounded-full h-1.5">
                        <div 
                          className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${video.progress}%` }}
                        ></div>
                      </div>
              </div>
                  )}
                </div>

                <h3 className="text-white font-medium mb-2 truncate" title={video.title}>
                  {video.title}
                </h3>
                
                <div className="space-y-1 text-sm text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>{formatDuration(video.duration)}</span>
                    <span>{formatFileSize(video.file_size)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{formatDate(video.created_at)}</span>
                    {video.status === 'processing' && (
                      <span className="text-yellow-400">{video.progress}%</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-4">
                  <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors">
                    <PlayIcon className="h-4 w-4 inline mr-1" />
                    View
                  </button>
                  <button className="p-2 text-slate-400 hover:text-white transition-colors">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                    <TrashIcon className="h-4 w-4" />
                  </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};
