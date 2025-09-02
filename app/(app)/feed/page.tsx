'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, where } from 'firebase/firestore';
import { Plus, TrendingUp, MapPin, Plane, Clock, Trophy, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';


interface Flight {
  id: string;
  userId: string;
  userDisplayName: string;
  userUsername: string;
  userProfilePicture?: string;
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
  createdAt: string;
}

export default function FeedPage() {
  const [user, loading] = useAuthState(auth);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loadingFlights, setLoadingFlights] = useState(true);

  const [profile, setProfile] = useState<{ username?: string; profilePictureUrl?: string } | null>(null);

  useEffect(() => {
    if (user) {
      loadRecentFlights();
      // Load profile for username/avatar fallback
      getDoc(doc(db, 'users', user.uid)).then(s => {
        if (s.exists()) {

          setProfile(s.data() as any);
        } else {
          console.log('No user document found for feed');
        }
      }).catch((error) => {
        console.error('Error loading profile for feed:', error);
      });
    }
  }, [user]);

  const loadRecentFlights = async () => {
    if (!user) return;
    
    try {
      const flightsQuery = query(
        collection(db, 'flights'),
        where('userId', '==', user.uid),
        limit(20)
      );
      
      const flightsSnapshot = await getDocs(flightsQuery);
      const recentFlights = flightsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Flight[];
      
      // Sort by createdAt on client side to avoid index issues
      recentFlights.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setFlights(recentFlights);
    } catch (error) {
      console.error('Error loading flights:', error);
    } finally {
      setLoadingFlights(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Welcome to Fyrspit</h1>
            <p className="text-xl text-gray-300 mb-8">The social diary for flying</p>
            <div className="space-x-4">
              <Link href="/signup" className="btn-primary">Sign Up</Link>
              <Link href="/login" className="btn-secondary">Login</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex-1 pr-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Your Flights</h1>
            <p className="text-gray-400 text-sm sm:text-base">Your personal flight log and statistics</p>
          </div>
          
          <Link
            href="/flights/new"
            className="btn-primary flex items-center space-x-1 sm:space-x-2 shrink-0"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Log Flight</span>
          </Link>
        </div>



        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-3 sm:p-4 shadow-lg text-center">
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold text-white">{flights.length}</div>
            <div className="text-xs sm:text-sm text-gray-400">Recent Flights</div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-3 sm:p-4 shadow-lg text-center">
            <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold text-white">
              {new Set(flights.flatMap(f => [f.route.from.iata, f.route.to.iata])).size}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">Airports</div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-3 sm:p-4 shadow-lg text-center">
            <Plane className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold text-white">
              {new Set(flights.map(f => `${f.aircraft.manufacturer} ${f.aircraft.model}`)).size}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">Aircraft Types</div>
          </div>
        </div>

        {/* Flights Feed */}
        <div className="space-y-4 sm:space-y-6">
          {loadingFlights ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 sm:p-6 shadow-lg animate-pulse">
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-3 sm:h-4 bg-gray-700 rounded w-24 sm:w-32"></div>
                      <div className="h-2 sm:h-3 bg-gray-700 rounded w-16 sm:w-24"></div>
                    </div>
                  </div>
                  <div className="h-3 sm:h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 sm:h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : flights.length === 0 ? (
            <div className="text-center py-12">
              <Plane className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No flights yet</h3>
              <p className="text-gray-400 mb-6">Be the first to share your aviation experience</p>
              <Link href="/flights/new" className="btn-primary">
                Log Your First Flight
              </Link>
            </div>
          ) : (
            flights.map((flight) => (
              <div key={flight.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 sm:p-6 shadow-lg hover:bg-gray-800/80 transition-colors">
                {/* User Header */}
                <div className="flex items-center space-x-3 mb-4">
                  { (profile?.profilePictureUrl || (flight as any).userProfilePicture) ? (
                    <img src={(flight as any).userProfilePicture || profile?.profilePictureUrl || ''} alt={profile?.username || (flight as any).userUsername || 'user'} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">{(profile?.username || (flight as any).userUsername || 'you').charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-white">@{profile?.username || (flight as any).userUsername || 'you'}</div>
                    <div className="text-sm text-gray-400 flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(flight.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Flight Details */}
                <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{flight.route.from.iata}</div>
                        <div className="text-sm text-gray-400">{flight.route.from.city}</div>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <div className="flex items-center space-x-2 text-gray-400">
                          <div className="w-8 h-px bg-gray-400"></div>
                          <Plane className="h-4 w-4" />
                          <div className="w-8 h-px bg-gray-400"></div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{flight.route.to.iata}</div>
                        <div className="text-sm text-gray-400">{flight.route.to.city}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Flight</div>
                      <div className="text-white font-semibold">
                        {flight.airline.code} {flight.flightNumber}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Aircraft</div>
                      <div className="text-white font-semibold">
                        {flight.aircraft.manufacturer} {flight.aircraft.model}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Distance</div>
                      <div className="text-white font-semibold">{flight.route.distance} mi</div>
                    </div>
                  </div>
                </div>

                {/* Review */}
                {flight.reviewShort && (
                  <div className="mb-4">
                    <p className="text-gray-300">"{flight.reviewShort}"</p>
                  </div>
                )}

                {/* Photos */}
                {flight.photos && flight.photos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {flight.photos.slice(0, 4).map((photo, index) => (
                      <div key={index} className="relative aspect-video">
                        <Image
                          src={photo}
                          alt={`Flight photo ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors">
                      <Star className="h-4 w-4" />
                      <span className="text-sm">Like</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 transition-colors">
                      <span className="text-sm">Comment</span>
                    </button>
                  </div>
                  
                  <Link 
                    href={`/flights/${flight.id}`}
                    className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More */}
        {flights.length > 0 && (
          <div className="text-center mt-8">
            <button className="btn-secondary">
              Load More Flights
            </button>
          </div>
        )}
      </div>
    </div>
  );
}