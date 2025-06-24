import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';

// Import dashboard pages
import { VideoLibrary } from './VideoLibrary';
import { ClipLibrary } from './ClipLibrary';
import { VideoUpload } from './VideoUpload';
import VideoEditor from './VideoEditor';
import { Analytics } from './Analytics';
import { Profile } from './Profile';
import { Settings } from './Settings';
import { Team } from './Team';
import { Projects } from './Projects';

export const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('overview');
  const { user, logout } = useAuthStore();

  const navigation = [
    {
      name: 'Overview',
      id: 'overview',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z" />
        </svg>
      ),
      current: currentPage === 'overview',
    },
    {
      name: 'Analytics',
      id: 'analytics',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      current: currentPage === 'analytics',
    },
  ];

  const contentNavigation = [
    {
      name: 'Video Library',
      id: 'video-library',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      current: currentPage === 'video-library',
    },
    {
      name: 'Clip Library',
      id: 'clip-library',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z" />
        </svg>
      ),
      current: currentPage === 'clip-library',
    },
    {
      name: 'Upload Video',
      id: 'upload-video',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      current: currentPage === 'upload-video',
    },
    {
      name: 'Video Editor',
      id: 'video-editor',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      current: currentPage === 'video-editor',
    },
  ];

  const accountNavigation = [
    {
      name: 'Profile',
      id: 'profile',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      current: currentPage === 'profile',
    },
    {
      name: 'Settings',
      id: 'settings',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      current: currentPage === 'settings',
    },
    {
      name: 'Team',
      id: 'team',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      current: currentPage === 'team',
    },
    {
      name: 'Projects',
      id: 'projects',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      current: currentPage === 'projects',
    },
  ];

  const handleNavigation = (pageId: string) => {
    setCurrentPage(pageId);
    setSidebarOpen(false); // Close mobile sidebar when navigating
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'overview':
        return <DashboardOverview />;
      case 'analytics':
        return <Analytics />;
      case 'video-library':
        return <VideoLibrary />;
      case 'clip-library':
        return <ClipLibrary />;
      case 'upload-video':
        return <VideoUpload />;
      case 'video-editor':
        return <VideoEditor />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      case 'team':
        return <Team />;
      case 'projects':
        return <Projects />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}>
        {/* Mobile close button - positioned absolutely */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-slate-400 hover:text-white z-10"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Scrollable navigation area */}
        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
          {/* Dashboard Section */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Dashboard</h3>
            <div className="mt-2 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.id)}
                  className={`${
                    item.current
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left`}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Section */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Content</h3>
            <div className="mt-2 space-y-1">
              {contentNavigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.id)}
                  className={`${
                    item.current
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left`}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Account Section */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Account</h3>
            <div className="mt-2 space-y-1">
              {accountNavigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.id)}
                  className={`${
                    item.current
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left`}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* User info at bottom - fixed position */}
        <div className="flex-shrink-0 flex border-t border-slate-700 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </p>
              <button
                onClick={logout}
                className="text-xs text-slate-400 hover:text-white"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top bar */}
        <header className="bg-slate-800 border-b border-slate-700 lg:hidden flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-400 hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-white">Dashboard</h1>
            <div></div>
          </div>
        </header>

        {/* Page content - independently scrollable with explicit height */}
        <main className="flex-1 overflow-y-auto min-h-0">
          {renderCurrentPage()}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

