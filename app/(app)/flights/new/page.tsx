'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { ArrowLeft, Plane, Zap, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function NewFlightPage() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [flightNumber, setFlightNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [flightData, setFlightData] = useState<any>(null);

  const handleFlightLookup = async () => {
    if (!flightNumber.trim()) {
      toast.error('Please enter a flight number');
      return;
    }

    if (!user) {
      toast.error('Please sign in to log flights');
      return;
    }

    setIsLoading(true);
    
    try {
      // Get comprehensive flight data
      const response = await fetch('/api/flights/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          flightNumber: flightNumber.trim().toUpperCase()
        }),
      });

      if (!response.ok) {
        throw new Error('Flight not found or data unavailable');
      }

      const result = await response.json();
      setFlightData(result);

      // Show success with flight details
      if (result.route) {
        toast.success(`✈️ ${result.route.from.city} → ${result.route.to.city}`, { duration: 3000 });
      }
      
      if (result.aircraft) {
        toast.success(`🛩️ ${result.aircraft.manufacturer} ${result.aircraft.model}`, { duration: 2500 });
      }

      if (result.airline) {
        toast.success(`🏢 ${result.airline.name}`, { duration: 2000 });
      }

      // Show stats that will be earned
      if (result.stats) {
        toast.success(`🎯 +${result.stats.xpEarned} XP • ${result.stats.milesFlown} miles`, { 
          duration: 4000 
        });
      }

    } catch (error: any) {
      console.error('Flight lookup error:', error);
      toast.error(error.message || 'Failed to find flight data');
      setFlightData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFlight = async () => {
    if (!flightData || !user) return;

    setIsLoading(true);
    
    try {
      const token = await user.getIdToken();
      
      const response = await fetch('/api/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          flightNumber: flightNumber.trim().toUpperCase(),
          ...flightData,
          // Set sensible defaults
          visibility: 'public',
          reviewShort: `Great flight on ${flightData.airline?.name || 'this airline'}!`,
          date: new Date().toISOString().split('T')[0], // Today's date
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save flight');
      }

      const result = await response.json();
      
      toast.success('🎉 Flight logged successfully!');
      router.push(`/flights/${result.flightId}`);
      
    } catch (error: any) {
      console.error('Save flight error:', error);
      toast.error(error.message || 'Failed to save flight');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
        <Link
          href="/feed"
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold">Log a Flight</h1>
          <p className="text-gray-400 text-sm sm:text-base">Enter any flight number → Get everything automatically</p>
        </div>
      </div>

      {/* Main Flight Entry */}
      <div className="space-y-4 sm:space-y-6">
        {/* Flight Number Input */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-center space-x-2 mb-4">
            <Plane className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
            <h2 className="text-lg sm:text-xl font-semibold">Flight Number</h2>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-800 border border-gray-600 rounded-lg text-white text-lg sm:text-xl font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g. QP1457, AA123, EK456"
                onKeyPress={(e) => e.key === 'Enter' && handleFlightLookup()}
              />
              
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                ) : (
                  <Zap className="h-6 w-6 text-gray-500" />
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-400 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Powered by real-time flight data • No manual entry required
            </p>

            <button
              onClick={handleFlightLookup}
              disabled={isLoading || !flightNumber.trim()}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 font-bold py-3 sm:py-4 px-6 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg text-sm sm:text-base"
            >
              {isLoading ? 'Getting Flight Data...' : 'Get Flight Details ✈️'}
            </button>
          </div>
        </div>

        {/* Flight Data Preview */}
        {flightData && (
          <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-green-500/20 bg-green-500/5 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <h2 className="text-xl font-semibold text-green-400">Flight Data Found!</h2>
            </div>

            <div className="space-y-4">
              {/* Route */}
              {flightData.route && (
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{flightData.route.from.iata}</div>
                    <div className="text-sm text-gray-400">{flightData.route.from.city}</div>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <div className="w-8 h-px bg-gray-400"></div>
                      <Plane className="h-4 w-4" />
                      <div className="w-8 h-px bg-gray-400"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{flightData.route.to.iata}</div>
                    <div className="text-sm text-gray-400">{flightData.route.to.city}</div>
                  </div>
                </div>
              )}

              {/* Flight Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {flightData.airline && (
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-400">Airline</div>
                    <div className="font-semibold">{flightData.airline.name}</div>
                  </div>
                )}
                
                {flightData.aircraft && (
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-400">Aircraft</div>
                    <div className="font-semibold">{flightData.aircraft.manufacturer} {flightData.aircraft.model}</div>
                  </div>
                )}
                
                {flightData.route && (
                  <>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-400">Distance</div>
                      <div className="font-semibold">{flightData.route.distance} miles</div>
                    </div>
                    
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-400">Flight Time</div>
                      <div className="font-semibold">
                        {Math.floor(flightData.route.duration / 60)}h {flightData.route.duration % 60}m
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Stats Preview */}
              {flightData.stats && (
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <div className="text-sm text-orange-400 mb-2">You'll earn:</div>
                  <div className="flex items-center space-x-4">
                    <div className="text-lg font-bold text-orange-300">
                      +{flightData.stats.xpEarned} XP
                    </div>
                    <div className="text-gray-300">•</div>
                    <div className="text-lg font-bold text-orange-300">
                      {flightData.stats.milesFlown} miles
                    </div>
                    {flightData.stats.newAchievements?.length > 0 && (
                      <>
                        <div className="text-gray-300">•</div>
                        <div className="text-sm text-yellow-400">
                          🏆 {flightData.stats.newAchievements.length} new achievement{flightData.stats.newAchievements.length > 1 ? 's' : ''}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSaveFlight}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 px-6 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {isLoading ? 'Saving Flight...' : '🚀 Save Flight to My Profile'}
              </button>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg">
          <h3 className="font-semibold mb-2">How it works:</h3>
          <ul className="space-y-1 text-sm text-gray-400">
            <li>• Enter any flight number (e.g., QP1457, AA123, EK456)</li>
            <li>• We automatically get aircraft, route, airline, and timing data</li>
            <li>• Your stats, XP, and achievements are calculated instantly</li>
            <li>• One click to save to your flying profile</li>
          </ul>
        </div>
      </div>
    </div>
  );
}