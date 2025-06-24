import React, { useState } from 'react';

interface UserProfile {
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  website: string;
  joinDate: string;
  plan: string;
  followers: number;
  following: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  date?: string;
}

interface RecentActivity {
  id: string;
  type: 'video_upload' | 'viral_clip' | 'milestone' | 'feature_used';
  description: string;
  timestamp: string;
  data?: any;
}

export const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'achievements' | 'stats'>('overview');
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    name: 'Alex Johnson',
    username: '@alexj_creator',
    email: 'alex@example.com',
    avatar: '👤',
    bio: 'Content creator passionate about viral videos and AI-powered content. Always experimenting with new formats and trends.',
    location: 'New York, NY',
    website: 'alexjohnson.com',
    joinDate: '2023-08-15',
    plan: 'Pro',
    followers: 12500,
    following: 450
  });

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Viral Hit',
      description: 'Created your first video with over 1M views',
      icon: '🚀',
      earned: true,
      date: '2024-03-15'
    },
    {
      id: '2',
      title: 'AI Master',
      description: 'Generated 100+ AI clips',
      icon: '🤖',
      earned: true,
      date: '2024-05-22'
    },
    {
      id: '3',
      title: 'Engagement King',
      description: 'Achieved 15%+ average engagement rate',
      icon: '👑',
      earned: true,
      date: '2024-07-10'
    },
    {
      id: '4',
      title: 'Multi-Platform',
      description: 'Go viral on 3+ platforms simultaneously',
      icon: '🌟',
      earned: false
    },
    {
      id: '5',
      title: 'Revenue Milestone',
      description: 'Earn $10,000+ from your content',
      icon: '💰',
      earned: false
    },
    {
      id: '6',
      title: 'Trend Setter',
      description: 'Start a viral trend that gets 10M+ views',
      icon: '🔥',
      earned: false
    }
  ];

  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'viral_clip',
      description: 'Your clip "AI Predicts My Next Viral Video" reached 2.4M views',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      type: 'video_upload',
      description: 'Uploaded new video "Why 99% of Content Fails"',
      timestamp: '1 day ago'
    },
    {
      id: '3',
      type: 'milestone',
      description: 'Reached 10,000 total followers across platforms',
      timestamp: '3 days ago'
    },
    {
      id: '4',
      type: 'feature_used',
      description: 'Generated 5 new clips using AI Viral Predictor',
      timestamp: '5 days ago'
    },
    {
      id: '5',
      type: 'viral_clip',
      description: 'Your clip "Secret to 10M Views" hit 1.8M views',
      timestamp: '1 week ago'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'viral_clip': return '🚀';
      case 'video_upload': return '📹';
      case 'milestone': return '🎯';
      case 'feature_used': return '⚡';
      default: return '📱';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '👤' },
    { id: 'activity', name: 'Activity', icon: '📊' },
    { id: 'achievements', name: 'Achievements', icon: '🏆' },
    { id: 'stats', name: 'Statistics', icon: '📈' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-indigo-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          {/* Profile Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center text-4xl">
                {profile.avatar}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                <p className="text-purple-400 text-lg">{profile.username}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="bg-purple-600 px-3 py-1 rounded-full text-white text-sm font-medium">
                    {profile.plan} Plan
                  </span>
                  <span className="text-gray-400">📍 {profile.location}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 ml-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{profile.followers.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{profile.following.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">Following</div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {isEditing ? 'Save Profile' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            {isEditing ? (
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
              />
            ) : (
              <p className="text-gray-300 text-lg max-w-3xl">{profile.bio}</p>
            )}
          </div>

          {/* Website */}
          {profile.website && (
            <div className="mt-4">
              <a
                href={`https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 flex items-center gap-2"
              >
                🌐 {profile.website}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-slate-700">
            <nav className="flex gap-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Quick Stats</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">47</div>
                      <div className="text-gray-400 text-sm">Videos Created</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">234</div>
                      <div className="text-gray-400 text-sm">AI Clips Generated</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">15.4M</div>
                      <div className="text-gray-400 text-sm">Total Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">8.4%</div>
                      <div className="text-gray-400 text-sm">Avg Engagement</div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Recent Achievements</h3>
                  <div className="space-y-3">
                    {achievements.filter(a => a.earned).slice(0, 3).map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-4 p-3 bg-slate-700/50 rounded-lg">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <div className="text-white font-medium">{achievement.title}</div>
                          <div className="text-gray-400 text-sm">{achievement.description}</div>
                        </div>
                        <div className="text-gray-400 text-sm">{achievement.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Account Info</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Member Since</span>
                      <span className="text-white">{new Date(profile.joinDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Plan</span>
                      <span className="text-purple-400">{profile.plan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email</span>
                      <span className="text-white">{profile.email}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Connected Platforms</h3>
                  <div className="space-y-3">
                    {['TikTok', 'Instagram', 'YouTube'].map((platform) => (
                      <div key={platform} className="flex items-center justify-between">
                        <span className="text-gray-300">{platform}</span>
                        <span className="text-green-400 text-sm">Connected</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-white mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-lg">
                    <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                    <div className="flex-1">
                      <p className="text-white">{activity.description}</p>
                      <p className="text-gray-400 text-sm mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Achievements</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`bg-slate-800/50 border rounded-xl p-6 ${
                      achievement.earned
                        ? 'border-purple-500/50 bg-purple-500/10'
                        : 'border-slate-700'
                    }`}
                  >
                    <div className="text-center">
                      <span className={`text-4xl ${achievement.earned ? '' : 'grayscale opacity-50'}`}>
                        {achievement.icon}
                      </span>
                      <h4 className={`text-lg font-bold mt-3 ${
                        achievement.earned ? 'text-white' : 'text-gray-400'
                      }`}>
                        {achievement.title}
                      </h4>
                      <p className={`text-sm mt-2 ${
                        achievement.earned ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {achievement.description}
                      </p>
                      {achievement.earned && achievement.date && (
                        <p className="text-purple-400 text-xs mt-2">
                          Earned on {new Date(achievement.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Performance Metrics</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">Viral Rate</span>
                      <span className="text-white">23.4%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '23.4%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">Engagement Rate</span>
                      <span className="text-white">8.4%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '84%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">Content Quality Score</span>
                      <span className="text-white">92/100</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Platform Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { platform: 'TikTok', views: '8.2M', percentage: 53 },
                    { platform: 'Instagram', views: '4.1M', percentage: 27 },
                    { platform: 'YouTube', views: '3.1M', percentage: 20 }
                  ].map((item) => (
                    <div key={item.platform} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">{item.platform}</span>
                        <span className="text-white">{item.views}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}; 