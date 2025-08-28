import Link from 'next/link';
import { Plane, Users, Trophy, Camera, MapPin, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Navigation */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Plane className="h-8 w-8 text-teal-500" />
              <span className="text-2xl font-bold text-white">Fyrspit</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="btn-secondary">
                Log In
              </Link>
              <Link href="/signup" className="btn-cta">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">Log flights.</span><br />
            <span className="gradient-text">Tell your story.</span><br />
            <span className="text-white">Discover the culture of flying.</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            The social diary for aviation enthusiasts. Track your flights, review airlines and airports, 
            share photos, and connect with fellow travelers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-cta text-lg px-8 py-4">
              Start Your Journey
            </Link>
            <Link href="/import" className="btn-secondary text-lg px-8 py-4">
              Import Past Flights
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to chronicle your aviation journey
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Camera className="h-8 w-8" />}
              title="Rich Flight Logs"
              description="Log flights with photos, ratings, reviews, and detailed metadata. Never forget a journey."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Social Discovery"
              description="Follow fellow aviation enthusiasts, discover new routes, and share your experiences."
            />
            <FeatureCard
              icon={<Trophy className="h-8 w-8" />}
              title="Achievements & Stats"
              description="Earn badges, climb leaderboards, and track detailed statistics about your flying habits."
            />
            <FeatureCard
              icon={<MapPin className="h-8 w-8" />}
              title="Airport Guides"
              description="Community-driven guides for food, lounges, duty-free, and terminal experiences."
            />
            <FeatureCard
              icon={<Star className="h-8 w-8" />}
              title="Reviews & Ratings"
              description="Rate airlines, aircraft, airports, crew, and food. Help others make informed choices."
            />
            <FeatureCard
              icon={<Plane className="h-8 w-8" />}
              title="Fleet Tracking"
              description="Track which aircraft you've flown, from A380s to regional jets. Become an aircraft expert."
            />
          </div>
        </div>
      </section>

      {/* Sample Reviews */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            See what travelers are sharing
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <SampleReview
              route="JFK → LHR"
              airline="British Airways"
              aircraft="Boeing 777-300ER"
              review="Premium economy was worth the upgrade. Amazing views of the Irish coast on approach to Heathrow."
              rating={4}
              author="@aviationgeek"
            />
            <SampleReview
              route="NRT → LAX"
              airline="Japan Airlines"
              aircraft="Boeing 787-9"
              review="JAL's hospitality is unmatched. The kaiseki meal was restaurant quality at 35,000 feet."
              rating={5}
              author="@skywardbound"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to start logging?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of aviation enthusiasts sharing their flying stories.
          </p>
          <Link href="/signup" className="btn-cta text-lg px-8 py-4">
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Plane className="h-6 w-6 text-teal-500" />
              <span className="text-xl font-bold">Fyrspit</span>
            </div>
            <div className="flex space-x-6 text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 Fyrspit. The social diary for flying.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card text-center">
      <div className="text-teal-500 mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function SampleReview({ route, airline, aircraft, review, rating, author }: {
  route: string;
  airline: string;
  aircraft: string;
  review: string;
  rating: number;
  author: string;
}) {
  return (
    <div className="card">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg">{route}</h3>
          <p className="text-gray-400">{airline} • {aircraft}</p>
        </div>
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-gray-300 mb-3">"{review}"</p>
      <p className="text-teal-400 text-sm">{author}</p>
    </div>
  );
}
