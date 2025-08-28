'use client';

import { useState } from 'react';
import { 
  Search, 
  Users, 
  Trophy, 
  Map, 
  Plane, 
  Star,
  TrendingUp,
  Target,
  Clock,
  MapPin,
  Award,
  Zap,
  Globe,
  Camera,
  Heart,
  MessageSquare,
  UserPlus,
  Crown,
  Medal,
  Flame
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  level: number;
  totalXP: number;
  stats: {
    totalFlights: number;
    totalMiles: number;
    totalHours: number;
    countries: number;
    airports: number;
    aircraft: number;
    airlines: number;
  };
  badges: string[];
  recentFlight?: {
    flightNumber: string;
    route: string;
    date: string;
    aircraft: string;
    rating: number;
  };
  isFollowing: boolean;
  mutualFriends: number;
}

// Mock data for demonstration
const mockUsers: UserProfile[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    username: '@sarahflies',
    avatar: '👩‍✈️',
    level: 12,
    totalXP: 14500,
    stats: {
      totalFlights: 89,
      totalMiles: 234567,
      totalHours: 567,
      countries: 34,
      airports: 78,
      aircraft: 23,
      airlines: 18
    },
    badges: ['Globe Trotter', 'Boeing Master', 'Million Miler'],
    recentFlight: {
      flightNumber: 'SQ123',
      route: 'SIN → LHR',
      date: '2 days ago',
      aircraft: 'A350-900',
      rating: 5
    },
    isFollowing: false,
    mutualFriends: 3
  },
  {
    id: '2',
    name: 'Mike Rodriguez',
    username: '@mikeintheskyy',
    avatar: '👨‍💼',
    level: 8,
    totalXP: 6800,
    stats: {
      totalFlights: 34,
      totalMiles: 89234,
      totalHours: 156,
      countries: 12,
      airports: 28,
      aircraft: 15,
      airlines: 8
    },
    badges: ['Domestic King', 'Weekend Warrior'],
    recentFlight: {
      flightNumber: 'AA123',
      route: 'JFK → LAX',
      date: '1 week ago',
      aircraft: 'Boeing 777',
      rating: 4
    },
    isFollowing: true,
    mutualFriends: 7
  },
  {
    id: '3',
    name: 'Alex Kim',
    username: '@alexaviation',
    avatar: '🧑‍🚀',
    level: 15,
    totalXP: 22300,
    stats: {
      totalFlights: 156,
      totalMiles: 456789,
      totalHours: 890,
      countries: 67,
      airports: 134,
      aircraft: 45,
      airlines: 32
    },
    badges: ['Aviation Legend', 'Continent Collector', 'Aircraft Guru'],
    recentFlight: {
      flightNumber: 'EK456',
      route: 'DXB → JFK',
      date: '3 days ago',
      aircraft: 'A380-800',
      rating: 5
    },
    isFollowing: false,
    mutualFriends: 1
  }
];

