import React from 'react';

export const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-indigo-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Privacy <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto">
              Your privacy is our priority. Here's how we protect and handle your data.
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
              <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong className="text-white">Account Information:</strong> When you create an account, we collect your name, 
                  email address, and other registration details.
                </p>
                <p>
                  <strong className="text-white">Content Data:</strong> Videos you upload for processing, along with metadata 
                  such as file names, timestamps, and processing preferences.
                </p>
                <p>
                  <strong className="text-white">Usage Data:</strong> How you interact with our platform, including features used, 
                  clips created, and performance analytics.
                </p>
                <p>
                  <strong className="text-white">Payment Information:</strong> Billing details processed securely through our 
                  payment providers (we never store credit card numbers).
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
              <div className="text-gray-300 space-y-4">
                <p>We use your information to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and improve our AI video clipping services</li>
                  <li>Process your videos and generate viral clips</li>
                  <li>Manage your account and subscriptions</li>
                  <li>Provide customer support and respond to inquiries</li>
                  <li>Send important service updates and notifications</li>
                  <li>Improve our AI algorithms (using anonymized data only)</li>
                  <li>Prevent fraud and ensure platform security</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">3. Your Content Rights</h2>
              <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-6">
                <p className="text-green-400 font-semibold mb-2">🔒 Your Content Belongs to You</p>
                <p className="text-gray-300">
                  You retain full ownership of all content you upload. We never claim rights to your videos, 
                  and we never use your content for training our AI or any other purpose without explicit permission.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
              <div className="text-gray-300 space-y-4">
                <p>We implement industry-standard security measures:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>End-to-end encryption for all data transmission</li>
                  <li>Advanced access controls and authentication</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>SOC 2 Type II compliance</li>
                  <li>Secure cloud infrastructure with AWS</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">5. Data Sharing</h2>
              <div className="text-gray-300 space-y-4">
                <p>We only share your data in limited circumstances:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-white">Service Providers:</strong> Trusted partners who help us operate our platform (all bound by strict confidentiality)</li>
                  <li><strong className="text-white">Legal Requirements:</strong> When required by law or to protect our rights and users</li>
                  <li><strong className="text-white">Business Transfers:</strong> In the event of a merger or acquisition (with advance notice)</li>
                </ul>
                <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-4 mt-4">
                  <p className="text-red-400 font-semibold">We NEVER sell your personal data to third parties.</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
              <div className="text-gray-300 space-y-4">
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access and download your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt out of marketing communications</li>
                  <li>Request data portability</li>
                  <li>Object to certain data processing activities</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">7. Data Retention</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We retain your data only as long as necessary to provide our services. 
                  When you delete your account, we permanently delete all associated data within 30 days, 
                  except where required by law to retain certain information.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">8. International Transfers</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Your data may be processed in countries other than your own. We ensure adequate 
                  protection through appropriate safeguards, including standard contractual clauses 
                  and adequacy decisions.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
              <div className="text-gray-300 space-y-4">
                <p>If you have questions about this Privacy Policy or our data practices, contact us:</p>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p><strong className="text-white">Email:</strong> privacy@socialitix.com</p>
                  <p><strong className="text-white">Address:</strong> 123 Tech Street, San Francisco, CA 94105</p>
                  <p><strong className="text-white">Data Protection Officer:</strong> dpo@socialitix.com</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">10. Changes to This Policy</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We may update this Privacy Policy from time to time. We'll notify you of significant 
                  changes via email or through our platform. Continued use of our services after 
                  changes constitutes acceptance of the new policy.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}; 