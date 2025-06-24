import React from 'react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-indigo-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              We're <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Revolutionizing</span>
              <br />Content Creation
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Born from the frustration of spending hours editing clips that nobody watches, 
              Socialitix uses cutting-edge AI to turn any video into viral content in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-lg text-gray-300 mb-6">
                We believe every creator deserves to go viral. Our mission is to democratize content creation 
                by giving everyone access to the same AI-powered tools that top creators use to generate 
                millions of views and build successful businesses.
              </p>
              <p className="text-lg text-gray-300">
                We're not just building software – we're building the future of content creation where 
                creativity matters more than technical editing skills.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl p-8 border border-purple-500/30">
              <div className="text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-white mb-4">10M+ Creators Empowered</h3>
                <p className="text-gray-300">
                  Our platform has generated over $500M in creator revenue and helped thousands 
                  build sustainable businesses through viral content.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900/30 to-blue-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How It All <span className="text-purple-400">Started</span>
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8">
              <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
                <p>
                  <strong className="text-white">2022:</strong> Our founder, a struggling content creator, 
                  was spending 12+ hours editing a single clip that got 200 views. Meanwhile, others were 
                  somehow creating viral content effortlessly.
                </p>
                <p>
                  <strong className="text-white">The Breakthrough:</strong> After analyzing 50 million viral videos, 
                  we discovered that virality follows predictable patterns. We built an AI that could 
                  identify these patterns automatically.
                </p>
                <p>
                  <strong className="text-white">Today:</strong> Socialitix has helped over 10,000 creators 
                  achieve their first viral moment, with our users collectively generating over $500M in revenue.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Meet the <span className="text-blue-400">Visionaries</span>
            </h2>
            <p className="text-xl text-gray-300">The team behind the AI revolution</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 border border-blue-500/30 rounded-xl p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                AJ
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Alex Johnson</h3>
              <p className="text-blue-400 mb-4">CEO & Co-Founder</p>
              <p className="text-gray-300 text-sm">
                Former TikTok engineer turned creator. Built the first viral detection algorithm 
                and led the team to process 50M+ videos.
              </p>
            </div>
            
            <div className="bg-slate-800/50 border border-purple-500/30 rounded-xl p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                SC
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sarah Chen</h3>
              <p className="text-purple-400 mb-4">CTO & Co-Founder</p>
              <p className="text-gray-300 text-sm">
                AI/ML expert with 10+ years at Google. Architected the neural networks 
                that power our viral pattern recognition.
              </p>
            </div>
            
            <div className="bg-slate-800/50 border border-green-500/30 rounded-xl p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                MR
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Marcus Rodriguez</h3>
              <p className="text-green-400 mb-4">VP of Product</p>
              <p className="text-gray-300 text-sm">
                Creator economy veteran. Previously scaled products to 100M+ users 
                at YouTube and helped launch TikTok Creator Fund.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-slate-800 to-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our <span className="text-yellow-400">Core Values</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-white mb-4">Innovation First</h3>
              <p className="text-gray-300">
                We push the boundaries of what's possible with AI, always staying ahead of the curve.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-white mb-4">Creator Success</h3>
              <p className="text-gray-300">
                Every decision we make is driven by one question: "Will this help creators succeed?"
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-white mb-4">Trust & Privacy</h3>
              <p className="text-gray-300">
                Your content is yours. We never share, sell, or use your videos for any purpose.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">💡</div>
              <h3 className="text-xl font-bold text-white mb-4">Democratization</h3>
              <p className="text-gray-300">
                Making powerful creator tools accessible to everyone, not just those with big budgets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Join the <span className="text-purple-400">Revolution?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Be part of the future of content creation. Join thousands of creators who are already 
            using AI to build million-dollar businesses.
          </p>
          
          <div className="space-y-6">
            <Link 
              to="/register" 
              className="inline-block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white text-xl font-bold py-4 px-12 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              🚀 Start Your Viral Journey
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