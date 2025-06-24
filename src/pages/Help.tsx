import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const Help: React.FC = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does the AI video clipping work?",
      answer: "Our AI analyzes your video using advanced machine learning algorithms trained on 50+ million viral clips. It identifies key moments, engagement patterns, and emotional peaks to automatically create clips with the highest viral potential."
    },
    {
      question: "What video formats are supported?",
      answer: "We support all major video formats including MP4, MOV, AVI, MKV, and more. You can also import directly from YouTube URLs, Google Drive, Dropbox, and other cloud storage services."
    },
    {
      question: "How long does it take to process a video?",
      answer: "Processing time depends on video length and complexity. Most videos are processed within 2-5 minutes. Longer videos (60+ minutes) may take 10-15 minutes. You'll receive a notification when your clips are ready."
    },
    {
      question: "Can I edit the AI-generated clips?",
      answer: "Absolutely! Our timeline editor allows you to fine-tune every aspect of your clips including timing, transitions, text overlays, and effects. You can also create custom templates and save your preferences."
    },
    {
      question: "What platforms can I publish to?",
      answer: "You can publish directly to TikTok, Instagram (Feed & Reels), YouTube Shorts, Twitter, LinkedIn, and Facebook. Each clip is automatically optimized for the specific platform's requirements."
    },
    {
      question: "Is there a limit on video uploads?",
      answer: "Limits depend on your subscription plan. Free users get 3 clips per month, Basic users get 25 clips/month, Pro users get 100 clips/month, and Enterprise users get unlimited clips."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied with our service, contact our support team for a full refund within 30 days of purchase."
    },
    {
      question: "How accurate is the viral prediction?",
      answer: "Our AI has an 87% accuracy rate in predicting viral potential based on historical data. However, virality also depends on factors like timing, audience, and platform algorithm changes."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-indigo-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Help <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Center</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Get the help you need to create viral content and maximize your social media success.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Help Options */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-slate-800/50 border border-purple-500/30 rounded-xl p-8 text-center hover:border-purple-500/60 transition-all">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-white mb-4">Live Chat Support</h3>
              <p className="text-gray-300 mb-6">
                Get instant help from our AI experts. Available 24/7 for all your questions.
              </p>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Start Chat
              </button>
            </div>

            <div className="bg-slate-800/50 border border-blue-500/30 rounded-xl p-8 text-center hover:border-blue-500/60 transition-all">
              <div className="text-4xl mb-4">📺</div>
              <h3 className="text-xl font-bold text-white mb-4">Video Tutorials</h3>
              <p className="text-gray-300 mb-6">
                Watch step-by-step tutorials to master every feature of our platform.
              </p>
              <Link to="/tutorials" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block">
                Watch Tutorials
              </Link>
            </div>

            <div className="bg-slate-800/50 border border-green-500/30 rounded-xl p-8 text-center hover:border-green-500/60 transition-all">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="text-xl font-bold text-white mb-4">Email Support</h3>
              <p className="text-gray-300 mb-6">
                Send us detailed questions and get comprehensive answers within 24 hours.
              </p>
              <Link to="/contact" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-block">
                Contact Support
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('faq')}
                className={`flex-1 py-3 px-6 rounded-md font-medium text-sm transition-colors ${
                  activeTab === 'faq' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Frequently Asked Questions
              </button>
              <button
                onClick={() => setActiveTab('getting-started')}
                className={`flex-1 py-3 px-6 rounded-md font-medium text-sm transition-colors ${
                  activeTab === 'getting-started' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Getting Started
              </button>
              <button
                onClick={() => setActiveTab('troubleshooting')}
                className={`flex-1 py-3 px-6 rounded-md font-medium text-sm transition-colors ${
                  activeTab === 'troubleshooting' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Troubleshooting
              </button>
            </div>
          </div>

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="max-w-4xl mx-auto">
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-slate-700/50 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          openFaq === index ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openFaq === index && (
                      <div className="px-6 pb-4">
                        <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Getting Started Tab */}
          {activeTab === 'getting-started' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-slate-800/50 border border-purple-500/30 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Getting Started with Socialitix</h2>
                
                <div className="space-y-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Create Your Account</h3>
                      <p className="text-gray-300">Sign up for free and choose your subscription plan based on your needs.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Upload Your First Video</h3>
                      <p className="text-gray-300">Upload a video file or paste a YouTube URL. Our AI will start analyzing immediately.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Review AI-Generated Clips</h3>
                      <p className="text-gray-300">Within minutes, you'll have multiple viral-ready clips to choose from.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">4</div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Customize and Publish</h3>
                      <p className="text-gray-300">Edit your clips if needed and publish directly to your favorite social platforms.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Troubleshooting Tab */}
          {activeTab === 'troubleshooting' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-slate-800/50 border border-blue-500/30 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Common Issues & Solutions</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Video Upload Issues</h3>
                    <ul className="text-gray-300 space-y-2">
                      <li>• Ensure your video file is under 2GB in size</li>
                      <li>• Check that your internet connection is stable</li>
                      <li>• Try uploading from a different browser</li>
                      <li>• Clear your browser cache and cookies</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Processing Delays</h3>
                    <ul className="text-gray-300 space-y-2">
                      <li>• Check our status page for any ongoing issues</li>
                      <li>• Longer videos naturally take more time to process</li>
                      <li>• High-resolution videos require additional processing time</li>
                      <li>• Contact support if processing takes over 30 minutes</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Poor Clip Quality</h3>
                    <ul className="text-gray-300 space-y-2">
                      <li>• Ensure your source video is high quality (1080p or higher)</li>
                      <li>• Check that audio levels are consistent throughout</li>
                      <li>• Avoid heavily compressed or low-resolution source videos</li>
                      <li>• Use our manual editing tools for fine-tuning</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}; 