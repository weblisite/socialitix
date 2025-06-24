import React from 'react';
import { Link } from 'react-router-dom';

export const Features: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-indigo-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Powerful <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">AI Features</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Discover the cutting-edge AI technology that transforms your long-form content 
              into viral social media clips in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Core AI Features */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              AI-Powered <span className="text-purple-400">Core Features</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 border border-purple-500/30 rounded-xl p-8 hover:border-purple-500/60 transition-all">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-white mb-4">Viral Moment Detection</h3>
              <p className="text-gray-300 mb-4">
                Our AI analyzes engagement patterns from 50M+ viral videos to identify the exact moments 
                that trigger maximum audience retention.
              </p>
              <div className="text-sm text-purple-400">
                • Hook identification • Peak engagement detection • Retention analysis
              </div>
            </div>

            <div className="bg-slate-800/50 border border-blue-500/30 rounded-xl p-8 hover:border-blue-500/60 transition-all">
              <div className="text-4xl mb-4">✂️</div>
              <h3 className="text-xl font-bold text-white mb-4">Smart Clip Generation</h3>
              <p className="text-gray-300 mb-4">
                Automatically creates multiple clip variations optimized for different platforms 
                and audience preferences.
              </p>
              <div className="text-sm text-blue-400">
                • Auto-cropping • Platform optimization • Multiple formats
              </div>
            </div>

            <div className="bg-slate-800/50 border border-green-500/30 rounded-xl p-8 hover:border-green-500/60 transition-all">
              <div className="text-4xl mb-4">🔥</div>
              <h3 className="text-xl font-bold text-white mb-4">Trend Integration</h3>
              <p className="text-gray-300 mb-4">
                Connects your content with trending hashtags, sounds, and topics to maximize 
                discoverability and engagement.
              </p>
              <div className="text-sm text-green-400">
                • Trending topics • Hashtag suggestions • Audio matching
              </div>
            </div>

            <div className="bg-slate-800/50 border border-yellow-500/30 rounded-xl p-8 hover:border-yellow-500/60 transition-all">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-4">Performance Prediction</h3>
              <p className="text-gray-300 mb-4">
                Predicts viral potential before you post, with detailed analytics on why certain 
                clips will perform better than others.
              </p>
              <div className="text-sm text-yellow-400">
                • Viral score • Engagement forecast • Optimization tips
              </div>
            </div>

            <div className="bg-slate-800/50 border border-pink-500/30 rounded-xl p-8 hover:border-pink-500/60 transition-all">
              <div className="text-4xl mb-4">🎬</div>
              <h3 className="text-xl font-bold text-white mb-4">Auto-Editing Suite</h3>
              <p className="text-gray-300 mb-4">
                Professional-grade editing features powered by AI, including transitions, 
                effects, and timing optimization.
              </p>
              <div className="text-sm text-pink-400">
                • Smart transitions • Auto-effects • Timing optimization
              </div>
            </div>

            <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 hover:border-indigo-500/60 transition-all">
              <div className="text-4xl mb-4">🎤</div>
              <h3 className="text-xl font-bold text-white mb-4">Audio Intelligence</h3>
              <p className="text-gray-300 mb-4">
                Analyzes speech patterns, music, and sound effects to create perfectly timed 
                clips with optimal audio engagement.
              </p>
              <div className="text-sm text-indigo-400">
                • Speech analysis • Music sync • Sound optimization
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-gradient-to-br from-purple-900/30 to-blue-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Complete <span className="text-blue-400">Platform Features</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-white mb-8">🚀 Creation & Editing</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <div>
                    <h4 className="text-white font-semibold">Bulk Processing</h4>
                    <p className="text-gray-300 text-sm">Process multiple videos simultaneously</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <div>
                    <h4 className="text-white font-semibold">Custom Templates</h4>
                    <p className="text-gray-300 text-sm">Pre-built templates for different niches</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <div>
                    <h4 className="text-white font-semibold">Timeline Editor</h4>
                    <p className="text-gray-300 text-sm">Precision editing with waveform visualization</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-8">📱 Multi-Platform</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <h4 className="text-white font-semibold">Platform Optimization</h4>
                    <p className="text-gray-300 text-sm">TikTok, Instagram, YouTube, Twitter formats</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <h4 className="text-white font-semibold">Direct Publishing</h4>
                    <p className="text-gray-300 text-sm">One-click publishing to all platforms</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <h4 className="text-white font-semibold">Scheduling</h4>
                    <p className="text-gray-300 text-sm">Optimal posting times across platforms</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-8">📈 Analytics & Insights</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <h4 className="text-white font-semibold">Performance Tracking</h4>
                    <p className="text-gray-300 text-sm">Real-time analytics across all platforms</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <h4 className="text-white font-semibold">Audience Insights</h4>
                    <p className="text-gray-300 text-sm">Deep demographic and behavioral analysis</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <h4 className="text-white font-semibold">ROI Tracking</h4>
                    <p className="text-gray-300 text-sm">Revenue attribution and conversion tracking</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-8">👥 Team & Collaboration</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <div>
                    <h4 className="text-white font-semibold">Team Workspaces</h4>
                    <p className="text-gray-300 text-sm">Collaborate with team members and clients</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <div>
                    <h4 className="text-white font-semibold">Approval Workflows</h4>
                    <p className="text-gray-300 text-sm">Review and approval processes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <div>
                    <h4 className="text-white font-semibold">Brand Guidelines</h4>
                    <p className="text-gray-300 text-sm">Maintain consistent brand identity</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Experience <span className="text-purple-400">The Future?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Join thousands of creators who are already using our AI to create viral content 
            and build successful businesses.
          </p>
          
          <div className="space-y-6">
            <Link 
              to="/register" 
              className="inline-block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white text-xl font-bold py-4 px-12 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              🚀 Start Creating Now
            </Link>
            
            <div className="text-gray-400">
              <div>✨ Free 3 Viral Clips • 🎯 No Credit Card Required</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}; 