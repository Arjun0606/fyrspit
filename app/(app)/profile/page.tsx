'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { User, MapPin, Calendar, Plane, Trophy, Users, Settings, Edit, Share2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserProfile {
  username: string;
  profilePictureUrl?: string;
  age?: number;
  gender?: string;
  homeAirport: string;
  travelStyle: string;
  onboarded: boolean;
  stats?: {
    totalFlights: number;
    totalMiles: number;
    totalHours: number;
    level: number;
    xp: number;
    airportsVisited: number;
    countriesVisited: number;
    aircraftTypes: number;
  };
}

interface Flight {
  id: string;
  flightNumber: string;
  airline: { name: string; code: string };
  aircraft: { model: string; manufacturer: string };
  route: {
    from: { iata: string; city: string; country: string };
    to: { iata: string; city: string; country: string };
    distance: number;
  };
  date: string;
  reviewShort: string;
  photos?: string[];
}

export default function ProfilePage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState<'flights' | 'stats' | 'collections' | 'achievements'>('flights');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadUserProfile();
      loadUserFlights();
    }
  }, [user, loading, router]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        setProfile(userData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadUserFlights = async () => {
    if (!user) return;

    try {
      const flightsQuery = query(
        collection(db, 'flights'),
        where('userId', '==', user.uid)
      );
      
      const flightsSnapshot = await getDocs(flightsQuery);
      const userFlights = flightsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Flight[];
      // Sort client-side to avoid needing a composite index
      userFlights.sort((a: any, b: any) => {
        const ad = (a?.createdAt?.toDate?.() || new Date(a?.createdAt || a?.date || 0)).getTime();
        const bd = (b?.createdAt?.toDate?.() || new Date(b?.createdAt || b?.date || 0)).getTime();
        return bd - ad;
      });
      setFlights(userFlights);
    } catch (error) {
      console.error('Error loading flights:', error);
    }
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
          <Link href="/onboarding" className="btn-primary">
            Complete Setup
          </Link>
        </div>
      </div>
    );
  }

  // Compute collections and derived stats from saved flights
  const collections = (() => {
    const countries = new Set<string>();
    const airports = new Set<string>();
    const airlines = new Set<string>();
    const aircraftModels = new Set<string>();
    const manufacturers = new Set<string>();

    for (const f of flights) {
      if ((f as any).route?.from?.iata) airports.add((f as any).route.from.iata);
      if ((f as any).route?.to?.iata) airports.add((f as any).route.to.iata);
      if ((f as any).route?.from?.country) countries.add((f as any).route.from.country);
      if ((f as any).route?.to?.country) countries.add((f as any).route.to.country);
      if (f.airline?.name) airlines.add(f.airline.name);
      if (f.aircraft?.model) aircraftModels.add(f.aircraft.model);
      if (f.aircraft?.manufacturer) manufacturers.add(f.aircraft.manufacturer);
    }

    return {
      countries: Array.from(countries).sort(),
      airports: Array.from(airports).sort(),
      airlines: Array.from(airlines).sort(),
      aircraftModels: Array.from(aircraftModels).sort(),
      manufacturers: Array.from(manufacturers).sort(),
    };
  })();

  const derivedStats = (() => {
    const totalFlights = flights.length;
    const totalMiles = flights.reduce((sum, f: any) => sum + (Number(f?.route?.distance) || 0), 0);
    const totalHours = flights.reduce((sum, f: any) => sum + ((Number((f as any)?.route?.duration) || 0) / 60), 0);
    return {
      totalFlights,
      totalMiles: Math.round(totalMiles),
      totalHours: Math.round(totalHours),
      airportsVisited: collections.airports.length,
      countriesVisited: collections.countries.length,
      aircraftTypes: collections.aircraftModels.length,
      level: profile?.stats?.level || 1,
      xp: profile?.stats?.xp || 0,
    };
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="bg-gray-900/50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4 sm:space-x-6">
              {/* Profile Picture */}
              <div className="relative shrink-0">
                {profile.profilePictureUrl ? (
                  <img
                    src={profile.profilePictureUrl}
                    alt={profile.username}
                    className="w-20 h-20 sm:w-30 sm:h-30 rounded-full object-cover border-4 border-orange-500"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-30 sm:h-30 bg-gray-700 rounded-full flex items-center justify-center border-4 border-gray-600">
                    <User className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  </div>
                )}
                <Link href="/settings" className="absolute bottom-0 right-0 bg-orange-500 rounded-full p-1.5 sm:p-2 hover:bg-orange-600 transition-colors">
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4 text-gray-900" />
                </Link>
              </div>

              {/* Profile Info */}
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">@{profile.username}</h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 sm:mt-2 text-gray-300 text-sm">
                  {profile.age && (
                    <span>{profile.age} years old</span>
                  )}
                  {profile.homeAirport && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{profile.homeAirport}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{flights.length} flights</span>
                  </div>
                </div>
                
                {/* Level and XP */}
                {derivedStats && (
                  <div className="mt-2 sm:mt-3 flex items-center space-x-3 sm:space-x-4">
                    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                      Level {derivedStats.level}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">
                      {derivedStats.xp.toLocaleString()} XP
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-3 self-end sm:self-auto">
              <button className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm">
                <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <Link href="/settings" className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm">
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {derivedStats && (
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-3 sm:p-4 shadow-lg text-center">
              <div className="text-lg sm:text-2xl font-bold text-orange-400">{derivedStats.totalFlights}</div>
              <div className="text-xs sm:text-sm text-gray-400">Total Flights</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-3 sm:p-4 shadow-lg text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-400">{derivedStats.totalMiles.toLocaleString()}</div>
              <div className="text-xs sm:text-sm text-gray-400">Miles Flown</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-3 sm:p-4 shadow-lg text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-400">{derivedStats.airportsVisited}</div>
              <div className="text-xs sm:text-sm text-gray-400">Airports</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-3 sm:p-4 shadow-lg text-center">
              <div className="text-lg sm:text-2xl font-bold text-purple-400">{derivedStats.countriesVisited}</div>
              <div className="text-xs sm:text-sm text-gray-400">Countries</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="border-b border-gray-700">
          <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
            {[
              { id: 'flights', label: 'Flights', icon: Plane },
              { id: 'stats', label: 'Statistics', icon: Trophy },
              { id: 'collections', label: 'Collections', icon: Users },
              { id: 'achievements', label: 'Achievements', icon: Users },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'flights' && (
          <div className="space-y-4">
            {flights.length === 0 ? (
              <div className="text-center py-12">
                <Plane className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No flights yet</h3>
                <p className="text-gray-400 mb-6">Start logging your flights to build your aviation profile</p>
                <Link href="/flights/new" className="btn-primary">
                  Log Your First Flight
                </Link>
              </div>
            ) : (
              flights.map((flight) => (
                <div key={flight.id} className="card hover:bg-gray-800/80 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                        <Plane className="h-6 w-6 text-gray-900" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          {flight.route.from.iata} → {flight.route.to.iata}
                        </div>
                        <div className="text-sm text-gray-400">
                          {flight.airline.name} {flight.flightNumber}
                        </div>
                        <div className="text-sm text-gray-400">
                          {flight.aircraft.manufacturer} {flight.aircraft.model}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">
                        {new Date(flight.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {flight.route.distance} miles
                      </div>
                    </div>
                  </div>
                  {flight.reviewShort && (
                    <div className="mt-3 text-sm text-gray-300">
                      "{flight.reviewShort}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Flight Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Distance</span>
                  <span className="text-white">{derivedStats.totalMiles.toLocaleString()} miles</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Flight Hours</span>
                  <span className="text-white">{derivedStats.totalHours.toLocaleString()} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Aircraft Types</span>
                  <span className="text-white">{derivedStats.aircraftTypes}</span>
                </div>
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Level Progress</span>
                    <span className="text-sm text-gray-400">
                      {derivedStats.xp} / {(derivedStats.level || 1) * 1000} XP
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full"
                      style={{ 
                        width: `${((derivedStats.xp || 0) % 1000) / 10}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'collections' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Countries Unlocked ({collections.countries.length})</h3>
              {collections.countries.length === 0 ? (
                <p className="text-gray-400 text-sm">Log flights to unlock countries.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {collections.countries.map((c) => (
                    <span key={c} className="px-2 py-1 bg-orange-500/20 border border-orange-500/30 rounded text-xs text-orange-300">{c}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Airports Unlocked ({collections.airports.length})</h3>
              {collections.airports.length === 0 ? (
                <p className="text-gray-400 text-sm">Log flights to unlock airports.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {collections.airports.map((a) => (
                    <span key={a} className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">{a}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Airlines Unlocked ({collections.airlines.length})</h3>
              {collections.airlines.length === 0 ? (
                <p className="text-gray-400 text-sm">Log flights to unlock airlines.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {collections.airlines.map((al) => (
                    <span key={al} className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-300">{al}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Aircraft Unlocked ({collections.aircraftModels.length})</h3>
              {collections.aircraftModels.length === 0 ? (
                <p className="text-gray-400 text-sm">Log flights to unlock aircraft.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {collections.aircraftModels.map((m) => (
                    <span key={m} className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-300">{m}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Removed Manufacturers Unlocked card */}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Sample achievements */}
            <div className="card text-center">
              <div className="text-4xl mb-2">🏆</div>
              <h4 className="font-semibold text-white">First Flight</h4>
              <p className="text-sm text-gray-400">Log your first flight</p>
            </div>
            <div className="card text-center opacity-50">
              <div className="text-4xl mb-2">✈️</div>
              <h4 className="font-semibold text-gray-400">Sky Explorer</h4>
              <p className="text-sm text-gray-500">Visit 10 airports</p>
            </div>
            <div className="card text-center opacity-50">
              <div className="text-4xl mb-2">🌍</div>
              <h4 className="font-semibold text-gray-400">Globe Trotter</h4>
              <p className="text-sm text-gray-500">Visit 5 countries</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
