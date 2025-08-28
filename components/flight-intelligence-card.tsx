'use client';

import { useState } from 'react';
import { ComprehensiveFlightData } from '@/lib/flight-intelligence';
import { 
  Plane, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Award,
  Globe,
  Zap,
  Heart,
  MessageSquare,
  Share2,
  Camera,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
  Navigation,
  Fuel,
  Settings,
  Trophy,
  Target,
  Eye
} from 'lucide-react';

interface FlightIntelligenceCardProps {
  flightData: ComprehensiveFlightData;
  userRating?: number;
  userReview?: string;
  onRate?: (rating: number) => void;
  onReview?: (review: string) => void;
  onShare?: () => void;
}

export function FlightIntelligenceCard({ 
  flightData, 
  userRating, 
  userReview,
  onRate,
  onReview,
  onShare 
}: FlightIntelligenceCardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'aircraft' | 'social' | 'tips'>('overview');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(userRating || 0);
  const [newReview, setNewReview] = useState(userReview || '');

  const handleSubmitReview = () => {
    onRate?.(newRating);
    onReview?.(newReview);
    setShowReviewForm(false);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'airborne': return 'text-green-400';
      case 'landed': return 'text-blue-400';
      case 'delayed': return 'text-yellow-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'airborne': return '✈️';
      case 'landed': return '🛬';
      case 'delayed': return '⏱️';
      case 'cancelled': return '❌';
      default: return '📅';
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{flightData.flightNumber}</h1>
            <p className="text-teal-100">{flightData.airline.name}</p>
          </div>
          
          <div className="text-right">
            {flightData.realtime?.status && (
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{getStatusIcon(flightData.realtime.status)}</span>
                <span className="capitalize font-medium">{flightData.realtime.status}</span>
              </div>
            )}
            <div className="text-sm text-teal-100">
              Airline Rating: ⭐ {flightData.airline.reputation.toFixed(1)}/10
            </div>
          </div>
        </div>
        
        {/* Route */}
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-2xl font-bold">{flightData.route.from.iata}</div>
            <div className="text-sm text-teal-100">{flightData.route.from.city}</div>
          </div>
          
          <div className="flex-1 mx-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <div className="h-px bg-teal-300 flex-1"></div>
              <Plane className="h-5 w-5 text-teal-300" />
              <div className="h-px bg-teal-300 flex-1"></div>
            </div>
            <div className="text-sm text-teal-100">
              {flightData.route.distance} miles • {formatDuration(flightData.route.duration)}
            </div>
            {flightData.route.isDomestic ? (
              <span className="text-xs bg-teal-500 px-2 py-1 rounded">Domestic</span>
            ) : (
              <span className="text-xs bg-blue-500 px-2 py-1 rounded">International</span>
            )}
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold">{flightData.route.to.iata}</div>
            <div className="text-sm text-teal-100">{flightData.route.to.city}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: <Info className="h-4 w-4" /> },
            { id: 'aircraft', label: 'Aircraft', icon: <Plane className="h-4 w-4" /> },
            { id: 'social', label: 'Social', icon: <Users className="h-4 w-4" /> },
            { id: 'tips', label: 'Tips & Insights', icon: <Star className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-teal-500 text-teal-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-teal-400">{flightData.aircraft.capacity.total}</div>
                <div className="text-sm text-gray-400">Passengers</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-400">{flightData.aircraft.performance.cruiseSpeed}</div>
                <div className="text-sm text-gray-400">Cruise Speed (kts)</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400">{flightData.route.from.elevation}ft</div>
                <div className="text-sm text-gray-400">Departure Elevation</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-400">{flightData.route.timeZoneDiff}h</div>
                <div className="text-sm text-gray-400">Time Difference</div>
              </div>
            </div>

            {/* Real-time Position */}
            {flightData.realtime?.position && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-3 flex items-center">
                  <Navigation className="h-5 w-5 text-teal-400 mr-2" />
                  Live Position
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Altitude:</span>
                    <span className="text-white ml-2">{flightData.realtime.position.altitude?.toLocaleString()}ft</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Speed:</span>
                    <span className="text-white ml-2">{flightData.realtime.speed}kts</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Heading:</span>
                    <span className="text-white ml-2">{flightData.realtime.heading}°</span>
                  </div>
                </div>
              </div>
            )}

            {/* Historical Performance */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-white mb-3 flex items-center">
                <TrendingUp className="h-5 w-5 text-teal-400 mr-2" />
                Performance History
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">On-time Rate:</span>
                  <span className="text-green-400 ml-2 font-medium">{flightData.historical.onTimePerformance.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-gray-400">Avg Delay:</span>
                  <span className="text-yellow-400 ml-2 font-medium">{flightData.historical.averageDelay.toFixed(0)} min</span>
                </div>
                <div>
                  <span className="text-gray-400">Cancellation Rate:</span>
                  <span className="text-red-400 ml-2 font-medium">{flightData.historical.cancellationRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'aircraft' && (
          <div className="space-y-6">
            {/* Aircraft Overview */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-white mb-3">{flightData.aircraft.type}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Manufacturer:</span>
                  <span className="text-white ml-2">{flightData.aircraft.manufacturer}</span>
                </div>
                <div>
                  <span className="text-gray-400">Registration:</span>
                  <span className="text-white ml-2">{flightData.aircraft.registration || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Engines:</span>
                  <span className="text-white ml-2">{flightData.aircraft.engines.count}x {flightData.aircraft.engines.type}</span>
                </div>
                <div>
                  <span className="text-gray-400">Max Range:</span>
                  <span className="text-white ml-2">{flightData.aircraft.performance.range.toLocaleString()} miles</span>
                </div>
              </div>
            </div>

            {/* Seating Configuration */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-white mb-3">Seating Configuration</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Economy</span>
                  <span className="text-white">{flightData.aircraft.capacity.economy} seats</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Business</span>
                  <span className="text-white">{flightData.aircraft.capacity.business} seats</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">First Class</span>
                  <span className="text-white">{flightData.aircraft.capacity.first} seats</span>
                </div>
              </div>
            </div>

            {/* Best/Worst Seats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-900/30 border border-green-700 p-4 rounded-lg">
                <h4 className="font-medium text-green-400 mb-2">Best Seats</h4>
                <div className="space-y-1">
                  {flightData.experience.bestSeats.map((seat, index) => (
                    <div key={index} className="text-sm text-green-300">{seat}</div>
                  ))}
                </div>
              </div>
              
              <div className="bg-red-900/30 border border-red-700 p-4 rounded-lg">
                <h4 className="font-medium text-red-400 mb-2">Avoid These Seats</h4>
                <div className="space-y-1">
                  {flightData.experience.worstSeats.map((seat, index) => (
                    <div key={index} className="text-sm text-red-300">{seat}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Aircraft Features */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-white mb-3">Features & Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {flightData.aircraft.interiorFeatures.map((feature, index) => (
                  <span key={index} className="bg-teal-600 text-white text-xs px-2 py-1 rounded">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-6">
            {/* Your Review */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">Your Experience</h3>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="btn-secondary text-sm"
                >
                  {userRating ? 'Edit Review' : 'Add Review'}
                </button>
              </div>
              
              {showReviewForm ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Rating</label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setNewRating(star)}
                          className={`text-2xl ${star <= newRating ? 'text-yellow-400' : 'text-gray-600'}`}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Review</label>
                    <textarea
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      className="w-full bg-gray-700 text-white p-3 rounded-lg resize-none h-24"
                      placeholder="Share your experience with this flight..."
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <button onClick={handleSubmitReview} className="btn-primary text-sm">
                      Save Review
                    </button>
                    <button onClick={() => setShowReviewForm(false)} className="btn-secondary text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : userRating ? (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`text-lg ${star <= userRating ? 'text-yellow-400' : 'text-gray-600'}`}>
                          ⭐
                        </span>
                      ))}
                    </div>
                    <span className="text-white font-medium">{userRating}/5</span>
                  </div>
                  {userReview && (
                    <p className="text-gray-300 text-sm">{userReview}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Share your experience with this flight to help other travelers!</p>
              )}
            </div>

            {/* Global Stats */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-white mb-3">Community Stats</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-teal-400">{flightData.social.globalStats.totalFlights.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Total Flights</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{flightData.social.globalStats.averageRating.toFixed(1)}</div>
                  <div className="text-sm text-gray-400">Avg Rating</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">#{flightData.social.globalStats.popularityRank}</div>
                  <div className="text-sm text-gray-400">Popularity</div>
                </div>
              </div>
            </div>

            {/* Service Ratings */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold text-white mb-3">Service Ratings</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Food & Beverage</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-teal-400 h-2 rounded-full"
                        style={{ width: `${(flightData.experience.foodRating / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-white text-sm">{flightData.experience.foodRating.toFixed(1)}/10</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Service</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-400 h-2 rounded-full"
                        style={{ width: `${(flightData.experience.serviceRating / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-white text-sm">{flightData.experience.serviceRating.toFixed(1)}/10</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Entertainment</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-400 h-2 rounded-full"
                        style={{ width: `${(flightData.experience.entertainmentRating / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-white text-sm">{flightData.experience.entertainmentRating.toFixed(1)}/10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="space-y-6">
            {/* Insights */}
            <div className="bg-blue-900/30 border border-blue-700 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-400 mb-3 flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Flight Insights
              </h3>
              <div className="space-y-2">
                {flightData.social.insights.map((insight, index) => (
                  <div key={index} className="text-sm text-blue-300">{insight}</div>
                ))}
              </div>
            </div>

            {/* Highlights */}
            <div className="bg-green-900/30 border border-green-700 p-4 rounded-lg">
              <h3 className="font-semibold text-green-400 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Flight Highlights
              </h3>
              <div className="space-y-2">
                {flightData.experience.highlights.map((highlight, index) => (
                  <div key={index} className="text-sm text-green-300">{highlight}</div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-yellow-900/30 border border-yellow-700 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-400 mb-3 flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Pro Tips
              </h3>
              <div className="space-y-2">
                {flightData.experience.tips.map((tip, index) => (
                  <div key={index} className="text-sm text-yellow-300">{tip}</div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            {flightData.experience.warnings.length > 0 && (
              <div className="bg-red-900/30 border border-red-700 p-4 rounded-lg">
                <h3 className="font-semibold text-red-400 mb-3 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Important Notices
                </h3>
                <div className="space-y-2">
                  {flightData.experience.warnings.map((warning, index) => (
                    <div key={index} className="text-sm text-red-300">{warning}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex space-x-3">
          <button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg text-sm font-medium">
            Log This Flight
          </button>
          <button 
            onClick={onShare}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
          <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm">
            <Heart className="h-4 w-4" />
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}
