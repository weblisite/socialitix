import React, { useState } from 'react';

interface VideoMetrics {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  engagement: number;
  viralScore: number;
  platform: string;
  createdAt: string;
  revenue: number;
}

interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  totalRevenue: number;
  avgEngagement: number;
  topPerformingVideo: VideoMetrics;
  recentVideos: VideoMetrics[];
}

export const Analytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'tiktok' | 'instagram' | 'youtube'>('all');

  // Mock data - in real app this would come from API
  const analyticsData: AnalyticsData = {
    totalViews: 15420000,
    totalLikes: 890000,
    totalShares: 125000,
    totalRevenue: 24580,
    avgEngagement: 8.4,
    topPerformingVideo: {
      id: '1',
      title: 'AI Predicts My Next Viral Video',
      thumbnail: '🎯',
      views: 2400000,
      likes: 180000,
      shares: 25000,
      comments: 8500,
      engagement: 12.8,
      viralScore: 94,
      platform: 'TikTok',
      createdAt: '2024-12-15',
      revenue: 4200
    },
    recentVideos: [
      {
        id: '1',
        title: 'AI Predicts My Next Viral Video',
        thumbnail: '🎯',
        views: 2400000,
        likes: 180000,
        shares: 25000,
        comments: 8500,
        engagement: 12.8,
        viralScore: 94,
        platform: 'TikTok',
        createdAt: '2024-12-15',
        revenue: 4200
      },
      {
        id: '2',
        title: 'Secret to 10M Views Revealed',
        thumbnail: '🔥',
        views: 1800000,
        likes: 145000,
        shares: 18000,
        comments: 6200,
        engagement: 11.2,
        viralScore: 87,
        platform: 'Instagram',
        createdAt: '2024-12-12',
        revenue: 3100
      },
      {
        id: '3',
        title: 'Why 99% of Content Fails',
        thumbnail: '💡',
        views: 1200000,
        likes: 89000,
        shares: 12000,
        comments: 4100,
        engagement: 9.8,
        viralScore: 76,
        platform: 'YouTube',
        createdAt: '2024-12-10',
        revenue: 2800
      },
      {
        id: '4',
        title: 'Algorithm Secrets Exposed',
        thumbnail: '🤖',
        views: 950000,
        likes: 67000,
        shares: 9500,
        comments: 3200,
        engagement: 8.9,
        viralScore: 72,
        platform: 'TikTok',
        createdAt: '2024-12-08',
        revenue: 1900
      }
    ]
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'tiktok': return 'bg-pink-600';
      case 'instagram': return 'bg-purple-600';
      case 'youtube': return 'bg-red-600';
      default: return 'bg-blue-600';
    }
  };

  const getViralScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-indigo-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Content <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Analytics</span>
              </h1>
              <p className="text-xl text-gray-300">
                Deep insights into your viral content performance
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6 md:mt-0">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value as any)}
                className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Platforms</option>
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Total Views</h3>
                <span className="text-2xl">👁️</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {formatNumber(analyticsData.totalViews)}
              </div>
              <div className="text-green-400 text-sm">
                +23.5% from last period
              </div>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Total Likes</h3>
                <span className="text-2xl">❤️</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {formatNumber(analyticsData.totalLikes)}
              </div>
              <div className="text-green-400 text-sm">
                +18.2% from last period
              </div>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Total Shares</h3>
                <span className="text-2xl">🔄</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {formatNumber(analyticsData.totalShares)}
              </div>
              <div className="text-green-400 text-sm">
                +31.7% from last period
              </div>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Revenue</h3>
                <span className="text-2xl">💰</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                ${analyticsData.totalRevenue.toLocaleString()}
              </div>
              <div className="text-green-400 text-sm">
                +45.3% from last period
              </div>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-400">Avg Engagement</h3>
                <span className="text-2xl">📊</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {analyticsData.avgEngagement}%
              </div>
              <div className="text-green-400 text-sm">
                +2.1% from last period
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Performance Chart */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Performance Trends</h3>
              <div className="h-64 flex items-end justify-between gap-2">
                {[65, 78, 85, 92, 88, 95, 89, 97, 84, 91, 88, 94, 96, 88].map((height, index) => (
                  <div key={index} className="flex-1 bg-gradient-to-t from-purple-600 to-pink-600 rounded-t" style={{ height: `${height}%` }}></div>
                ))}
              </div>
              <div className="flex justify-between text-sm text-gray-400 mt-4">
                <span>2 weeks ago</span>
                <span>1 week ago</span>
                <span>Today</span>
              </div>
            </div>

            {/* Platform Distribution */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Platform Distribution</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-pink-600 rounded"></div>
                    <span className="text-gray-300">TikTok</span>
                  </div>
                  <span className="text-white font-semibold">45.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-purple-600 rounded"></div>
                    <span className="text-gray-300">Instagram</span>
                  </div>
                  <span className="text-white font-semibold">32.8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-red-600 rounded"></div>
                    <span className="text-gray-300">YouTube</span>
                  </div>
                  <span className="text-white font-semibold">22.0%</span>
                </div>
              </div>
              
              <div className="mt-6 h-32 bg-slate-700 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 flex">
                  <div className="bg-pink-600 flex-1" style={{ width: '45.2%' }}></div>
                  <div className="bg-purple-600 flex-1" style={{ width: '32.8%' }}></div>
                  <div className="bg-red-600 flex-1" style={{ width: '22.0%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing Video */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-8 mb-12">
            <h3 className="text-2xl font-bold text-white mb-6">🏆 Top Performing Video</h3>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{analyticsData.topPerformingVideo.thumbnail}</span>
                  <div>
                    <h4 className="text-xl font-bold text-white">{analyticsData.topPerformingVideo.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getPlatformColor(analyticsData.topPerformingVideo.platform)}`}>
                        {analyticsData.topPerformingVideo.platform}
                      </span>
                      <span className="text-gray-400">{analyticsData.topPerformingVideo.createdAt}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-white">{formatNumber(analyticsData.topPerformingVideo.views)}</div>
                    <div className="text-sm text-gray-400">Views</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{formatNumber(analyticsData.topPerformingVideo.likes)}</div>
                    <div className="text-sm text-gray-400">Likes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{formatNumber(analyticsData.topPerformingVideo.shares)}</div>
                    <div className="text-sm text-gray-400">Shares</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">${analyticsData.topPerformingVideo.revenue}</div>
                    <div className="text-sm text-gray-400">Revenue</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col justify-center items-center text-center">
                <div className={`text-5xl font-bold mb-2 ${getViralScoreColor(analyticsData.topPerformingVideo.viralScore)}`}>
                  {analyticsData.topPerformingVideo.viralScore}
                </div>
                <div className="text-white font-semibold mb-1">Viral Score</div>
                <div className="text-gray-400 text-sm">
                  {analyticsData.topPerformingVideo.engagement}% engagement rate
                </div>
              </div>
            </div>
          </div>

          {/* Recent Videos */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-white mb-6">Recent Videos Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Video</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-400">Platform</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-400">Views</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-400">Engagement</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-400">Viral Score</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-400">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {analyticsData.recentVideos.map((video) => (
                    <tr key={video.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{video.thumbnail}</span>
                          <div>
                            <div className="font-medium text-white">{video.title}</div>
                            <div className="text-sm text-gray-400">{video.createdAt}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getPlatformColor(video.platform)}`}>
                          {video.platform}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-white font-semibold">
                        {formatNumber(video.views)}
                      </td>
                      <td className="py-4 px-4 text-center text-white">
                        {video.engagement}%
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`font-bold ${getViralScoreColor(video.viralScore)}`}>
                          {video.viralScore}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-white font-semibold">
                        ${video.revenue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Action Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900/30 to-blue-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to <span className="text-purple-400">Optimize</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Use these insights to create even more viral content. 
            Our AI can help you replicate your top-performing patterns.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all">
              Generate New Clips
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all border border-slate-600">
              Export Report
            </button>
          </div>
        </div>
      </section>

      {/* Additional Content Section for Testing Scrolling */}
      <section className="py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-8">Detailed Analytics Breakdown</h2>
          
          {/* Additional metrics cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Top Performing Hours</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">8:00 PM - 10:00 PM</span>
                  <span className="text-green-400 font-semibold">2.4M views</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">6:00 PM - 8:00 PM</span>
                  <span className="text-green-400 font-semibold">1.8M views</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">12:00 PM - 2:00 PM</span>
                  <span className="text-green-400 font-semibold">1.2M views</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Audience Demographics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">18-24 years</span>
                  <span className="text-purple-400 font-semibold">42%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">25-34 years</span>
                  <span className="text-purple-400 font-semibold">35%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">35-44 years</span>
                  <span className="text-purple-400 font-semibold">23%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Geographic Distribution</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">United States</span>
                  <span className="text-blue-400 font-semibold">45%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">United Kingdom</span>
                  <span className="text-blue-400 font-semibold">18%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Canada</span>
                  <span className="text-blue-400 font-semibold">12%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* More detailed charts */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Weekly Performance</h3>
              <div className="h-64 flex items-end justify-between gap-2">
                {[45, 67, 89, 78, 92, 85, 96].map((height, index) => (
                  <div key={index} className="flex-1 bg-gradient-to-t from-green-600 to-teal-600 rounded-t" style={{ height: `${height}%` }}></div>
                ))}
              </div>
              <div className="flex justify-between text-sm text-gray-400 mt-4">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Content Categories</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-yellow-600 rounded"></div>
                    <span className="text-gray-300">Educational</span>
                  </div>
                  <span className="text-white font-semibold">38%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                    <span className="text-gray-300">Entertainment</span>
                  </div>
                  <span className="text-white font-semibold">29%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span className="text-gray-300">Tutorial</span>
                  </div>
                  <span className="text-white font-semibold">21%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-red-600 rounded"></div>
                    <span className="text-gray-300">Behind the Scenes</span>
                  </div>
                  <span className="text-white font-semibold">12%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Extra padding for scroll testing */}
      <div className="h-96 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">End of Analytics Dashboard</h3>
            <p className="text-gray-400">This section is added to test independent scrolling functionality.</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 