const globalLeaderboards = [
  { rank: 1, name: 'Alex Kim', value: '456,789 miles', badge: '🏆' },
  { rank: 2, name: 'Emma Johnson', value: '389,456 miles', badge: '🥈' },
  { rank: 3, name: 'Sarah Chen', value: '234,567 miles', badge: '🥉' },
  { rank: 4, name: 'You', value: '125,847 miles', badge: '4️⃣' },
  { rank: 5, name: 'Mike Rodriguez', value: '89,234 miles', badge: '5️⃣' },
];

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<'discover' | 'leaderboards' | 'challenges'>('discover');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFollow = (userId: string) => {
    // Handle follow/unfollow logic
    console.log('Toggle follow for user:', userId);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Discover</h1>
          <p className="text-gray-400">Find aviation enthusiasts, compete on leaderboards, and join challenges</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-900 rounded-lg p-1 flex space-x-1">
            {[
              { id: 'discover', label: 'Discover People', icon: <Users className="h-4 w-4" /> },
              { id: 'leaderboards', label: 'Leaderboards', icon: <Trophy className="h-4 w-4" /> },
              { id: 'challenges', label: 'Challenges', icon: <Target className="h-4 w-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pilots..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* User Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                  {/* Profile Header */}
                  <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-4xl">{user.avatar}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{user.name}</h3>
                        <p className="text-teal-100 text-sm">{user.username}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Crown className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm text-white">Level {user.level}</span>
                          <span className="text-xs text-teal-100">{user.totalXP.toLocaleString()} XP</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-teal-400">{user.stats.totalFlights}</div>
                        <div className="text-xs text-gray-400">Flights</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-400">{Math.round(user.stats.totalMiles / 1000)}K</div>
                        <div className="text-xs text-gray-400">Miles</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-400">{user.stats.countries}</div>
                        <div className="text-xs text-gray-400">Countries</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-400">{user.stats.airports}</div>
                        <div className="text-xs text-gray-400">Airports</div>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Badges</h4>
                      <div className="flex flex-wrap gap-1">
                        {user.badges.map((badge, index) => (
                          <span key={index} className="bg-teal-600 text-white text-xs px-2 py-1 rounded">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recent Flight */}
                    {user.recentFlight && (
                      <div className="bg-gray-800 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">{user.recentFlight.flightNumber}</span>
                          <span className="text-xs text-gray-400">{user.recentFlight.date}</span>
                        </div>
                        <div className="text-sm text-gray-300">{user.recentFlight.route}</div>
                        <div className="text-xs text-gray-400">{user.recentFlight.aircraft}</div>
                        <div className="flex items-center mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`h-3 w-3 ${star <= user.recentFlight!.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleFollow(user.id)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          user.isFollowing
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-teal-600 text-white hover:bg-teal-700'
                        }`}
                      >
                        {user.isFollowing ? 'Following' : 'Follow'}
                      </button>
                      <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    </div>

                    {user.mutualFriends > 0 && (
                      <p className="text-xs text-gray-400 mt-2 text-center">
                        {user.mutualFriends} mutual friends
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboards Tab */}
        {activeTab === 'leaderboards' && (
          <div className="space-y-6">
            {/* Category Selector */}
            <div className="flex justify-center">
              <div className="bg-gray-900 rounded-lg p-1 flex flex-wrap gap-1">
                {[
                  { id: 'miles', label: 'Total Miles', icon: '🎯' },
                  { id: 'flights', label: 'Total Flights', icon: '✈️' },
                  { id: 'countries', label: 'Countries', icon: '🌍' },
                  { id: 'airports', label: 'Airports', icon: '🛫' },
                  { id: 'level', label: 'Level', icon: '👑' },
                ].map((category) => (
                  <button
                    key={category.id}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium"
                  >
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Global Leaderboard */}
            <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Trophy className="h-6 w-6 mr-2" />
                  Global Miles Leaderboard
                </h2>
              </div>
              
              <div className="p-4">
                {globalLeaderboards.map((entry) => (
                  <div key={entry.rank} className={`flex items-center justify-between p-3 rounded-lg mb-2 ${
                    entry.name === 'You' ? 'bg-teal-600/20 border border-teal-500' : 'bg-gray-800'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{entry.badge}</span>
                      <div>
                        <div className={`font-medium ${entry.name === 'You' ? 'text-teal-400' : 'text-white'}`}>
                          {entry.name}
                        </div>
                        <div className="text-sm text-gray-400">Rank #{entry.rank}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-yellow-400">{entry.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Friends Leaderboard */}
            <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Users className="h-6 w-6 mr-2" />
                  Friends Leaderboard
                </h2>
              </div>
              
              <div className="p-4 text-center text-gray-400">
                Follow friends to see their rankings here!
              </div>
            </div>
          </div>
        )}

        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            {/* Active Challenges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Monthly Challenge */}
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">December Miles Challenge</h3>
                  <Flame className="h-8 w-8" />
                </div>
                <p className="text-purple-100 mb-4">Fly 5,000 miles this month</p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>2,847 / 5,000 miles</span>
                  </div>
                  <div className="w-full bg-purple-800 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: '57%' }}></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">15 days left</span>
                  <span className="bg-white text-purple-600 px-3 py-1 rounded-full text-sm font-bold">
                    +500 XP
                  </span>
                </div>
              </div>

              {/* Weekend Warrior */}
              <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Weekend Warrior</h3>
                  <Medal className="h-8 w-8" />
                </div>
                <p className="text-green-100 mb-4">Take 3 flights on weekends</p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>1 / 3 flights</span>
                  </div>
                  <div className="w-full bg-green-800 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: '33%' }}></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">This weekend</span>
                  <span className="bg-white text-green-600 px-3 py-1 rounded-full text-sm font-bold">
                    +300 XP
                  </span>
                </div>
              </div>

              {/* Aircraft Explorer */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Aircraft Explorer</h3>
                  <Plane className="h-8 w-8" />
                </div>
                <p className="text-blue-100 mb-4">Fly on 5 different aircraft types</p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>3 / 5 aircraft</span>
                  </div>
                  <div className="w-full bg-blue-800 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">A320, 737, 787</span>
                  <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-bold">
                    +400 XP
                  </span>
                </div>
              </div>

              {/* Globe Trotter */}
              <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Globe Trotter</h3>
                  <Globe className="h-8 w-8" />
                </div>
                <p className="text-yellow-100 mb-4">Visit 3 new countries</p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>0 / 3 countries</span>
                  </div>
                  <div className="w-full bg-yellow-800 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Start exploring!</span>
                  <span className="bg-white text-yellow-600 px-3 py-1 rounded-full text-sm font-bold">
                    +1000 XP
                  </span>
                </div>
              </div>
            </div>

            {/* Challenge Rules */}
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
              <h3 className="text-xl font-bold text-white mb-4">How Challenges Work</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <Target className="h-8 w-8 text-teal-400 mx-auto mb-2" />
                  <h4 className="font-medium text-white mb-1">Complete Goals</h4>
                  <p className="text-gray-400">Meet challenge requirements by logging flights</p>
                </div>
                <div className="text-center">
                  <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                  <h4 className="font-medium text-white mb-1">Earn Rewards</h4>
                  <p className="text-gray-400">Get XP, badges, and bragging rights</p>
                </div>
                <div className="text-center">
                  <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <h4 className="font-medium text-white mb-1">Compete with Friends</h4>
                  <p className="text-gray-400">See who completes challenges first</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