// AI Test Section Component
const AITestSection: React.FC = () => {
  const [isTestRunning, setIsTestRunning] = React.useState(false);
  const [testResult, setTestResult] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  const runAITest = async () => {
    setIsTestRunning(true);
    setError(null);
    setTestResult(null);

    try {
      const response = await fetch('/api/ai/test-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabaseSession')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Test failed: ${response.statusText}`);
      }

      const result = await response.json();
      setTestResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setIsTestRunning(false);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">🧠 AI Analysis Test</h2>
        <button
          onClick={runAITest}
          disabled={isTestRunning}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
        >
          {isTestRunning ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Testing...</span>
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Test AI Analysis</span>
            </>
          )}
        </button>
      </div>

      <p className="text-slate-400 mb-4">
        Test the AssemblyAI integration with a sample audio file to verify the AI analysis is working.
      </p>

      {error && (
        <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 mb-4">
          <p className="text-red-200">❌ {error}</p>
        </div>
      )}

      {testResult && (
        <div className="bg-green-900/50 border border-green-600 rounded-lg p-4 space-y-4">
          <p className="text-green-200 font-semibold">✅ AI Analysis Test Successful!</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-white font-medium mb-2">Engagement Segments Found:</h4>
              <p className="text-slate-300">{testResult.analysis?.engagementSegments?.length || 0} segments</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Hooks Detected:</h4>
              <p className="text-slate-300">{testResult.analysis?.hooks?.length || 0} hooks</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Keywords:</h4>
              <p className="text-slate-300">{testResult.analysis?.keywords?.slice(0, 5).join(', ') || 'None'}</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Sentiment:</h4>
              <p className="text-slate-300 capitalize">{testResult.analysis?.sentiment?.overall || 'Unknown'}</p>
            </div>
          </div>

          {testResult.analysis?.transcript && (
            <div>
              <h4 className="text-white font-medium mb-2">Sample Transcript:</h4>
              <p className="text-slate-300 text-sm bg-slate-700 p-3 rounded">
                {testResult.analysis.transcript}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.name || user?.email?.split('@')[0] || 'User'}!
        </h1>
        <p className="text-slate-400">Here's what's happening with your content today.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-6 rounded-xl transition-all duration-300 text-left">
          <div className="flex items-center space-x-4">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold">Upload New Video</h3>
              <p className="text-purple-100">Start creating viral clips</p>
            </div>
          </div>
        </button>

        <button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white p-6 rounded-xl transition-all duration-300 text-left">
          <div className="flex items-center space-x-4">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold">Create Clip</h3>
              <p className="text-green-100">Generate viral content</p>
            </div>
          </div>
        </button>
      </div>

      {/* AI Analysis Test Section */}
      <AITestSection />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Videos</p>
              <p className="text-2xl font-bold text-white">47</p>
              <p className="text-green-400 text-sm">+12% from last month</p>
            </div>
            <svg className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Clips Generated</p>
              <p className="text-2xl font-bold text-white">183</p>
              <p className="text-green-400 text-sm">+23.5% this week</p>
            </div>
            <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z" />
            </svg>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Views</p>
              <p className="text-2xl font-bold text-white">2.8M</p>
              <p className="text-green-400 text-sm">+847K this week</p>
            </div>
            <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Revenue Generated</p>
              <p className="text-2xl font-bold text-white">$12.8K</p>
              <p className="text-green-400 text-sm">+$2.4K this month</p>
            </div>
            <svg className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
      </div>

      {/* Recent Videos */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Recent Videos</h2>
        <div className="space-y-4">
          {[
            {
              title: "How to Build a Million Dollar Business",
              duration: "12:34",
              clips: 5,
              views: "847K",
              status: "Completed",
              time: "2 hours ago"
            },
            {
              title: "AI Marketing Secrets Revealed",
              duration: "8:47",
              clips: 3,
              views: "234K",
              status: "Completed",
              time: "5 hours ago"
            },
            {
              title: "Viral Content Creation Tips",
              duration: "15:22",
              clips: 0,
              views: "0",
              status: "Processing",
              time: "1 hour ago"
            }
          ].map((video, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8a2 2 0 012-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium">{video.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <span>{video.duration}</span>
                    <span>{video.clips} clips</span>
                    <span>{video.views} views</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  video.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {video.status}
                </span>
                <p className="text-slate-400 text-sm mt-1">{video.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 