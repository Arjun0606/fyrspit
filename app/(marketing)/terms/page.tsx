'use client'

import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold">Fyrspit</span>
            </Link>
            <Link 
              href="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Terms and Conditions
          </h1>
          
          <div className="prose prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Acceptance of Terms</h2>
              <p className="text-gray-300">
                By using Fyrspit, you agree to these Terms and Conditions. If you do not agree, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Service Description</h2>
              <p className="text-gray-300">
                Fyrspit is a social aviation tracking platform that allows users to log flights, track statistics, 
                earn achievements, and connect with other aviation enthusiasts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">User Responsibilities</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Provide accurate flight information</li>
                <li>Respect other users and maintain appropriate conduct</li>
                <li>Do not share false or misleading information</li>
                <li>Protect your account credentials</li>
                <li>Use the service in compliance with applicable laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Intellectual Property</h2>
              <p className="text-gray-300">
                Fyrspit and its content are owned by us and protected by copyright and other intellectual property laws. 
                You may not copy, modify, or distribute our content without permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Limitation of Liability</h2>
              <p className="text-gray-300">
                Fyrspit is provided "as is" without warranties. We are not liable for any damages arising from your use 
                of the service, including but not limited to data loss or service interruptions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Account Termination</h2>
              <p className="text-gray-300">
                We reserve the right to terminate accounts that violate these terms or engage in inappropriate behavior. 
                You may also delete your account at any time through the app settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
              <p className="text-gray-300 mb-4">
                If you have questions about these Terms and Conditions:
              </p>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-300">
                  <strong>Email:</strong> <a href="mailto:karjunvarma2001@gmail.com" className="text-orange-400 hover:text-orange-300">karjunvarma2001@gmail.com</a>
                </p>
                <p className="text-gray-300">
                  <strong>X (Twitter):</strong> <a href="https://x.com/arjun06061" className="text-orange-400 hover:text-orange-300">@arjun06061</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
