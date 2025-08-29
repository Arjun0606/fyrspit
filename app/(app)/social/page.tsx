'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Search, Users, UserPlus, UserCheck, MapPin, Trophy, Plane } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  profilePictureUrl?: string;
  level: number;
  totalFlights: number;
  totalMiles: number;
  homeAirport?: string;
}

export default function SocialPage() {
  const [user] = useAuthState(auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'discover' | 'friends'>('discover');

  useEffect(() => {
    if (user) {
      loadFriends();
    }
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/social/friends', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/social/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (targetUserId: string, username: string) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/social/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'send_request',
          targetUserId
        })
      });

      if (response.ok) {
        toast.success(`Friend request sent to @${username}`);
      } else {
        toast.error('Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Aviation Social</h1>
          <p className="text-gray-400 text-sm sm:text-base">Connect with fellow aviation enthusiasts</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-6 sm:mb-8">
          <nav className="flex space-x-4 sm:space-x-8">
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex items-center space-x-2 py-3 sm:py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'discover'
                  ? 'border-orange-500 text-orange-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Discover</span>
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex items-center space-x-2 py-3 sm:py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'friends'
                  ? 'border-orange-500 text-orange-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Friends ({friends.length})</span>
            </button>
          </nav>
        </div>

        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by username..."
                className="w-full pl-12 pr-4 py-3 sm:py-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Search Results */}
            <div className="space-y-4">
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                </div>
              )}

              {!loading && searchQuery && searchResults.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No users found for "{searchQuery}"
                </div>
              )}

              {searchResults.map((foundUser) => (
                <div key={foundUser.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 sm:p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                      {foundUser.profilePictureUrl ? (
                        <Image
                          src={foundUser.profilePictureUrl}
                          alt={foundUser.username}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg font-semibold">
                            {foundUser.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/profile/${foundUser.username}`}
                          className="text-lg font-semibold text-white hover:text-orange-400 transition-colors truncate block"
                        >
                          @{foundUser.username}
                        </Link>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                          <div className="flex items-center space-x-1">
                            <Trophy className="h-3 w-3" />
                            <span>Level {foundUser.level}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Plane className="h-3 w-3" />
                            <span>{foundUser.totalFlights} flights</span>
                          </div>
                          {foundUser.homeAirport && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{foundUser.homeAirport}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => sendFriendRequest(foundUser.id, foundUser.username)}
                      className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span className="hidden sm:inline">Add Friend</span>
                    </button>
                  </div>
                </div>
              ))}

              {!searchQuery && (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">Discover Aviation Enthusiasts</h3>
                  <p className="text-gray-400">Search for users to connect with fellow pilots and travelers</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="space-y-4">
            {friends.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Friends Yet</h3>
                <p className="text-gray-400 mb-6">Start connecting with other aviation enthusiasts</p>
                <button 
                  onClick={() => setActiveTab('discover')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Discover Users
                </button>
              </div>
            ) : (
              friends.map((friend) => (
                <div key={friend.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 sm:p-6 shadow-lg">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    {friend.profilePictureUrl ? (
                      <Image
                        src={friend.profilePictureUrl}
                        alt={friend.username}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-semibold">
                          {friend.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <Link 
                        href={`/profile/${friend.username}`}
                        className="text-lg font-semibold text-white hover:text-orange-400 transition-colors"
                      >
                        @{friend.username}
                      </Link>
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                        <div className="flex items-center space-x-1">
                          <Trophy className="h-3 w-3" />
                          <span>Level {friend.level}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Plane className="h-3 w-3" />
                          <span>{friend.totalFlights} flights</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>{friend.totalMiles.toLocaleString()} miles</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-green-400">
                      <UserCheck className="h-5 w-5" />
                      <span className="hidden sm:inline text-sm">Friends</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
