import React, { useState, useEffect } from 'react';
import {
  PlayIcon,
  EyeIcon,
  ShareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ScissorsIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';

interface Clip {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  createdDate: string;
  sourceVideo: string;
  platform: 'tiktok' | 'instagram' | 'youtube' | 'twitter' | 'linkedin';
  status: 'ready' | 'processing' | 'failed';
  views: number;
  likes: number;
  shares: number;
  aiScore: number;
  hook: string;
  startTime: number;
  endTime: number;
  videoId: string;
  type: string;
}

export const ClipLibrary: React.FC = () => {
  const [clips, setClips] = useState<Clip[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClips = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the current session token from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setError('Please log in to view your clips');
          setLoading(false);
          return;
        }

        // Fetch clips from the backend API
        const response = await fetch('/api/clips', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch clips: ${response.status}`);
        }

        const data = await response.json();
        setClips(data.clips || []);
      } catch (err) {
        console.error('Error fetching clips:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch clips');
      } finally {
        setLoading(false);
      }
    };

    fetchClips();
  }, []);

  const filteredClips = clips.filter(clip => {
    const matchesSearch = clip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clip.hook.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || clip.platform === filterPlatform;
    return matchesSearch && matchesPlatform;
  });

  const getPlatformIcon = (platform: string) => {
    const iconClass = "h-5 w-5";
    switch (platform) {
      case 'tiktok':
        return <div className={`${iconClass} bg-black rounded-full flex items-center justify-center text-white text-xs font-bold`}>TT</div>;
      case 'instagram':
        return <div className={`${iconClass} bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold`}>IG</div>;
      case 'youtube':
        return <div className={`${iconClass} bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold`}>YT</div>;
      default:
        return <div className={`${iconClass} bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold`}>SM</div>;
    }
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    if (score >= 70) return 'text-orange-400';
    return 'text-red-400';
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Clip Library</h1>
        <p className="text-slate-400">Manage all your AI-generated clips</p>
      </div>

      {/* Clip Library Content */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Your Clips</h2>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Create New Clip
          </button>
        </div>

        {/* Search and Filter */}
        {!loading && clips.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search clips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Platforms</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram</option>
              <option value="youtube">YouTube</option>
              <option value="twitter">Twitter</option>
              <option value="linkedin">LinkedIn</option>
            </select>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <span className="ml-3 text-slate-400">Loading clips...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-400 mb-2">⚠️ {error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="text-green-400 hover:text-green-300 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredClips.length === 0 && (
          <div className="text-center py-12">
            <ScissorsIcon className="h-16 w-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No clips found</h3>
            <p className="text-slate-400 mb-6">
              {clips.length === 0 
                ? "Upload and process videos to generate AI clips!" 
                : "No clips match your current filters."}
            </p>
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Upload Video
            </button>
          </div>
        )}

        {/* Clip Grid */}
        {!loading && !error && filteredClips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClips.map((clip) => (
              <div key={clip.id} className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors">
                <div className="aspect-video bg-gradient-to-br from-green-500 to-teal-600 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                  {clip.thumbnail ? (
                    <img 
                      src={clip.thumbnail} 
                      alt={clip.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ScissorsIcon className="h-12 w-12 text-white" />
                  )}
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    {getPlatformIcon(clip.platform)}
                    <span className={`text-xs font-bold ${getAIScoreColor(clip.aiScore)}`}>
                      {clip.aiScore}%
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {clip.duration}
                  </div>
                </div>
                
                <h3 className="text-white font-medium mb-2 truncate" title={clip.title}>
                  {clip.title}
                </h3>
                
                <p className="text-slate-400 text-sm mb-3 line-clamp-2" title={clip.hook}>
                  {clip.hook}
                </p>
                
                <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                  <span className="text-slate-500">From: {clip.sourceVideo}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    clip.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                    clip.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {clip.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <EyeIcon className="h-3 w-3" />
                      {clip.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <HeartIcon className="h-3 w-3" />
                      {clip.likes.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShareIcon className="h-3 w-3" />
                      {clip.shares.toLocaleString()}
                    </span>
                  </div>
                  <span>{formatDate(clip.createdDate)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1">
                    <PlayIcon className="h-4 w-4" />
                    Preview
                  </button>
                  <button className="bg-slate-600 hover:bg-slate-500 text-white p-2 rounded transition-colors">
                    <ShareIcon className="h-4 w-4" />
                  </button>
                  <button className="bg-slate-600 hover:bg-slate-500 text-white p-2 rounded transition-colors">
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
