'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { StatsComparison } from '@/components/stats-comparison';
import { UserStats } from '@/lib/achievements';
import { 
  Trophy, 
  Target, 
  Map, 
  Plane, 
  Clock, 
  Star,
  TrendingUp,
  Award,
  Globe,
  Zap
} from 'lucide-react';

export default function DashboardPage() {
  const [user] = useAuthState(auth);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchUserStats = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        if (userData?.gameStats) {
          setUserStats(userData.gameStats);
        } else {
          // Initialize default stats
          const defaultStats: UserStats = {
            totalFlights: 0,
            totalMiles: 0,
            totalHours: 0,
            totalXP: 0,
            level: 1,
            countriesVisited: [],
            continentsVisited: [],
            citiesVisited: [],
            airportsVisited: [],
            aircraftTypes: [],
            manufacturers: [],
            engineTypes: [],
            cabinClasses: [],
            airlinesFlown: [],
            favoriteAirline: '',
            loyaltyStatus: {},
            shortHaulFlights: 0,
            mediumHaulFlights: 0,
            longHaulFlights: 0,
            domesticFlights: 0,
            internationalFlights: 0,
            averageFlightTime: 0,
            longestFlight: 0,
            shortestFlight: 0,
            friendsCount: 0,
            globalRank: 0,
            friendsRank: 0,
          };
          setUserStats(defaultStats);
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your aviation stats...</p>
        </div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Plane className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No flights logged yet</h2>
          <p className="text-gray-400 mb-4">Start your aviation journey by logging your first flight!</p>
          <a href="/flights/new" className="btn-primary">
            Log Your First Flight
          </a>
        </div>
      </div>
    );
  }

  const nextLevelXP = Math.pow(userStats.level, 2) * 100;
  const currentLevelXP = Math.pow(userStats.level - 1, 2) * 100;
  const progressXP = userStats.totalXP - currentLevelXP;
  const neededXP = nextLevelXP - currentLevelXP;
  const progressPercentage = (progressXP / neededXP) * 100;

  // Mock friends data for demo
  const mockFriends = [
    {
      id: 'friend1',
      name: 'Sarah Chen',
      avatar: '👩‍✈️',
      stats: {
        ...userStats,
        totalFlights: userStats.totalFlights + 12,
        totalXP: userStats.totalXP + 2500,
        totalMiles: userStats.totalMiles + 8000,
        countriesVisited: [...userStats.countriesVisited, 'Japan', 'Thailand'],
        level: userStats.level + 2
      }
    },
    {
      id: 'friend2', 
      name: 'Mike Rodriguez',
      avatar: '👨‍💼',
      stats: {
        ...userStats,
        totalFlights: userStats.totalFlights - 5,
        totalXP: userStats.totalXP - 800,
        totalMiles: userStats.totalMiles - 2000,
        level: Math.max(1, userStats.level - 1)
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Aviation Dashboard</h1>
          <p className="text-gray-400">Your complete flight tracking and achievement center</p>
        </div>

        {/* Level & XP Overview */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-3 rounded-full">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Level {userStats.level}</h2>
                <p className="text-gray-400">Aviation Enthusiast</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-400">{userStats.totalXP.toLocaleString()} XP</div>
              <div className="text-sm text-gray-400">{neededXP - progressXP} XP to next level</div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Level Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-teal-400 mb-2">
              <Plane className="h-6 w-6 mx-auto" />
            </div>
            <div className="text-2xl font-bold text-white">{userStats.totalFlights}</div>
            <div className="text-sm text-gray-400">Total Flights</div>
          </div>
          
          <div className="card text-center">
            <div className="text-blue-400 mb-2">
              <Target className="h-6 w-6 mx-auto" />
            </div>
            <div className="text-2xl font-bold text-white">{Math.round(userStats.totalMiles).toLocaleString()}</div>
            <div className="text-sm text-gray-400">Miles Flown</div>
          </div>
          
          <div className="card text-center">
            <div className="text-green-400 mb-2">
              <Globe className="h-6 w-6 mx-auto" />
            </div>
            <div className="text-2xl font-bold text-white">{userStats.countriesVisited.length}</div>
            <div className="text-sm text-gray-400">Countries</div>
          </div>
          
          <div className="card text-center">
            <div className="text-purple-400 mb-2">
              <Map className="h-6 w-6 mx-auto" />
            </div>
            <div className="text-2xl font-bold text-white">{userStats.airportsVisited.length}</div>
            <div className="text-sm text-gray-400">Airports</div>
          </div>
        </div>

        {/* Collection Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold">Geographic Progress</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Continents</span>
                  <span>{userStats.continentsVisited.length}/7</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full"
                    style={{ width: `${(userStats.continentsVisited.length / 7) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Countries</span>
                  <span>{userStats.countriesVisited.length}/195</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full"
                    style={{ width: `${Math.min((userStats.countriesVisited.length / 195) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <Plane className="h-5 w-5 text-teal-400" />
              <h3 className="font-semibold">Aircraft Collection</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Aircraft Types</span>
                  <span>{userStats.aircraftTypes.length}/200</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-teal-400 h-2 rounded-full"
                    style={{ width: `${Math.min((userStats.aircraftTypes.length / 200) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Airlines</span>
                  <span>{userStats.airlinesFlown.length}/500</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-teal-400 h-2 rounded-full"
                    style={{ width: `${Math.min((userStats.airlinesFlown.length / 500) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <h3 className="font-semibold">Flight Patterns</h3>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Short Haul:</span>
                <span className="text-white">{userStats.shortHaulFlights}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Medium Haul:</span>
                <span className="text-white">{userStats.mediumHaulFlights}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Long Haul:</span>
                <span className="text-white">{userStats.longHaulFlights}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Domestic:</span>
                <span className="text-white">{userStats.domesticFlights}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">International:</span>
                <span className="text-white">{userStats.internationalFlights}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Friends Comparison */}
        <StatsComparison 
          userStats={userStats} 
          friendsStats={mockFriends}
        />
      </div>
    </div>
  );
}

function Crown({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l3.5 7L12 8l3.5 2L19 3v18H5V3z" />
    </svg>
  );
}
