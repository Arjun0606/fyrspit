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

  // No dummy data: show empty state until real leaderboards are implemented
  const leaderboards = {
    flights: [] as LeaderboardEntry[],
    miles: [] as LeaderboardEntry[],
    countries: [] as LeaderboardEntry[],
    hours: [] as LeaderboardEntry[],
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
          <nav className="tabs-scroll flex justify-center space-x-8">
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
          
          {currentLeaderboard.length === 0 ? (
            <div className="text-gray-400">No rankings yet. Log real flights to appear here.</div>
          ) : (
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
          )}
        </div>

        {/* No fake 'Your Rank' until we have real data */}
        {currentLeaderboard.length === 0 && (
          <div className="mt-8 card">
            <div className="flex items-center space-x-4">
              <Trophy className="h-6 w-6 text-orange-500" />
              <p className="text-gray-300">Log flights to enter the leaderboard.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
