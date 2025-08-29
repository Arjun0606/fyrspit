'use client';

import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Plane, Sparkles, Calendar, MapPin, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface FlightQuickAddProps {
  onSuccess?: () => void;
}

export function FlightQuickAdd({ onSuccess }: FlightQuickAddProps) {
  const [user] = useAuthState(auth);
  const [flightNumber, setFlightNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [flightData, setFlightData] = useState<any>(null);
  const router = useRouter();

  const handleLookup = async () => {
    if (!flightNumber.trim()) {
      toast.error('Please enter a flight number');
      return;
    }

    setIsLoading(true);
    
    try {
      // Looking up flight data...
      
      const response = await fetch('/api/flights/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          flightNumber: flightNumber.trim().toUpperCase()
        })
      });

      if (!response.ok) {
        throw new Error('Flight not found');
      }

      const result = await response.json();
      
      if (result.success && result.data.flight) {
        setFlightData(result.data);
        toast.success(`✈️ Found ${flightNumber}! ${result.data.flight.route.departure.city} → ${result.data.flight.route.arrival.city}`);
      } else {
        throw new Error('Flight data not available');
      }

    } catch (error) {
      console.error('Flight lookup error:', error);
      toast.error('Flight not found. Please check the flight number.');
      setFlightData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFlight = async () => {
    if (!user) {
      toast.error('Please sign in to add flights');
      router.push('/login');
      return;
    }

    if (!flightData) {
      toast.error('No flight data to add');
      return;
    }

    setIsLoading(true);

    try {
      // Create flight document
      const flightDoc = {
        userId: user.uid,
        flightNumber: flightData.flight.flightNumber,
        airline: flightData.flight.airline,
        aircraft: flightData.flight.aircraft,
        route: flightData.flight.route,
        schedule: flightData.flight.schedule,
        status: flightData.flight.status,
        
        // User-specific data (can be updated later)
        seat: '',
        cabinClass: 'economy',
        rating: {
          overall: 4,
          airline: 4,
          aircraft: 4
        },
        experience: {
          photos: [],
          notes: '',
          tags: []
        },
        
        // Metadata
        createdAt: new Date(),
        visibility: 'public',
        source: 'quick-add',
        
        // Stats for gamification
        stats: flightData.stats
      };

      const response = await fetch('/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flightDoc)
      });

      if (!response.ok) {
        throw new Error('Failed to save flight');
      }

      toast.success(`🎉 Flight ${flightData.flight.flightNumber} added! +${flightData.stats.xpEarned} XP`);
      
      // Reset form
      setFlightNumber('');
      setFlightData(null);
      
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Add flight error:', error);
      toast.error('Failed to add flight. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      if (flightData) {
        handleAddFlight();
      } else {
        handleLookup();
      }
    }
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="h-10 w-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
          <Zap className="h-5 w-5 text-gray-900" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Quick Add Flight</h2>
          <p className="text-gray-400 text-sm">Enter any flight number for instant lookup</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Flight Number Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Flight Number
          </label>
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="e.g., QP1728, AA123, EK456"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
            <button
              onClick={flightData ? handleAddFlight : handleLookup}
              disabled={isLoading || !flightNumber.trim()}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 font-bold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
              ) : flightData ? (
                'Add Flight'
              ) : (
                'Lookup'
              )}
            </button>
          </div>
        </div>

        {/* Flight Data Display */}
        {flightData && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Plane className="h-5 w-5 text-orange-500" />
                <span className="font-bold text-white text-lg">{flightData.flight.flightNumber}</span>
                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">FOUND</span>
              </div>
              <div className="text-right">
                <div className="text-orange-400 font-bold">+{flightData.stats.xpEarned} XP</div>
                <div className="text-xs text-gray-400">Experience Points</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Airline & Aircraft */}
              <div>
                <div className="text-gray-400 text-sm">Airline & Aircraft</div>
                <div className="text-white font-medium">{flightData.flight.airline.name}</div>
                <div className="text-gray-300 text-sm">{flightData.flight.aircraft.type}</div>
                <div className="text-gray-400 text-xs">{flightData.flight.aircraft.registration}</div>
              </div>

              {/* Route */}
              <div>
                <div className="text-gray-400 text-sm">Route</div>
                <div className="text-white font-medium flex items-center space-x-2">
                  <span>{flightData.flight.route.departure.iata}</span>
                  <span className="text-gray-400">→</span>
                  <span>{flightData.flight.route.arrival.iata}</span>
                </div>
                <div className="text-gray-300 text-sm">
                  {flightData.flight.route.departure.city} → {flightData.flight.route.arrival.city}
                </div>
                <div className="text-gray-400 text-xs">{flightData.flight.route.distance} miles</div>
              </div>

              {/* Stats */}
              <div>
                <div className="text-gray-400 text-sm">Flight Stats</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Distance:</span>
                    <span className="text-white">{flightData.stats.miles} mi</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Duration:</span>
                    <span className="text-white">{Math.floor(flightData.stats.duration / 60)}h {flightData.stats.duration % 60}m</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Type:</span>
                    <span className="text-white">{flightData.stats.isInternational ? 'International' : 'Domestic'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            {flightData.stats.achievements && flightData.stats.achievements.length > 0 && (
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-white">New Achievements</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {flightData.stats.achievements.map((achievement: any, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-yellow-600 text-yellow-100 text-xs rounded-full flex items-center space-x-1"
                    >
                      <span>{achievement.icon}</span>
                      <span>{achievement.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Examples */}
        {!flightData && (
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-3">Try these examples:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['QP1728', 'AA123', 'EK456', 'BA123', 'LH456'].map((example) => (
                <button
                  key={example}
                  onClick={() => setFlightNumber(example)}
                  className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition-all"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
