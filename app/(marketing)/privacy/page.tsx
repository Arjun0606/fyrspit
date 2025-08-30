'use client'

import Link from 'next/link'

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          
          <div className="prose prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Information We Collect</h2>
              <p className="text-gray-300 mb-4">
                Fyrspit collects information to provide you with the best aviation tracking experience:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Account Information: Name, email address, and profile details</li>
                <li>Flight Data: Flight numbers, dates, routes, and travel history you choose to log</li>
                <li>Usage Data: How you interact with our app and performance metrics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">How We Use Your Information</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Provide and improve our aviation tracking services</li>
                <li>Calculate your flying statistics, achievements, and XP</li>
                <li>Enable social features like friend connections and leaderboards</li>
                <li>Send you important updates about your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
              <p className="text-gray-300 mb-4">
                If you have any questions about this Privacy Policy, please contact us:
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
