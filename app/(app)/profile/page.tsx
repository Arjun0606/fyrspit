'use client';

import { useState, useEffect } from 'react';
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
    from: { iata: string; city: string };
    to: { iata: string; city: string };
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
  const [activeTab, setActiveTab] = useState<'flights' | 'stats' | 'achievements'>('flights');

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
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      );
      
      const flightsSnapshot = await getDocs(flightsQuery);
      const userFlights = flightsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Flight[];
      
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="bg-gray-900/50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Profile Picture */}
              <div className="relative">
                {profile.profilePictureUrl ? (
                  <Image
                    src={profile.profilePictureUrl}
                    alt={profile.username}
                    width={120}
                    height={120}
                    className="rounded-full object-cover border-4 border-orange-500"
                  />
                ) : (
                  <div className="w-30 h-30 bg-gray-700 rounded-full flex items-center justify-center border-4 border-gray-600">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <button className="absolute bottom-0 right-0 bg-orange-500 rounded-full p-2 hover:bg-orange-600 transition-colors">
                  <Edit className="h-4 w-4 text-gray-900" />
                </button>
              </div>

              {/* Profile Info */}
              <div>
                <h1 className="text-3xl font-bold text-white">@{profile.username}</h1>
                <div className="flex items-center space-x-4 mt-2 text-gray-300">
                  {profile.age && (
                    <span>{profile.age} years old</span>
                  )}
                  {profile.homeAirport && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.homeAirport}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{flights.length} flights</span>
                  </div>
                </div>
                
                {/* Level and XP */}
                {profile.stats && (
                  <div className="mt-3 flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                      Level {profile.stats.level}
                    </div>
                    <div className="text-sm text-gray-400">
                      {profile.stats.xp.toLocaleString()} XP
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button className="btn-secondary flex items-center space-x-2">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
              <Link href="/settings" className="btn-secondary flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {profile.stats && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card text-center">
              <div className="text-2xl font-bold text-orange-400">{profile.stats.totalFlights}</div>
              <div className="text-sm text-gray-400">Total Flights</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-blue-400">{profile.stats.totalMiles.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Miles Flown</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-green-400">{profile.stats.airportsVisited}</div>
              <div className="text-sm text-gray-400">Airports</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-purple-400">{profile.stats.countriesVisited}</div>
              <div className="text-sm text-gray-400">Countries</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8">
            {[
              { id: 'flights', label: 'Flights', icon: Plane },
              { id: 'stats', label: 'Statistics', icon: Trophy },
              { id: 'achievements', label: 'Achievements', icon: Users },
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
                  <span className="text-white">{profile.stats?.totalMiles.toLocaleString()} miles</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Flight Hours</span>
                  <span className="text-white">{profile.stats?.totalHours.toLocaleString()} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Aircraft Types</span>
                  <span className="text-white">{profile.stats?.aircraftTypes}</span>
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
                      {profile.stats?.xp} / {(profile.stats?.level || 1) * 1000} XP
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full"
                      style={{ 
                        width: `${((profile.stats?.xp || 0) % 1000) / 10}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
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
