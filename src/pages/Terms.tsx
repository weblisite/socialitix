import React from 'react';

export const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-indigo-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Terms of <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Service</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto">
              Please read these terms carefully before using our platform.
            </p>
            <p className="text-sm text-gray-400">Last updated: December 23, 2024</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8 space-y-8">
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  By accessing or using Socialitix ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
                  If you disagree with any part of these terms, you may not access the Service.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Socialitix is an AI-powered platform that analyzes long-form videos and automatically 
                  generates short-form clips optimized for social media platforms. Our service includes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>AI-powered video analysis and clip generation</li>
                  <li>Engagement pattern recognition</li>
                  <li>Multi-platform optimization</li>
                  <li>Analytics and performance tracking</li>
                  <li>Team collaboration tools</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  To use our Service, you must create an account. You are responsible for:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Providing accurate and complete registration information</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">4. Content and Intellectual Property</h2>
              <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-6 mb-4">
                <p className="text-blue-400 font-semibold mb-2">🎬 Your Content Ownership</p>
                <p className="text-gray-300">
                  You retain all rights to content you upload. We only process your content to provide our service 
                  and never claim ownership or use it for other purposes.
                </p>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>By uploading content, you warrant that:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You own or have necessary rights to the content</li>
                  <li>Your content doesn't violate any third-party rights</li>
                  <li>Your content complies with applicable laws and regulations</li>
                  <li>You grant us limited rights to process and deliver your content through our Service</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">5. Prohibited Uses</h2>
              <div className="text-gray-300 space-y-4">
                <p>You may NOT use our Service to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Upload illegal, harmful, or offensive content</li>
                  <li>Violate intellectual property rights of others</li>
                  <li>Distribute spam, malware, or viruses</li>
                  <li>Attempt to circumvent our security measures</li>
                  <li>Use our Service for competitive analysis or reverse engineering</li>
                  <li>Create fake accounts or impersonate others</li>
                  <li>Interfere with or disrupt our Service</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">6. Subscription and Billing</h2>
              <div className="text-gray-300 space-y-4">
                <h3 className="text-lg font-semibold text-white">Subscription Plans</h3>
                <p>We offer various subscription tiers with different features and usage limits.</p>
                
                <h3 className="text-lg font-semibold text-white">Billing</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Subscriptions are billed monthly or annually in advance</li>
                  <li>All fees are non-refundable except as required by law</li>
                  <li>We may change pricing with 30 days' notice</li>
                  <li>Failed payments may result in service suspension</li>
                </ul>

                <h3 className="text-lg font-semibold text-white">Cancellation</h3>
                <p>You may cancel your subscription at any time. Your access continues until the end of your billing period.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">7. Service Availability</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We strive to maintain high uptime, but we don't guarantee uninterrupted service. 
                  We may perform maintenance, updates, or experience technical issues that temporarily 
                  affect service availability.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">8. Limitation of Liability</h2>
              <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-6">
                <p className="text-yellow-400 font-semibold mb-2">⚠️ Important Disclaimer</p>
                <div className="text-gray-300 space-y-2">
                  <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, SOCIALITIX SHALL NOT BE LIABLE FOR:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Indirect, incidental, or consequential damages</li>
                    <li>Loss of profits, data, or business opportunities</li>
                    <li>Service interruptions or technical failures</li>
                    <li>Third-party content or actions</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">9. Indemnification</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  You agree to indemnify and hold harmless Socialitix from any claims, damages, or expenses 
                  arising from your use of the Service, violation of these Terms, or infringement of any rights.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">10. Privacy</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Your privacy is important to us. Our Privacy Policy explains how we collect, use, and 
                  protect your information when you use our Service.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">11. Termination</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We may terminate or suspend your account for violations of these Terms. 
                  Upon termination, your right to use the Service ceases immediately.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">12. Governing Law</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of 
                  the State of California, without regard to its conflict of law provisions.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">13. Changes to Terms</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We reserve the right to modify these Terms at any time. We will notify users of 
                  significant changes via email or through our platform. Continued use constitutes 
                  acceptance of modified Terms.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">14. Contact Information</h2>
              <div className="text-gray-300 space-y-4">
                <p>If you have questions about these Terms, contact us:</p>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p><strong className="text-white">Email:</strong> legal@socialitix.com</p>
                  <p><strong className="text-white">Address:</strong> 123 Tech Street, San Francisco, CA 94105</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}; 