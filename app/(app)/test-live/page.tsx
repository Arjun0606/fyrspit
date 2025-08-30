'use client';

import { useState } from 'react';
import { Plane, Clock, MapPin, AlertCircle } from 'lucide-react';

export default function TestLivePage() {
  const [flightNumber, setFlightNumber] = useState('');
  const [flightData, setFlightData] = useState<any>(null);
  const [flightDate, setFlightDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testFlight = async () => {
    if (!flightNumber.trim()) return;

    setLoading(true);
    setError('');
    setFlightData(null);

    try {
      const response = await fetch('/api/flights/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightNumber: flightNumber.toUpperCase(), date: flightDate })
      });

      const data = await response.json();

      if (response.ok) {
        setFlightData(data);
      } else {
        setError(data.error || 'Flight not found');
      }
    } catch (err) {
      setError('Failed to fetch flight data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">🕷️ Google Flight Scraper Test</h1>
          <p className="text-gray-400">Scraping flight data directly from Google search results</p>
          <p className="text-orange-400 text-sm mt-2">⚡ Just like AI agents do - scrapes the flight card from Google!</p>
          <p className="text-green-400 text-xs mt-1">Primary: Google Scraping | Fallback: Live APIs</p>
        </div>

        {/* Test Input */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Enter flight number (e.g., QR123, EK456, AA789)"
              className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && testFlight()}
            />
            <input
              type="date"
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={flightDate}
              onChange={(e) => setFlightDate(e.target.value)}
            />
            <button
              onClick={testFlight}
              disabled={loading || !flightNumber.trim()}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {loading ? 'Fetching...' : 'Test Live API'}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Scraping Google for flight data...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Flight Data */}
        {flightData && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{flightData.flightNumber}</h2>
                <div className="flex items-center space-x-2 text-green-400">
                  <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-sm font-medium">SCRAPED FROM GOOGLE</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Airline</p>
                  <p className="text-white font-medium">{flightData.airline?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Aircraft</p>
                  <p className="text-white font-medium">{flightData.aircraft?.type || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <p className="text-orange-400 font-medium">{flightData.status?.text || 'Unknown'}</p>
                </div>
              </div>
            </div>

            {/* Route */}
            {flightData.route && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Route Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Departure */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Departure</h4>
                    <div className="space-y-2">
                      <p className="text-white">{flightData.route.departure?.airport || 'Unknown Airport'}</p>
                      <p className="text-gray-400">{flightData.route.departure?.city}, {flightData.route.departure?.country}</p>
                      <p className="text-gray-400">IATA: {flightData.route.departure?.iata}</p>
                      {flightData.route.departure?.scheduled && (
                        <p className="text-orange-400">
                          <Clock className="h-4 w-4 inline mr-1" />
                          {new Date(flightData.route.departure.scheduled).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Arrival */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Arrival</h4>
                    <div className="space-y-2">
                      <p className="text-white">{flightData.route.arrival?.airport || 'Unknown Airport'}</p>
                      <p className="text-gray-400">{flightData.route.arrival?.city}, {flightData.route.arrival?.country}</p>
                      <p className="text-gray-400">IATA: {flightData.route.arrival?.iata}</p>
                      {flightData.route.arrival?.scheduled && (
                        <p className="text-orange-400">
                          <Clock className="h-4 w-4 inline mr-1" />
                          {new Date(flightData.route.arrival.scheduled).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Distance & Duration */}
                {(flightData.route.distance || flightData.route.duration) && (
                  <div className="mt-6 pt-6 border-t border-gray-600">
                    <div className="grid grid-cols-2 gap-4">
                      {flightData.route.distance && (
                        <div>
                          <p className="text-gray-400 text-sm">Distance</p>
                          <p className="text-white font-medium">{flightData.route.distance.toLocaleString()} miles</p>
                        </div>
                      )}
                      {flightData.route.duration && (
                        <div>
                          <p className="text-gray-400 text-sm">Duration</p>
                          <p className="text-white font-medium">{Math.floor(flightData.route.duration / 60)}h {flightData.route.duration % 60}m</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Live Tracking */}
            {flightData.tracking && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Plane className="h-5 w-5 mr-2" />
                  Live Tracking
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Altitude</p>
                    <p className="text-white font-medium">{flightData.tracking.altitude?.toLocaleString() || 'N/A'} ft</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Speed</p>
                    <p className="text-white font-medium">{flightData.tracking.speed?.toFixed(0) || 'N/A'} mph</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Latitude</p>
                    <p className="text-white font-medium">{flightData.tracking.latitude?.toFixed(4) || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Longitude</p>
                    <p className="text-white font-medium">{flightData.tracking.longitude?.toFixed(4) || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            {flightData.stats && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Gamification Stats</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">XP Earned</p>
                    <p className="text-orange-400 font-bold text-xl">{flightData.stats.xpEarned}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Achievements</p>
                    <p className="text-white font-medium">{flightData.stats.achievements?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Milestones</p>
                    <p className="text-white font-medium">{flightData.stats.milestones?.length || 0}</p>
                  </div>
                </div>

                {flightData.stats.achievements?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-gray-400 text-sm mb-2">Achievements Unlocked:</p>
                    <div className="space-y-2">
                      {flightData.stats.achievements.map((achievement: any, index: number) => (
                        <div key={index} className="bg-orange-900/20 border border-orange-700 rounded-lg p-3">
                          <p className="text-orange-400 font-medium">{achievement.name}</p>
                          <p className="text-gray-400 text-sm">{achievement.description}</p>
                          <p className="text-orange-300 text-xs">+{achievement.xp} XP</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Test Examples */}
        <div className="mt-8 bg-gray-800/30 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Try These Examples:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['QR123', 'EK456', 'AA789', 'BA101', '6E102', 'AI131', 'UA456', 'DL789'].map((example) => (
              <button
                key={example}
                onClick={() => setFlightNumber(example)}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded border border-gray-600 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
