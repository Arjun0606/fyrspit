'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowLeft, MapPin, Clock, Plane, Star, Share2, Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface FlightDetails {
  id: string;
  userId: string;
  userDisplayName: string;
  userUsername: string;
  userProfilePicture?: string;
  flightNumber: string;
  airline: { name: string; code: string };
  aircraft: { model: string; manufacturer: string; specs?: any };
  route: {
    from: { iata: string; city: string; name: string };
    to: { iata: string; city: string; name: string };
    distance: number;
  };
  timing: {
    scheduled: { departure: string; arrival: string };
    actual?: { departure: string; arrival: string };
    duration: string;
  };
  date: string;
  reviewShort: string;
  reviewLong?: string;
  rating?: number;
  photos?: string[];
  stats: {
    miles: number;
    duration: number;
    xpEarned: number;
  };
  createdAt: string;
}

export default function FlightDetailPage() {
  const params = useParams();
  const flightId = params.id as string;
  const [flight, setFlight] = useState<FlightDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (flightId) {
      loadFlightDetails();
    }
  }, [flightId]);

  const loadFlightDetails = async () => {
    try {
      const flightDoc = await getDoc(doc(db, 'flights', flightId));
      if (flightDoc.exists()) {
        setFlight({ id: flightDoc.id, ...flightDoc.data() } as FlightDetails);
      }
    } catch (error) {
      console.error('Error loading flight:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Flight not found</h1>
          <Link href="/feed" className="btn-primary">
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Link href="/feed" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
            <ArrowLeft className="h-5 w-5 text-white" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Flight Details</h1>
            <p className="text-gray-400">{flight.airline.name} {flight.flightNumber}</p>
          </div>
        </div>

        {/* User Info */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {flight.userProfilePicture ? (
                <Image
                  src={flight.userProfilePicture}
                  alt={flight.userUsername}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {flight.userUsername?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div>
                <div className="font-semibold text-white">@{flight.userUsername}</div>
                <div className="text-sm text-gray-400 flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(flight.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                <Heart className="h-5 w-5 text-gray-300" />
              </button>
              <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                <Share2 className="h-5 w-5 text-gray-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Route Display */}
        <div className="card mb-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-4xl font-bold text-white">{flight.route.from.iata}</div>
                <div className="text-lg text-gray-300">{flight.route.from.city}</div>
                <div className="text-sm text-gray-400">{flight.route.from.name}</div>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center mx-8">
                <div className="flex items-center space-x-2 text-gray-400 mb-2">
                  <div className="w-16 h-px bg-gray-400"></div>
                  <Plane className="h-6 w-6 text-orange-500" />
                  <div className="w-16 h-px bg-gray-400"></div>
                </div>
                <div className="text-sm text-gray-400">{flight.route.distance} miles</div>
                <div className="text-sm text-orange-400">{flight.timing.duration}</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-white">{flight.route.to.iata}</div>
                <div className="text-lg text-gray-300">{flight.route.to.city}</div>
                <div className="text-sm text-gray-400">{flight.route.to.name}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Flight Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Flight Details */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Flight Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Flight Number</span>
                <span className="text-white font-semibold">{flight.airline.code} {flight.flightNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Airline</span>
                <span className="text-white">{flight.airline.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Aircraft</span>
                <span className="text-white">{flight.aircraft.manufacturer} {flight.aircraft.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date</span>
                <span className="text-white">{new Date(flight.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Timing */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Timing</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Departure</span>
                <span className="text-white">{flight.timing.scheduled.departure}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Arrival</span>
                <span className="text-white">{flight.timing.scheduled.arrival}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Duration</span>
                <span className="text-white">{flight.timing.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Distance</span>
                <span className="text-white">{flight.route.distance} miles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Review & Rating */}
        {(flight.reviewShort || flight.reviewLong || flight.rating) && (
          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Review</h3>
            
            {flight.rating && (
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= flight.rating! 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-white font-semibold">{flight.rating}/5</span>
              </div>
            )}
            
            <div className="space-y-3">
              {flight.reviewShort && (
                <p className="text-gray-300 italic">"{flight.reviewShort}"</p>
              )}
              {flight.reviewLong && (
                <p className="text-gray-200">{flight.reviewLong}</p>
              )}
            </div>
          </div>
        )}

        {/* Photos */}
        {flight.photos && flight.photos.length > 0 && (
          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Photos</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {flight.photos.map((photo, index) => (
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
          </div>
        )}

        {/* Stats */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-orange-400">{flight.stats.miles}</div>
              <div className="text-sm text-gray-400">Miles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{flight.stats.duration}h</div>
              <div className="text-sm text-gray-400">Duration</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{flight.stats.xpEarned}</div>
              <div className="text-sm text-gray-400">XP Earned</div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Comments</h3>
            <button className="btn-secondary flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Add Comment</span>
            </button>
          </div>
          
          <div className="text-center py-8 text-gray-400">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        </div>
      </div>
    </div>
  );
}