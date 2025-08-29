'use client';

import { useState } from 'react';
import { Trophy, Medal, Crown, Plane, MapPin, Clock, Star } from 'lucide-react';
import Image from 'next/image';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  profilePicture?: string;
  value: number;
  change?: number; // +1, -1, 0 for rank change
  badges: string[];
  level: number;
}

export default function LeaderboardsPage() {
  const [activeTab, setActiveTab] = useState<'flights' | 'miles' | 'countries' | 'hours'>('flights');

  // Mock leaderboard data
  const leaderboards = {
    flights: [
      { rank: 1, userId: '1', username: 'aviation_pro', value: 247, change: 0, badges: ['Globe Trotter', 'Sky Master'], level: 12 },
      { rank: 2, userId: '2', username: 'pilot_sarah', value: 189, change: 1, badges: ['Frequent Flyer'], level: 9 },
      { rank: 3, userId: '3', username: 'world_explorer', value: 156, change: -1, badges: ['Country Collector'], level: 8 },
      { rank: 4, userId: '4', username: 'sky_wanderer', value: 134, change: 0, badges: ['Airport Hunter'], level: 7 },
      { rank: 5, userId: '5', username: 'flight_master', value: 127, change: 2, badges: ['Route Expert'], level: 7 },
      { rank: 6, userId: '6', username: 'jet_setter', value: 98, change: -1, badges: ['Business Class'], level: 6 },
      { rank: 7, userId: '7', username: 'cabin_crew_mike', value: 87, change: 0, badges: ['First Flight'], level: 5 },
      { rank: 8, userId: '8', username: 'travel_bug', value: 76, change: 1, badges: ['Weekend Warrior'], level: 5 },
    ],
    miles: [
      { rank: 1, userId: '1', username: 'aviation_pro', value: 487239, change: 0, badges: ['Globe Trotter'], level: 12 },
      { rank: 2, userId: '3', username: 'world_explorer', value: 423156, change: 1, badges: ['Country Collector'], level: 8 },
      { rank: 3, userId: '2', username: 'pilot_sarah', value: 398745, change: -1, badges: ['Frequent Flyer'], level: 9 },
    ],
    countries: [
      { rank: 1, userId: '3', username: 'world_explorer', value: 47, change: 0, badges: ['Country Collector'], level: 8 },
      { rank: 2, userId: '1', username: 'aviation_pro', value: 43, change: 0, badges: ['Globe Trotter'], level: 12 },
      { rank: 3, userId: '6', username: 'jet_setter', value: 28, change: 1, badges: ['Business Class'], level: 6 },
    ],
    hours: [
      { rank: 1, userId: '1', username: 'aviation_pro', value: 1247, change: 0, badges: ['Sky Master'], level: 12 },
      { rank: 2, userId: '2', username: 'pilot_sarah', value: 987, change: 0, badges: ['Frequent Flyer'], level: 9 },
      { rank: 3, userId: '4', username: 'sky_wanderer', value: 856, change: 1, badges: ['Airport Hunter'], level: 7 },
    ]
  };

  const currentLeaderboard = leaderboards[activeTab];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getChangeIcon = (change?: number) => {
    if (!change) return null;
    if (change > 0) return <span className="text-green-400 text-xs">↗ +{change}</span>;
    if (change < 0) return <span className="text-red-400 text-xs">↘ {change}</span>;
    return null;
  };

  const getValueLabel = (tab: string) => {
    switch (tab) {
      case 'flights':
        return 'flights';
      case 'miles':
        return 'miles';
      case 'countries':
        return 'countries';
      case 'hours':
        return 'hours';
      default:
        return '';
    }
  };

  const formatValue = (value: number, tab: string) => {
    if (tab === 'miles') {
      return value.toLocaleString();
    }
    return value.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Leaderboards</h1>
          <p className="text-xl text-gray-300">See how you rank among aviation enthusiasts</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-8">
          <nav className="flex justify-center space-x-8">
            {[
              { id: 'flights', label: 'Total Flights', icon: Plane },
              { id: 'miles', label: 'Miles Flown', icon: MapPin },
              { id: 'countries', label: 'Countries Visited', icon: Star },
              { id: 'hours', label: 'Flight Hours', icon: Clock },
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

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
          {currentLeaderboard.slice(0, 3).map((entry, index) => {
            const positions = [1, 0, 2]; // Second, First, Third
            const actualIndex = positions[index];
            const actualEntry = currentLeaderboard[actualIndex];
            
            return (
              <div 
                key={actualEntry.userId} 
                className={`text-center ${index === 1 ? 'order-1' : index === 0 ? 'order-2' : 'order-3'}`}
              >
                <div className={`card ${index === 1 ? 'bg-gradient-to-b from-yellow-900/30 to-gray-800/50 border-yellow-500/30' : ''}`}>
                  <div className="mb-4">
                    {getRankIcon(actualEntry.rank)}
                  </div>
                  
                  {actualEntry.profilePicture ? (
                    <Image
                      src={actualEntry.profilePicture}
                      alt={actualEntry.username}
                      width={64}
                      height={64}
                      className="rounded-full object-cover mx-auto mb-3"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white text-xl font-semibold">
                        {actualEntry.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  <h3 className="text-white font-semibold mb-1">@{actualEntry.username}</h3>
                  <div className="text-2xl font-bold text-orange-400 mb-1">
                    {formatValue(actualEntry.value, activeTab)}
                  </div>
                  <div className="text-sm text-gray-400">{getValueLabel(activeTab)}</div>
                  
                  <div className="mt-3 flex items-center justify-center space-x-2">
                    <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs">
                      Level {actualEntry.level}
                    </span>
                    {getChangeIcon(actualEntry.change)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Full Leaderboard */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Full Rankings</h2>
          
          <div className="space-y-3">
            {currentLeaderboard.map((entry) => (
              <div 
                key={entry.userId} 
                className={`flex items-center justify-between p-4 rounded-lg transition-colors hover:bg-gray-700/30 ${
                  entry.rank <= 3 ? 'bg-gray-700/20' : 'bg-gray-800/20'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  {entry.profilePicture ? (
                    <Image
                      src={entry.profilePicture}
                      alt={entry.username}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {entry.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  <div>
                    <div className="text-white font-semibold">@{entry.username}</div>
                    <div className="text-sm text-gray-400">Level {entry.level}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-xl font-bold text-orange-400">
                      {formatValue(entry.value, activeTab)}
                    </div>
                    <div className="text-sm text-gray-400">{getValueLabel(activeTab)}</div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getChangeIcon(entry.change)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Your Rank */}
        <div className="mt-8 card bg-gradient-to-r from-orange-900/20 to-gray-800/50 border-orange-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Trophy className="h-8 w-8 text-orange-500" />
              <div>
                <h3 className="text-white font-semibold">Your Current Rank</h3>
                <p className="text-gray-400">Keep flying to climb the leaderboard!</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-400">#42</div>
              <div className="text-sm text-gray-400">12 {getValueLabel(activeTab)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
