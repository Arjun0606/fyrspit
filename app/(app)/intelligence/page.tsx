'use client';

import { useState } from 'react';
import { FlightIntelligenceCard } from '@/components/flight-intelligence-card';
import { ComprehensiveFlightData } from '@/lib/flight-intelligence';
import { 
  Search, 
  Zap, 
  Loader2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function FlightIntelligencePage() {
  const [flightNumber, setFlightNumber] = useState('');
  const [date, setDate] = useState('');
  const [flightData, setFlightData] = useState<ComprehensiveFlightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const popularFlights = [
    { number: 'QP1457', route: 'Mumbai → Bengaluru', airline: 'Akasa Air' },
    { number: 'AA123', route: 'New York → Los Angeles', airline: 'American Airlines' },
    { number: 'BA456', route: 'London → Paris', airline: 'British Airways' },
    { number: 'EK456', route: 'Dubai → New York', airline: 'Emirates' },
    { number: 'SQ123', route: 'Singapore → London', airline: 'Singapore Airlines' },
  ];

  const handleSearch = async () => {
    if (!flightNumber.trim()) return;
    
    setLoading(true);
    setError(null);
    setFlightData(null);
    
    try {
      const response = await fetch('/api/flights/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          flightNumber: flightNumber.trim(),
          date: date || undefined 
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setFlightData(result.data);
      } else {
        setError(result.message || 'Flight not found');
      }
    } catch (err) {
      setError('Failed to fetch flight data');
      console.error('Flight intelligence error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (flight: string) => {
    setFlightNumber(flight);
    setDate('2024-08-27');
    setTimeout(() => handleSearch(), 100);
  };

  const handleShare = () => {
    if (flightData) {
      navigator.clipboard.writeText(
        `Check out this amazing flight intel for ${flightData.flightNumber}: ${window.location.href}`
      );
      // You could show a toast notification here
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="h-8 w-8 text-teal-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
              Flight Intelligence
            </h1>
            <Sparkles className="h-8 w-8 text-blue-400" />
          </div>
          <p className="text-xl text-gray-400 mb-2">
            Enter any flight number and get <span className="text-teal-400 font-semibold">EVERYTHING</span>
          </p>
          <p className="text-gray-500">
            Aircraft details • Real-time data • Social insights • Pro tips • Historical performance
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Flight Number *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  placeholder="e.g. QP1457, AA123, BA456"
                />
                <Zap className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div className="md:w-48">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date (Optional)
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
            
            <div className="md:w-32 flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading || !flightNumber.trim()}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Quick Examples */}
          <div className="mt-6">
            <p className="text-sm text-gray-400 mb-3">Try these popular flights:</p>
            <div className="flex flex-wrap gap-2">
              {popularFlights.map((flight) => (
                <button
                  key={flight.number}
                  onClick={() => handleQuickSearch(flight.number)}
                  disabled={loading}
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-teal-500 text-sm px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <span className="font-medium text-teal-400">{flight.number}</span>
                  <span className="text-gray-400 ml-2">{flight.route}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-gray-900 rounded-lg border border-gray-700 p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-teal-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Analyzing Flight Data</h3>
            <p className="text-gray-400">
              Gathering intelligence from multiple sources...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-400 mb-2">Flight Not Found</h3>
            <p className="text-red-300 mb-4">{error}</p>
            <div className="text-sm text-red-200">
              <p className="mb-2">Try these suggestions:</p>
              <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
                <li>Double-check the flight number format</li>
                <li>Try a different date</li>
                <li>Use one of the popular examples above</li>
                <li>This might be a regional flight not in our database</li>
              </ul>
            </div>
          </div>
        )}

        {/* Flight Data */}
        {flightData && !loading && (
          <FlightIntelligenceCard
            flightData={flightData}
            onShare={handleShare}
          />
        )}

        {/* Features Overview */}
        {!flightData && !loading && !error && (
          <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              What You'll Get
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-teal-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">✈️</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Aircraft Details</h3>
                <p className="text-sm text-gray-400">
                  Complete aircraft specifications, seating charts, and performance data
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Performance Analytics</h3>
                <p className="text-sm text-gray-400">
                  On-time rates, delay statistics, and historical trends
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Social Insights</h3>
                <p className="text-sm text-gray-400">
                  Community reviews, ratings, and friend comparisons
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">💡</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Pro Tips</h3>
                <p className="text-sm text-gray-400">
                  Best seats, travel tips, and insider knowledge
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-yellow-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🌍</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Route Intelligence</h3>
                <p className="text-sm text-gray-400">
                  Airport details, weather patterns, and timezone information
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-red-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📡</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Real-time Data</h3>
                <p className="text-sm text-gray-400">
                  Live position tracking and flight status updates
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
