'use client'
// Force dynamic rendering
import Link from 'next/link'
import Image from 'next/image'
import { Plane, Zap, Users, Trophy, ArrowRight, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-50 p-4 sm:p-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/fyrspit-logo.png" 
              alt="Fyrspit" 
              width={28} 
              height={28} 
              className="rounded-lg shadow-lg sm:w-8 sm:h-8"
            />
            <span className="text-xl sm:text-2xl font-bold text-white">Fyrspit</span>
          </Link>
          <div className="flex space-x-2 sm:space-x-4">
            <Link href="/login" className="btn-secondary text-sm sm:text-base px-3 py-2 sm:px-4">
              Sign In
            </Link>
            <Link href="/signup" className="btn-cta text-sm sm:text-base px-3 py-2 sm:px-4">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-20 px-4">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="inline-flex items-center space-x-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 sm:px-6 py-2 mb-6 sm:mb-8">
            <div className="h-3 w-3 sm:h-4 sm:w-4 bg-teal-400 rounded-full"></div>
            <span className="text-teal-400 text-xs sm:text-sm font-medium">Enter any flight number → Get EVERYTHING</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-none">
            <span className="block mb-1 sm:mb-2">The Social</span>
            <span className="block mb-1 sm:mb-2">Diary</span>
            <span className="gradient-text block">for Flying</span>
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-2">
            Like Letterboxd for aviation. Enter flight numbers → Get aircraft specs, route data, and unlock achievements. 
            Compare stats with friends. Build your flying legacy.
          </p>

          <div className="flex justify-center mb-12 sm:mb-16 px-4">
            <Link href="/signup" className="btn-cta group w-full sm:w-auto max-w-xs text-center inline-flex items-center justify-center">
              Start Your Journey
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Live Demo */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 mx-2 sm:mx-auto max-w-2xl">
            <p className="text-gray-400 mb-3 text-center text-sm sm:text-base">Try it now: Enter any flight number</p>
            <div className="bg-gray-800 rounded-lg p-3 sm:p-4 text-left font-mono text-xs overflow-x-auto">
              <div className="text-gray-500 mb-2">$ flight QP1457</div>
              <div className="text-green-400 space-y-1">
                <div className="flex items-center space-x-2">
                  <span>✈️</span>
                  <span className="truncate">Boeing 737 MAX 8 (Boeing)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>🛫</span>
                  <span className="truncate">Mumbai → Bangalore (537 miles)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>⏱️</span>
                  <span>1h 25m flight time</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>🏆</span>
                  <span>+50 XP earned</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
              Forza Horizon for Aviation
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
              Gamified flight tracking with real-time data and social features
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="card text-center group hover:border-teal-500/50 transition-colors p-6">
              <div className="w-12 h-12 bg-teal-500/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-500/20 transition-colors">
                <Zap className="h-6 w-6 text-teal-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3">Instant Intelligence</h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                Enter any flight number worldwide. Get aircraft specs, route data, airline info, and real-time status instantly.
              </p>
              <div className="mt-4 text-xs text-teal-400 bg-teal-500/10 rounded-full px-3 py-1 inline-block">
                Powered by OpenSky Network
              </div>
            </div>

            <div className="card text-center group hover:border-purple-500/50 transition-colors p-6">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/20 transition-colors">
                <Trophy className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3">Achievement System</h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                Collect aircraft types, unlock countries, earn XP. Level up from "Ground Crew" to "Captain" and beyond.
              </p>
              <div className="mt-4 text-xs text-purple-400 bg-purple-500/10 rounded-full px-3 py-1 inline-block">
                100+ Achievements
              </div>
            </div>

            <div className="card text-center group hover:border-blue-500/50 transition-colors p-6 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/20 transition-colors">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3">Social Discovery</h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                Compare stats with friends. Follow other pilots. Discover who flew the same routes and aircraft as you.
              </p>
              <div className="mt-4 text-xs text-blue-400 bg-blue-500/10 rounded-full px-3 py-1 inline-block">
                Strava for Aviation
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-20 px-4 bg-gray-900/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
                Your Complete Aviation Profile
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {[
                  'Aircraft collection (Boeing, Airbus, Embraer)',
                  'Countries & airports unlocked',
                  'Miles flown & hours in the air',
                  'Day/night flight ratio',
                  'Airline loyalty tracking',
                  'Friend comparisons & leaderboards'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm sm:text-base">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 backdrop-blur-sm order-1 lg:order-2">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm truncate pr-2">QP1457 • Boeing 737 MAX 8</span>
                  <span className="text-teal-400 text-sm font-medium">+50 XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm truncate pr-2">EK456 • Airbus A380-800</span>
                  <span className="text-purple-400 text-sm font-medium">🏆 Superjumbo</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm truncate pr-2">AA123 • Boeing 737-800</span>
                  <span className="text-blue-400 text-sm font-medium">🇺🇸 USA Unlocked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
            Ready to Start Your Aviation Journey?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 mb-6 sm:mb-8 px-4">
            Join pilots worldwide tracking their flights and building their aviation legacy.
          </p>
          <Link href="/signup" className="btn-cta text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto max-w-xs mx-auto block sm:inline-block">
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 sm:py-8 px-4">
        <div className="container mx-auto text-center text-gray-400">
          <p className="text-sm sm:text-base">&copy; 2024 Fyrspit. The social diary for flying.</p>
        </div>
      </footer>
    </div>
  )
}