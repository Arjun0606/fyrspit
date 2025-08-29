'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Plane, Zap, Users, Trophy, ArrowRight, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-50 p-6">
        <div className="container mx-auto flex justify-between items-center">
                        <Link href="/" className="flex items-center space-x-2">
                <Image 
                  src="/fyrspit-logo.png" 
                  alt="Fyrspit" 
                  width={32} 
                  height={32} 
                  className="rounded-lg shadow-lg"
                />
                <span className="text-2xl font-bold text-white">Fyrspit</span>
              </Link>
          <div className="space-x-4">
            <Link href="/login" className="btn-secondary">
              Sign In
            </Link>
            <Link href="/signup" className="btn-cta">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-6 py-2 mb-8">
            <div className="h-4 w-4 bg-teal-400 rounded-full"></div>
            <span className="text-teal-400 text-sm font-medium">Enter any flight number → Get EVERYTHING</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            The Social Diary
            <br />
            <span className="gradient-text">for Flying</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Like Letterboxd for aviation. Enter flight numbers → Get aircraft specs, route data, and unlock achievements. 
            Compare stats with friends. Build your flying legacy.
          </p>

          <div className="flex justify-center mb-16">
            <Link href="/signup" className="btn-cta group">
              Start Your Journey
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Live Demo */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 max-w-2xl mx-auto">
            <p className="text-gray-400 mb-4">Try it now: Enter any flight number</p>
            <div className="bg-gray-800 rounded-lg p-4 text-left font-mono text-sm">
              <div className="text-gray-500">$ flight QP1457</div>
              <div className="mt-2 text-green-400">
                ✈️ Boeing 737 MAX 8 (Boeing)<br/>
                🛫 Mumbai → Bangalore (537 miles)<br/>
                ⏱️ 1h 25m flight time<br/>
                🏆 +50 XP earned
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Forza Horizon for Aviation
            </h2>
            <p className="text-gray-400 text-lg">
              Gamified flight tracking with real-time data and social features
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center group hover:border-teal-500/50 transition-colors">
              <div className="w-12 h-12 bg-teal-500/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-500/20 transition-colors">
                <Zap className="h-6 w-6 text-teal-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Instant Intelligence</h3>
              <p className="text-gray-400">
                Enter any flight number worldwide. Get aircraft specs, route data, airline info, and real-time status instantly.
              </p>
              <div className="mt-4 text-xs text-teal-400 bg-teal-500/10 rounded-full px-3 py-1 inline-block">
                Powered by OpenSky Network
              </div>
            </div>

            <div className="card text-center group hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/20 transition-colors">
                <Trophy className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Achievement System</h3>
              <p className="text-gray-400">
                Collect aircraft types, unlock countries, earn XP. Level up from "Ground Crew" to "Captain" and beyond.
              </p>
              <div className="mt-4 text-xs text-purple-400 bg-purple-500/10 rounded-full px-3 py-1 inline-block">
                100+ Achievements
              </div>
            </div>

            <div className="card text-center group hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/20 transition-colors">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Social Discovery</h3>
              <p className="text-gray-400">
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
      <section className="py-20 px-4 bg-gray-900/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Your Complete Aviation Profile
              </h2>
              <div className="space-y-4">
                {[
                  'Aircraft collection (Boeing, Airbus, Embraer)',
                  'Countries & airports unlocked',
                  'Miles flown & hours in the air',
                  'Day/night flight ratio',
                  'Airline loyalty tracking',
                  'Friend comparisons & leaderboards'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-teal-400 flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-8 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">QP1457 • Boeing 737 MAX 8</span>
                  <span className="text-teal-400">+50 XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">EK456 • Airbus A380-800</span>
                  <span className="text-purple-400">🏆 Wide-body Explorer</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">AA123 • Boeing 737-800</span>
                  <span className="text-blue-400">🇺🇸 USA Unlocked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Aviation Journey?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join pilots worldwide tracking their flights and building their aviation legacy.
          </p>
          <Link href="/signup" className="btn-cta text-lg px-8 py-4">
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4">
        <div className="container mx-auto text-center text-gray-400">
          <p>&copy; 2024 Fyrspit. The social diary for flying.</p>
        </div>
      </footer>
    </div>
  )
}