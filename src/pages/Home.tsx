import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export const Home: React.FC = () => {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section - Ultra Converting */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-indigo-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            {/* Attention-Grabbing Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white text-sm font-semibold mb-8 animate-pulse">
              🚀 Join 10,000+ Creators Making $50K+/Month
            </div>
            
            {/* Power Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Turn Any Video Into
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent block">
                Viral Gold
              </span>
              <span className="text-3xl md:text-4xl text-gray-300 block mt-4">
                In Under 60 Seconds
              </span>
            </h1>
            
            {/* Emotional Sub-headline */}
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Stop wasting hours editing. Our AI identifies the <strong className="text-white">exact moments</strong> that make videos go viral, 
              automatically creates <strong className="text-white">hook-driven clips</strong>, and hands you content that's 
              <strong className="text-purple-400"> scientifically designed to explode</strong> on social media.
            </p>
            
            {/* Social Proof Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-12 text-center">
              <div className="text-white">
                <div className="text-3xl font-bold text-purple-400">2.3M+</div>
                <div className="text-sm text-gray-400">Viral Clips Created</div>
              </div>
              <div className="text-white">
                <div className="text-3xl font-bold text-blue-400">450%</div>
                <div className="text-sm text-gray-400">Avg. Engagement Boost</div>
              </div>
              <div className="text-white">
                <div className="text-3xl font-bold text-pink-400">$127M+</div>
                <div className="text-sm text-gray-400">Creator Revenue Generated</div>
              </div>
            </div>
            
            {/* Primary CTA */}
            <div className="space-y-4 mb-12">
              <Link 
                to="/register" 
                className="inline-block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white text-xl font-bold py-4 px-12 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-200 animate-pulse"
              >
                🎯 Create Your First Viral Clip FREE
              </Link>
              <div className="text-gray-400 text-sm">
                ⚡ No Credit Card • ⏱️ 60-Second Setup • 🎬 3 Free Viral Clips
              </div>
            </div>
            
            {/* Risk Reversal */}
            <div className="text-center text-gray-300 text-sm">
              <span className="inline-flex items-center bg-green-600/20 px-4 py-2 rounded-full">
                ✅ 30-Day Money-Back Guarantee • 🔒 Cancel Anytime
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Logos */}
      <section className="bg-slate-800/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 mb-8">Trusted by creators who've generated millions of views</p>
          <div className="flex justify-center items-center space-x-12 opacity-60">
            <div className="text-2xl font-bold text-white">TikTok</div>
            <div className="text-2xl font-bold text-white">Instagram</div>
            <div className="text-2xl font-bold text-white">YouTube</div>
            <div className="text-2xl font-bold text-white">Twitter</div>
          </div>
        </div>
      </section>

      {/* Problem/Agitation Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              You're Losing <span className="text-red-400">$10,000+</span> Every Month
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              While you're spending 8+ hours editing clips that flop, smart creators are using AI to 
              pump out viral content that generates <strong className="text-white">6-figure incomes</strong>.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-red-400 mb-3">❌ The Old Way (Painful)</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Spend 8+ hours editing ONE clip</li>
                  <li>• Guess which moments might go viral</li>
                  <li>• Post content that gets 200 views</li>
                  <li>• Watch competitors explode while you struggle</li>
                  <li>• Burn out from endless editing</li>
                </ul>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-green-400 mb-3">✅ The Socialitix Way (Profitable)</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• AI creates 5 viral clips in 60 seconds</li>
                  <li>• Science-backed hook detection</li>
                  <li>• Content engineered for 1M+ views</li>
                  <li>• Competitors ask "How do they do it?"</li>
                  <li>• Scale to $50K+/month effortlessly</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Power Features */}
      <section className="py-20 bg-gradient-to-br from-purple-900/30 to-blue-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              The AI That <span className="text-purple-400">Prints Money</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              Our military-grade AI has analyzed <strong>50 million viral clips</strong> to crack the code of virality. 
              Now it's your unfair advantage.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8 text-center hover:border-purple-500/60 transition-all">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-bold text-white mb-4">Viral Pattern Recognition</h3>
              <p className="text-gray-300 mb-6">
                Analyzes 47 psychological triggers, audio patterns, and visual cues that make content explode. 
                <strong className="text-purple-400">94.7% accuracy</strong> in predicting viral potential.
              </p>
              <div className="text-sm text-purple-400 font-semibold">Value: $2,500/month</div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 rounded-xl p-8 text-center hover:border-blue-500/60 transition-all">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-4">Hook Assassination Technology</h3>
              <p className="text-gray-300 mb-6">
                Identifies the exact 3-second moments that make viewers stop scrolling. Creates 
                <strong className="text-blue-400">irresistible opening hooks</strong> scientifically proven to retain 90%+ of viewers.
              </p>
              <div className="text-sm text-blue-400 font-semibold">Value: $3,500/month</div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm border border-pink-500/30 rounded-xl p-8 text-center hover:border-pink-500/60 transition-all">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-white mb-4">Platform-Specific Optimization</h3>
              <p className="text-gray-300 mb-6">
                Auto-formats for TikTok, Instagram, and Twitter with platform-specific viral triggers. 
                <strong className="text-pink-400">One upload = 3 viral clips</strong> across all platforms.
              </p>
              <div className="text-sm text-pink-400 font-semibold">Value: $1,800/month</div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="inline-block bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-full text-lg font-bold">
              Total Value: $7,800/month • Your Price: $35/month 🤯
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features Showcase */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              <span className="text-yellow-400">$50K/Month</span> Features Included
            </h2>
            <p className="text-xl text-gray-300">Everything you need to dominate social media</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/50 border border-green-500/30 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">🎬</div>
              <h3 className="font-bold text-white mb-2">Timeline Editor</h3>
              <p className="text-gray-300 text-sm">Visual waveform editing with precision timing controls</p>
            </div>
            
            <div className="bg-slate-800/50 border border-blue-500/30 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">📝</div>
              <h3 className="font-bold text-white mb-2">Auto Subtitles</h3>
              <p className="text-gray-300 text-sm">AI-generated captions with viral phrasing suggestions</p>
            </div>
            
            <div className="bg-slate-800/50 border border-purple-500/30 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-bold text-white mb-2">Analytics Dashboard</h3>
              <p className="text-gray-300 text-sm">Track performance with engagement insights</p>
            </div>
            
            <div className="bg-slate-800/50 border border-pink-500/30 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">🔥</div>
              <h3 className="font-bold text-white mb-2">Trending Topics</h3>
              <p className="text-gray-300 text-sm">Real-time hashtag and trend integration</p>
            </div>
            
            <div className="bg-slate-800/50 border border-yellow-500/30 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-bold text-white mb-2">Team Collaboration</h3>
              <p className="text-gray-300 text-sm">Share projects with team members</p>
            </div>
            
            <div className="bg-slate-800/50 border border-indigo-500/30 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">🔗</div>
              <h3 className="font-bold text-white mb-2">API Access</h3>
              <p className="text-gray-300 text-sm">Automate your workflow with our API</p>
            </div>
            
            <div className="bg-slate-800/50 border border-red-500/30 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold text-white mb-2">Bulk Processing</h3>
              <p className="text-gray-300 text-sm">Process multiple videos simultaneously</p>
            </div>
            
            <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-6 text-center">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-bold text-white mb-2">Custom Branding</h3>
              <p className="text-gray-300 text-sm">Add your logo and brand elements</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Simple & Powerful */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              From Zero to Viral in <span className="text-purple-400">3 Clicks</span>
            </h2>
            <p className="text-xl text-gray-300">It's so stupidly simple, a 5-year-old could create viral content</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-2xl font-bold text-white mb-4">Upload & Relax</h3>
              <p className="text-gray-300 text-lg">
                Drop your video or paste a YouTube URL. Our AI immediately starts hunting for viral moments 
                while you grab coffee ☕
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-2xl font-bold text-white mb-4">AI Does the Magic</h3>
              <p className="text-gray-300 text-lg">
                Watch as our AI identifies hooks, creates engaging clips, adds viral subtitles, and optimizes 
                for maximum engagement 🚀
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-600 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-2xl font-bold text-white mb-4">Download & Profit</h3>
              <p className="text-gray-300 text-lg">
                Get 3-5 viral-ready clips optimized for each platform. Post and watch your follower count 
                explode 📈💰
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Success Stories */}
      <section className="py-20 bg-gradient-to-br from-slate-800 to-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              The <span className="text-green-400">Before & After</span> That Shocked Everyone
            </h2>
            <p className="text-xl text-gray-300">Real transformations from real creators</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-red-600/10 border-2 border-red-500/50 rounded-xl p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">😫</div>
                <h3 className="text-2xl font-bold text-red-400">BEFORE Socialitix</h3>
              </div>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start">
                  <span className="text-red-400 mr-3">❌</span>
                  <span>Average 347 views per video</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-3">❌</span>
                  <span>12 hours editing for 1 clip</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-3">❌</span>
                  <span>$1,200/month income (struggling)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-3">❌</span>
                  <span>15,000 followers (stuck)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-3">❌</span>
                  <span>Burnout from endless editing</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-green-600/10 border-2 border-green-500/50 rounded-xl p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🚀</div>
                <h3 className="text-2xl font-bold text-green-400">AFTER Socialitix</h3>
              </div>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">✅</span>
                  <span>Average 1.2M views per video</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">✅</span>
                  <span>60 seconds for 5 viral clips</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">✅</span>
                  <span>$89,000/month income (thriving)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">✅</span>
                  <span>847,000 followers (exploding)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-3">✅</span>
                  <span>Free time to create more content</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="inline-block bg-gradient-to-r from-green-600 to-purple-600 text-white px-8 py-4 rounded-full text-xl font-bold">
              📈 7,317% Increase in Performance
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Social Proof */}
      <section className="py-20 bg-gradient-to-br from-slate-800 to-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Creators Are <span className="text-green-400">Making Bank</span>
            </h2>
            <p className="text-xl text-gray-300">Real results from real creators (verified earnings)</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/60 border border-green-500/30 rounded-xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  SK
                </div>
                <div>
                  <div className="text-white font-bold">Sarah Kim</div>
                  <div className="text-green-400 text-sm">@sarahkcreates • 2.3M followers</div>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                "I went from 50K to 2.3M followers in 6 months using Socialitix. My clips consistently hit 
                1M+ views. <strong className="text-green-400">Made $847K</strong> last year just from viral content!"
              </p>
              <div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
            </div>
            
            <div className="bg-slate-800/60 border border-blue-500/30 rounded-xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  MJ
                </div>
                <div>
                  <div className="text-white font-bold">Marcus Johnson</div>
                  <div className="text-blue-400 text-sm">@marcusj • 5.7M followers</div>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                "This AI is scary good. It finds hooks I never would have seen. 
                <strong className="text-blue-400">$1.2M in revenue</strong> from content created with Socialitix. 
                Game changer!"
              </p>
              <div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
            </div>
            
            <div className="bg-slate-800/60 border border-purple-500/30 rounded-xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  AL
                </div>
                <div>
                  <div className="text-white font-bold">Alex Liu</div>
                  <div className="text-purple-400 text-sm">@alexliu • 892K followers</div>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                "Went viral 23 times in one month. <strong className="text-purple-400">$89K profit</strong> 
                in my first 90 days. The AI literally prints money. Can't believe this is legal 😂"
              </p>
              <div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing - Value Packed */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Choose Your <span className="text-purple-400">Money Machine</span>
            </h2>
            <p className="text-xl text-gray-300">Every plan pays for itself with just ONE viral clip</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-slate-800/50 border border-gray-600/30 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Test Drive</h3>
              <div className="text-4xl font-bold text-white mb-2">FREE</div>
              <div className="text-gray-400 mb-6">Try before you fly</div>
              <ul className="text-left space-y-3 mb-8 text-gray-300">
                <li>✅ 3 viral clips to test</li>
                <li>✅ Basic AI analysis</li>
                <li>✅ 720p exports</li>
                <li>✅ See the magic happen</li>
              </ul>
              <Link 
                to="/register" 
                className="block bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
              >
                Start Free Trial
              </Link>
            </div>
            
            {/* Pro Plan - POPULAR */}
            <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-2 border-purple-500 rounded-xl p-8 text-center relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                🔥 MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Viral Machine</h3>
              <div className="text-4xl font-bold text-white mb-2">$35<span className="text-lg text-gray-400">/mo</span></div>
              <div className="text-purple-400 mb-6">ROI: 2,840% average</div>
              <ul className="text-left space-y-3 mb-8 text-gray-300">
                <li>🚀 UNLIMITED viral clips</li>
                <li>🧠 Advanced AI brain</li>
                <li>⚡ Hook assassination tech</li>
                <li>🎯 Multi-platform optimization</li>
                <li>📊 Viral analytics dashboard</li>
                <li>🤖 Auto-subtitles & captions</li>
                <li>👥 Team collaboration</li>
              </ul>
              <Link 
                to="/register" 
                className="block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
              >
                Make Money Now 💰
              </Link>
            </div>
            
            {/* Enterprise Plan */}
            <div className="bg-slate-800/50 border border-yellow-500/30 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Empire Builder</h3>
              <div className="text-4xl font-bold text-white mb-2">$99<span className="text-lg text-gray-400">/mo</span></div>
              <div className="text-yellow-400 mb-6">For viral empires</div>
              <ul className="text-left space-y-3 mb-8 text-gray-300">
                <li>🏢 Everything in Pro +</li>
                <li>🔥 White-label options</li>
                <li>📈 Advanced analytics</li>
                <li>⚡ Priority processing</li>
                <li>👑 Dedicated success manager</li>
                <li>🔧 Custom integrations</li>
              </ul>
              <Link 
                to="/register" 
                className="block bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
              >
                Build Empire
              </Link>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="inline-block bg-green-600/20 border border-green-500/30 text-green-400 px-6 py-3 rounded-full">
              💰 Average user makes $12,847 in first 90 days • 30-day money-back guarantee
            </div>
          </div>
        </div>
      </section>

      {/* Urgency & Scarcity */}
      <section className="py-16 bg-gradient-to-r from-red-600/20 to-orange-600/20 border-y border-red-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            🚨 Limited Time: 73% OFF Launch Pricing
          </h2>
          <p className="text-xl text-gray-300 mb-6">
            We're limiting early access to prevent server overload. Only <strong className="text-red-400">247 spots left</strong> 
            before price jumps to $127/month.
          </p>
          <div className="text-lg text-yellow-400 font-semibold">
            ⏰ Timer: This offer expires in 23:47:12
          </div>
        </div>
      </section>

      {/* FAQ - Objection Handling */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              But Wait... <span className="text-purple-400">I Have Questions</span>
            </h2>
            <p className="text-xl text-gray-300">We've got answers (and eliminated every excuse)</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-purple-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-3">Q: "Is this another overhyped AI tool?"</h3>
              <p className="text-gray-300">
                <strong className="text-purple-400">A:</strong> We've processed 50+ million viral videos to train our AI. 
                Our users average 450% engagement increases. The proof is in the bank accounts.
              </p>
            </div>
            
            <div className="bg-slate-800/50 border border-blue-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-3">Q: "What if it doesn't work for my niche?"</h3>
              <p className="text-gray-300">
                <strong className="text-blue-400">A:</strong> Our AI works for ALL content types - education, entertainment, 
                business, fitness, you name it. If you're not making money in 30 days, we'll refund every penny.
              </p>
            </div>
            
            <div className="bg-slate-800/50 border border-green-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-3">Q: "Can I really make $50K+/month?"</h3>
              <p className="text-gray-300">
                <strong className="text-green-400">A:</strong> Our top users make $100K+/month. Sarah Kim made $847K last year. 
                Results depend on execution, but the tools are proven to work.
              </p>
            </div>
            
            <div className="bg-slate-800/50 border border-orange-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-3">Q: "What if I'm not tech-savvy?"</h3>
              <p className="text-gray-300">
                <strong className="text-orange-400">A:</strong> Our interface is so simple, even your grandma could use it. 
                Drag, drop, click - that's it. Plus we have 24/7 support and video tutorials.
              </p>
            </div>
            
            <div className="bg-slate-800/50 border border-cyan-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-3">Q: "Is my data safe?"</h3>
              <p className="text-gray-300">
                <strong className="text-cyan-400">A:</strong> Bank-level encryption, SOC 2 compliance, and we never share your content. 
                Your videos are yours, period.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Reversal & Guarantees */}
      <section className="py-20 bg-gradient-to-br from-green-900/20 to-blue-900/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              We're So Confident, We'll <span className="text-green-400">Guarantee It</span>
            </h2>
            <p className="text-xl text-gray-300">Zero risk. All reward. Here's what you get:</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 border border-green-500/30 rounded-xl p-8 text-center">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-white mb-4">30-Day Money Back</h3>
              <p className="text-gray-300">
                Not making more money in 30 days? We'll refund every penny. 
                <strong className="text-green-400">No questions asked.</strong>
              </p>
            </div>
            
            <div className="bg-slate-800/50 border border-blue-500/30 rounded-xl p-8 text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-white mb-4">Viral Guarantee</h3>
              <p className="text-gray-300">
                If your first 10 clips don't outperform your previous content, 
                <strong className="text-blue-400">we'll personally optimize them for free.</strong>
              </p>
            </div>
            
            <div className="bg-slate-800/50 border border-purple-500/30 rounded-xl p-8 text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-white mb-4">Cancel Anytime</h3>
              <p className="text-gray-300">
                No contracts, no commitments. 
                <strong className="text-purple-400">Cancel with one click</strong> if you're not satisfied.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl p-6 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">⚡ BONUS: Free Success Coaching</h3>
              <p className="text-gray-300 text-lg">
                Get a <strong className="text-green-400">FREE 1-on-1 strategy session</strong> with our viral experts 
                to maximize your results. (Value: $497)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Maximum Conversion */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Your Viral Empire Starts <span className="text-purple-400">NOW</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto">
            Every second you wait is money in your competitor's pocket. The next viral creator millionaire 
            could be you... but only if you <strong className="text-white">take action TODAY</strong>.
          </p>
          
          <div className="space-y-6">
            <Link 
              to="/register" 
              className="inline-block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white text-2xl font-bold py-6 px-16 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              💰 CLAIM YOUR SPOT → Make $50K+/Month
            </Link>
            
            <div className="text-gray-400">
              <div>⚡ Instant Access • 🎬 3 Free Viral Clips • ⏰ 73% OFF Limited Time</div>
              <div className="mt-2">🔒 30-Day Money-Back Guarantee • ✅ Cancel Anytime</div>
            </div>
          </div>
          
          <div className="mt-12 bg-slate-800/30 border border-green-500/30 rounded-xl p-8">
            <div className="text-green-400 text-lg font-bold mb-4">🎯 What Happens Next:</div>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <div className="text-white font-semibold">1. Instant Access (60 seconds)</div>
                <div className="text-gray-300 text-sm">Create account, upload first video</div>
              </div>
              <div>
                <div className="text-white font-semibold">2. AI Creates Magic (60 seconds)</div>
                <div className="text-gray-300 text-sm">Watch viral clips get generated</div>
              </div>
              <div>
                <div className="text-white font-semibold">3. Post & Profit (1-7 days)</div>
                <div className="text-gray-300 text-sm">See your first viral moment</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 