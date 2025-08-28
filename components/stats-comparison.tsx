'use client';

import { UserStats } from '@/lib/achievements';
import { 
  Trophy, 
  Plane, 
  MapPin, 
  Clock, 
  Target,
  Medal,
  Crown,
  Star,
  Globe,
  Zap
} from 'lucide-react';

interface StatsComparisonProps {
  userStats: UserStats;
  friendsStats: Array<{
    id: string;
    name: string;
    avatar?: string;
    stats: UserStats;
  }>;
}

export function StatsComparison({ userStats, friendsStats }: StatsComparisonProps) {
  const allUsers = [
    { id: 'user', name: 'You', stats: userStats },
    ...friendsStats
  ];

  // Leaderboard categories
  const categories = [
    {
      id: 'flights',
      name: 'Total Flights',
      icon: <Plane className="h-4 w-4" />,
      getValue: (stats: UserStats) => stats.totalFlights,
      suffix: ' flights'
    },
    {
      id: 'miles',
      name: 'Miles Flown',
      icon: <Target className="h-4 w-4" />,
      getValue: (stats: UserStats) => Math.round(stats.totalMiles),
      suffix: ' mi'
    },
    {
      id: 'countries',
      name: 'Countries',
      icon: <Globe className="h-4 w-4" />,
      getValue: (stats: UserStats) => stats.countriesVisited.length,
      suffix: ' countries'
    },
    {
      id: 'airports',
      name: 'Airports',
      icon: <MapPin className="h-4 w-4" />,
      getValue: (stats: UserStats) => stats.airportsVisited.length,
      suffix: ' airports'
    },
    {
      id: 'hours',
      name: 'Flight Time',
      icon: <Clock className="h-4 w-4" />,
      getValue: (stats: UserStats) => Math.round(stats.totalHours),
      suffix: ' hours'
    },
    {
      id: 'xp',
      name: 'XP Points',
      icon: <Star className="h-4 w-4" />,
      getValue: (stats: UserStats) => stats.totalXP,
      suffix: ' XP'
    }
  ];

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-500'; // Gold
      case 2: return 'text-gray-400';   // Silver
      case 3: return 'text-orange-400'; // Bronze
      default: return 'text-gray-300';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-4 w-4 text-yellow-500" />;
      case 2: return <Medal className="h-4 w-4 text-gray-400" />;
      case 3: return <Medal className="h-4 w-4 text-orange-400" />;
      default: return <span className="text-gray-400 font-bold">#{rank}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Leaderboard */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h2 className="text-lg font-semibold">Friends Leaderboard</h2>
        </div>
        
        {/* Overall XP Ranking */}
        <div className="space-y-2 mb-6">
          {allUsers
            .sort((a, b) => b.stats.totalXP - a.stats.totalXP)
            .map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  user.id === 'user'
                    ? 'border-teal-500 bg-teal-500/10'
                    : 'border-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {getRankIcon(index + 1)}
                  <span className={`font-medium ${user.id === 'user' ? 'text-teal-400' : 'text-white'}`}>
                    {user.name}
                  </span>
                  <span className="text-sm text-gray-400">
                    Level {Math.floor(Math.sqrt(user.stats.totalXP / 100)) + 1}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-yellow-500">{user.stats.totalXP} XP</div>
                  <div className="text-xs text-gray-400">{user.stats.totalFlights} flights</div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Category Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="card">
            <div className="flex items-center space-x-2 mb-3">
              {category.icon}
              <h3 className="font-semibold">{category.name}</h3>
            </div>
            
            <div className="space-y-2">
              {allUsers
                .sort((a, b) => category.getValue(b.stats) - category.getValue(a.stats))
                .slice(0, 5) // Top 5
                .map((user, index) => {
                  const value = category.getValue(user.stats);
                  const isUser = user.id === 'user';
                  
                  return (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-2 rounded ${
                        isUser ? 'bg-teal-500/10 border border-teal-500' : 'bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-bold ${getRankColor(index + 1)}`}>
                          #{index + 1}
                        </span>
                        <span className={`text-sm ${isUser ? 'text-teal-400 font-medium' : 'text-gray-300'}`}>
                          {user.name}
                        </span>
                      </div>
                      <span className={`text-sm font-bold ${isUser ? 'text-teal-400' : 'text-white'}`}>
                        {value.toLocaleString()}{category.suffix}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Achievements Comparison */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Medal className="h-5 w-5 text-purple-500" />
          <h2 className="text-lg font-semibold">Achievement Race</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {allUsers.slice(0, 3).map((user, index) => (
            <div
              key={user.id}
              className={`p-4 rounded-lg border ${
                user.id === 'user'
                  ? 'border-teal-500 bg-teal-500/10'
                  : 'border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`font-medium ${user.id === 'user' ? 'text-teal-400' : 'text-white'}`}>
                  {user.name}
                </span>
                {getRankIcon(index + 1)}
              </div>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Countries:</span>
                  <span className="text-white">{user.stats.countriesVisited.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Aircraft:</span>
                  <span className="text-white">{user.stats.aircraftTypes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Airlines:</span>
                  <span className="text-white">{user.stats.airlinesFlown.length}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Stats Highlights */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold">Your Aviation Profile</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-teal-400">{userStats.level}</div>
            <div className="text-sm text-gray-400">Level</div>
          </div>
          
          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{userStats.globalRank || 'N/A'}</div>
            <div className="text-sm text-gray-400">Global Rank</div>
          </div>
          
          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {Math.round((userStats.totalMiles / 40075) * 100)}%
            </div>
            <div className="text-sm text-gray-400">Around Earth</div>
          </div>
          
          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">
              {userStats.favoriteAirline || 'Mixed'}
            </div>
            <div className="text-sm text-gray-400">Fav Airline</div>
          </div>
        </div>
      </div>
    </div>
  );
}
