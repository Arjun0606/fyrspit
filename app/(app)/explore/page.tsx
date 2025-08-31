'use client';

import { useState, useEffect } from 'react';
import { Search, TrendingUp, MapPin, Users, Plane, Trophy, Filter, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

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
  const [routes, setRoutes] = useState<TrendingRoute[]>([]);
  const [airports, setAirports] = useState<FeaturedAirport[]>([]);
  const [aircrafts, setAircrafts] = useState<{ type: string; flights: number; airlines: string[] }[]>([]);
  const [users, setUsers] = useState<PopularUser[]>([]);

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDocs(query(collection(db, 'flights'), where('userId', '==', user.uid)));
      const flights = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

      // Routes aggregate
      const routeMap = new Map<string, { from: any; to: any; count: number; distance: number; airlines: Set<string> }>();
      for (const f of flights) {
        const key = `${f.route?.from?.iata}-${f.route?.to?.iata}`;
        if (!routeMap.has(key)) {
          routeMap.set(key, { from: f.route?.from, to: f.route?.to, count: 0, distance: f.route?.distance || 0, airlines: new Set<string>() });
        }
        const entry = routeMap.get(key)!;
        entry.count += 1;
        if (f.airline?.name) entry.airlines.add(f.airline.name);
      }
      setRoutes(Array.from(routeMap.values()).map(v => ({ from: v.from, to: v.to, flightCount: v.count, distance: v.distance, popularAirlines: Array.from(v.airlines) })));

      // Airports aggregate
      const airportMap = new Map<string, { iata: string; name: string; city: string; country: string; recentFlights: number; popularWith: Set<string> }>();
      for (const f of flights) {
        for (const side of ['from', 'to'] as const) {
          const a = f.route?.[side];
          if (!a?.iata) continue;
          if (!airportMap.has(a.iata)) airportMap.set(a.iata, { iata: a.iata, name: a.name || '', city: a.city || '', country: a.country || '', recentFlights: 0, popularWith: new Set<string>() });
          const entry = airportMap.get(a.iata)!;
          entry.recentFlights += 1;
          if (f.airline?.name) entry.popularWith.add(f.airline.name);
        }
      }
      setAirports(Array.from(airportMap.values()).map(v => ({ ...v, popularWith: Array.from(v.popularWith) })));

      // Aircraft aggregate
      const aircraftMap = new Map<string, { flights: number; airlines: Set<string> }>();
      for (const f of flights) {
        const type = `${f.aircraft?.manufacturer || 'Unknown'} ${f.aircraft?.model || ''}`.trim();
        if (!aircraftMap.has(type)) aircraftMap.set(type, { flights: 0, airlines: new Set<string>() });
        const entry = aircraftMap.get(type)!;
        entry.flights += 1;
        if (f.airline?.name) entry.airlines.add(f.airline.name);
      }
      setAircrafts(Array.from(aircraftMap.entries()).map(([type, v]) => ({ type, flights: v.flights, airlines: Array.from(v.airlines) })));

      // Top aviators (just the current user for now)
      setUsers([
        {
          id: user.uid,
          username: user.displayName || user.email?.split('@')[0] || 'you',
          profilePicture: user.photoURL || undefined,
          totalFlights: flights.length,
          level: 1,
          badges: [],
        },
      ]);
    };
    load();
  }, []);

  // No dummy data placeholders
  const trendingRoutes: TrendingRoute[] = routes;
  const popularUsers: PopularUser[] = users.filter(u => u.totalFlights > 0);
  const featuredAirports: FeaturedAirport[] = airports;
  const aircraftTypes: { type: string; flights: number; airlines: string[] }[] = aircrafts;

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
          <nav className="tabs-scroll flex justify-center space-x-8">
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
              
              {trendingRoutes.length === 0 ? (
                <div className="text-gray-400">No data yet. This section will populate from live stats.</div>
              ) : (
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
              )}
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
              
              {popularUsers.length === 0 ? (
                <div className="text-gray-400">No users to show yet.</div>
              ) : (
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
              )}
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
              
              {featuredAirports.length === 0 ? (
                <div className="text-gray-400">No airports to show yet.</div>
              ) : (
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
              )}
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
              
              {aircraftTypes.length === 0 ? (
                <div className="text-gray-400">No aircraft data yet.</div>
              ) : (
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
              )}
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