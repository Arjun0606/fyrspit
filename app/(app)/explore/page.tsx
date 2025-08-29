'use client';

import { useState, useEffect } from 'react';
import { Search, TrendingUp, MapPin, Users, Plane, Trophy, Filter, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface TrendingRoute {
  from: { iata: string; city: string; country: string };
  to: { iata: string; city: string; country: string };
  flightCount: number;
  distance: number;
  popularAirlines: string[];
}

interface PopularUser {
  id: string;
  username: string;
  profilePicture?: string;
  totalFlights: number;
  level: number;
  badges: string[];
}

interface FeaturedAirport {
  iata: string;
  name: string;
  city: string;
  country: string;
  recentFlights: number;
  popularWith: string[];
}

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<'routes' | 'users' | 'airports' | 'aircraft'>('routes');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - in production, these would come from APIs
  const trendingRoutes: TrendingRoute[] = [
    {
      from: { iata: 'LAX', city: 'Los Angeles', country: 'USA' },
      to: { iata: 'JFK', city: 'New York', country: 'USA' },
      flightCount: 245,
      distance: 2475,
      popularAirlines: ['American', 'Delta', 'JetBlue']
    },
    {
      from: { iata: 'LHR', city: 'London', country: 'UK' },
      to: { iata: 'DXB', city: 'Dubai', country: 'UAE' },
      flightCount: 189,
      distance: 3414,
      popularAirlines: ['Emirates', 'British Airways']
    },
    {
      from: { iata: 'BOM', city: 'Mumbai', country: 'India' },
      to: { iata: 'BLR', city: 'Bangalore', country: 'India' },
      flightCount: 156,
      distance: 537,
      popularAirlines: ['Akasa Air', 'IndiGo', 'Air India']
    }
  ];

  const popularUsers: PopularUser[] = [
    {
      id: '1',
      username: 'aviation_pro',
      totalFlights: 150,
      level: 8,
      badges: ['Globe Trotter', 'Sky Explorer', 'Frequent Flyer']
    },
    {
      id: '2',
      username: 'pilot_sarah',
      totalFlights: 89,
      level: 6,
      badges: ['Aircraft Expert', 'Route Master']
    },
    {
      id: '3',
      username: 'world_traveler',
      totalFlights: 67,
      level: 5,
      badges: ['Country Collector', 'Airport Hunter']
    }
  ];

  const featuredAirports: FeaturedAirport[] = [
    {
      iata: 'SIN',
      name: 'Singapore Changi Airport',
      city: 'Singapore',
      country: 'Singapore',
      recentFlights: 89,
      popularWith: ['Frequent Flyers', 'Business Travelers']
    },
    {
      iata: 'NRT',
      name: 'Tokyo Narita International',
      city: 'Tokyo',
      country: 'Japan',
      recentFlights: 76,
      popularWith: ['Aviation Enthusiasts', 'Culture Explorers']
    },
    {
      iata: 'CDG',
      name: 'Charles de Gaulle Airport',
      city: 'Paris',
      country: 'France',
      recentFlights: 65,
      popularWith: ['Leisure Travelers', 'Food Lovers']
    }
  ];

  const aircraftTypes = [
    { type: 'Boeing 737', flights: 234, airlines: ['Southwest', 'American', 'United'] },
    { type: 'Airbus A320', flights: 198, airlines: ['JetBlue', 'American', 'Delta'] },
    { type: 'Boeing 777', flights: 145, airlines: ['Emirates', 'United', 'British Airways'] },
    { type: 'Airbus A350', flights: 87, airlines: ['Qatar', 'Singapore', 'Lufthansa'] }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Explore Aviation</h1>
          <p className="text-xl text-gray-300 mb-6">Discover trending routes, top aviators, and popular destinations</p>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search flights, users, airports, or aircraft..."
              className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-8">
          <nav className="flex justify-center space-x-8">
            {[
              { id: 'routes', label: 'Trending Routes', icon: TrendingUp },
              { id: 'users', label: 'Top Aviators', icon: Users },
              { id: 'airports', label: 'Popular Airports', icon: MapPin },
              { id: 'aircraft', label: 'Aircraft Types', icon: Plane },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'routes' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Trending Routes</h2>
                <button className="btn-secondary flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingRoutes.map((route, index) => (
                  <div key={index} className="card hover:bg-gray-800/80 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{route.from.iata}</div>
                        <div className="text-sm text-gray-400">{route.from.city}</div>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <div className="flex items-center space-x-2 text-gray-400">
                          <div className="w-8 h-px bg-gray-400"></div>
                          <Plane className="h-4 w-4" />
                          <div className="w-8 h-px bg-gray-400"></div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{route.to.iata}</div>
                        <div className="text-sm text-gray-400">{route.to.city}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Flights:</span>
                        <span className="text-orange-400 font-semibold">{route.flightCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Distance:</span>
                        <span className="text-white">{route.distance} mi</span>
                      </div>
                      <div className="mt-3">
                        <div className="text-gray-400 text-xs mb-1">Popular Airlines:</div>
                        <div className="flex flex-wrap gap-1">
                          {route.popularAirlines.map((airline, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                              {airline}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Top Aviators</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Trophy className="h-4 w-4" />
                  <span>Ranked by flights logged this month</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularUsers.map((user, index) => (
                  <div key={user.id} className="card hover:bg-gray-800/80 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative">
                        {user.profilePicture ? (
                          <Image
                            src={user.profilePicture}
                            alt={user.username}
                            width={64}
                            height={64}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-white text-xl font-semibold">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          #{index + 1}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">@{user.username}</h3>
                        <div className="text-sm text-gray-400">{user.totalFlights} flights</div>
                        <div className="text-sm text-orange-400">Level {user.level}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Recent Badges:</div>
                      <div className="flex flex-wrap gap-1">
                        {user.badges.map((badge, i) => (
                          <span key={i} className="px-2 py-1 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30 rounded text-xs text-orange-300">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'airports' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Popular Airports</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Globe className="h-4 w-4" />
                  <span>Most visited this month</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredAirports.map((airport, index) => (
                  <div key={airport.iata} className="card hover:bg-gray-800/80 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{airport.iata}</h3>
                        <div className="text-gray-400">{airport.city}, {airport.country}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-400">{airport.recentFlights}</div>
                        <div className="text-xs text-gray-400">recent flights</div>
                      </div>
                    </div>
                    
                    <h4 className="font-semibold text-white mb-2">{airport.name}</h4>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Popular with:</div>
                      <div className="flex flex-wrap gap-1">
                        {airport.popularWith.map((group, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-300">
                            {group}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'aircraft' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Popular Aircraft</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Plane className="h-4 w-4" />
                  <span>Most flown aircraft types</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aircraftTypes.map((aircraft, index) => (
                  <div key={aircraft.type} className="card hover:bg-gray-800/80 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{aircraft.type}</h3>
                        <div className="text-sm text-gray-400">{aircraft.flights} flights logged</div>
                      </div>
                      <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                        <Plane className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Popular Airlines:</div>
                      <div className="flex flex-wrap gap-1">
                        {aircraft.airlines.map((airline, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                            {airline}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="card max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Join the Community</h3>
            <p className="text-gray-300 mb-6">
              Start logging your flights and become part of the aviation community
            </p>
            <Link href="/flights/new" className="btn-primary">
              Log Your First Flight
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}