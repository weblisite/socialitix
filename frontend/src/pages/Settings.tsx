import React, { useState } from 'react';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  timezone: string;
  language: string;
  plan: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  viralAlerts: boolean;
  weeklyReports: boolean;
  newFeatures: boolean;
}

interface AISettings {
  viralThreshold: number;
  autoGenerate: boolean;
  platforms: string[];
  contentStyle: string;
  language: string;
}

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'ai' | 'billing' | 'security'>('profile');
  const [isLoading, setIsLoading] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Alex Johnson',
    email: 'alex@example.com',
    avatar: '👤',
    timezone: 'America/New_York',
    language: 'English',
    plan: 'Pro'
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    viralAlerts: true,
    weeklyReports: true,
    newFeatures: false
  });

  const [aiSettings, setAiSettings] = useState<AISettings>({
    viralThreshold: 75,
    autoGenerate: true,
    platforms: ['TikTok', 'Instagram', 'YouTube'],
    contentStyle: 'engaging',
    language: 'English'
  });

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    // Show success message
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'ai', name: 'AI Settings', icon: '🤖' },
    { id: 'billing', name: 'Billing', icon: '💳' },
    { id: 'security', name: 'Security', icon: '🔒' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-indigo-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Account <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Settings</span>
            </h1>
            <p className="text-xl text-gray-300">
              Customize your Socialitix experience
            </p>
          </div>
        </div>
      </section>

      {/* Settings Content */}
      <section className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-300 hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-xl">{tab.icon}</span>
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
                    
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center text-3xl">
                        {userProfile.avatar}
                      </div>
                      <div>
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                          Change Avatar
                        </button>
                        <p className="text-gray-400 text-sm mt-2">JPG, PNG or GIF. Max size 5MB.</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={userProfile.name}
                          onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={userProfile.email}
                          onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                        <select
                          value={userProfile.timezone}
                          onChange={(e) => setUserProfile(prev => ({ ...prev, timezone: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="America/New_York">Eastern Time (ET)</option>
                          <option value="America/Chicago">Central Time (CT)</option>
                          <option value="America/Denver">Mountain Time (MT)</option>
                          <option value="America/Los_Angeles">Pacific Time (PT)</option>
                          <option value="Europe/London">London (GMT)</option>
                          <option value="Europe/Paris">Paris (CET)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                        <select
                          value={userProfile.language}
                          onChange={(e) => setUserProfile(prev => ({ ...prev, language: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="English">English</option>
                          <option value="Spanish">Spanish</option>
                          <option value="French">French</option>
                          <option value="German">German</option>
                          <option value="Japanese">Japanese</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Notification Preferences</h2>
                    
                    <div className="space-y-4">
                      {Object.entries(notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-4 border-b border-slate-700">
                          <div>
                            <h3 className="text-white font-medium">
                              {key === 'emailNotifications' && 'Email Notifications'}
                              {key === 'pushNotifications' && 'Push Notifications'}
                              {key === 'viralAlerts' && 'Viral Content Alerts'}
                              {key === 'weeklyReports' && 'Weekly Performance Reports'}
                              {key === 'newFeatures' && 'New Feature Announcements'}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {key === 'emailNotifications' && 'Receive notifications via email'}
                              {key === 'pushNotifications' && 'Receive browser notifications'}
                              {key === 'viralAlerts' && 'Get notified when your content goes viral'}
                              {key === 'weeklyReports' && 'Weekly summary of your content performance'}
                              {key === 'newFeatures' && 'Updates about new Socialitix features'}
                            </p>
                          </div>
                          <button
                            onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              value ? 'bg-purple-600' : 'bg-slate-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Settings Tab */}
                {activeTab === 'ai' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-6">AI Configuration</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Viral Threshold ({aiSettings.viralThreshold}%)
                        </label>
                        <p className="text-gray-400 text-sm mb-3">
                          Only generate clips with viral potential above this threshold
                        </p>
                        <input
                          type="range"
                          min="50"
                          max="95"
                          value={aiSettings.viralThreshold}
                          onChange={(e) => setAiSettings(prev => ({ ...prev, viralThreshold: parseInt(e.target.value) }))}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-sm text-gray-400 mt-1">
                          <span>50%</span>
                          <span>95%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-4 border-b border-slate-700">
                        <div>
                          <h3 className="text-white font-medium">Auto-Generate Clips</h3>
                          <p className="text-gray-400 text-sm">
                            Automatically generate clips from your uploaded videos
                          </p>
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
                        <label className="block text-sm font-medium text-gray-300 mb-3">Target Platforms</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {['TikTok', 'Instagram', 'YouTube', 'Twitter', 'LinkedIn', 'Facebook'].map((platform) => (
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
                              className={`px-4 py-2 rounded-lg border transition-colors ${
                                aiSettings.platforms.includes(platform)
                                  ? 'bg-purple-600 border-purple-600 text-white'
                                  : 'bg-slate-700 border-slate-600 text-gray-300 hover:border-purple-500'
                              }`}
                            >
                              {platform}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Content Style</label>
                        <select
                          value={aiSettings.contentStyle}
                          onChange={(e) => setAiSettings(prev => ({ ...prev, contentStyle: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="engaging">Engaging & Entertaining</option>
                          <option value="educational">Educational & Informative</option>
                          <option value="professional">Professional & Business</option>
                          <option value="casual">Casual & Conversational</option>
                          <option value="trending">Trending & Viral</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Billing Tab */}
                {activeTab === 'billing' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Billing & Subscription</h2>
                    
                    <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6 mb-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white">Current Plan: {userProfile.plan}</h3>
                          <p className="text-gray-300">50 AI clips per month • Advanced features</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">$79<span className="text-lg font-normal">/month</span></div>
                          <p className="text-gray-400 text-sm">Next billing: Jan 15, 2025</p>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-3">
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                          Upgrade Plan
                        </button>
                        <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                          Change Plan
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
                        <div className="bg-slate-700 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-5 bg-blue-600 rounded"></div>
                              <span className="text-white">•••• •••• •••• 4242</span>
                            </div>
                            <span className="text-gray-400">12/27</span>
                          </div>
                        </div>
                        <button className="text-purple-400 hover:text-purple-300 font-medium">
                          + Add payment method
                        </button>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Billing History</h3>
                        <div className="space-y-3">
                          {[
                            { date: 'Dec 15, 2024', amount: '$79.00', status: 'Paid' },
                            { date: 'Nov 15, 2024', amount: '$79.00', status: 'Paid' },
                            { date: 'Oct 15, 2024', amount: '$79.00', status: 'Paid' }
                          ].map((bill, index) => (
                            <div key={index} className="flex items-center justify-between py-3 border-b border-slate-700">
                              <div>
                                <div className="text-white">{bill.date}</div>
                                <div className="text-gray-400 text-sm">Pro Plan</div>
                              </div>
                              <div className="text-right">
                                <div className="text-white">{bill.amount}</div>
                                <div className="text-green-400 text-sm">{bill.status}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                            <input
                              type="password"
                              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                            <input
                              type="password"
                              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                            <input
                              type="password"
                              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                            Update Password
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-slate-700 pt-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h3>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-300">Add an extra layer of security to your account</p>
                            <p className="text-gray-400 text-sm">Status: <span className="text-red-400">Disabled</span></p>
                          </div>
                          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                            Enable 2FA
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-slate-700 pt-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Active Sessions</h3>
                        <div className="space-y-3">
                          {[
                            { device: 'MacBook Pro', location: 'New York, US', time: 'Current session' },
                            { device: 'iPhone 14', location: 'New York, US', time: '2 hours ago' },
                            { device: 'Chrome Browser', location: 'San Francisco, US', time: '1 day ago' }
                          ].map((session, index) => (
                            <div key={index} className="flex items-center justify-between py-3 border-b border-slate-700">
                              <div>
                                <div className="text-white">{session.device}</div>
                                <div className="text-gray-400 text-sm">{session.location} • {session.time}</div>
                              </div>
                              {index !== 0 && (
                                <button className="text-red-400 hover:text-red-300 text-sm">
                                  Revoke
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-slate-700">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400 text-sm">
                      Changes are saved automatically
                    </p>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}; 