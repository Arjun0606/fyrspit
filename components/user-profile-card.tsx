'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User } from '@/types';
import { 
  MapPin, 
  Calendar, 
  Award, 
  Users, 
  Plane, 
  Globe, 
  Star,
  Trophy,
  UserPlus,
  MessageCircle
} from 'lucide-react';

interface UserProfileCardProps {
  user: User;
  currentUserId?: string;
  showActions?: boolean;
}

export function UserProfileCard({ user, currentUserId, showActions = true }: UserProfileCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    if (!currentUserId || currentUserId === user.id) return;
    
    setIsLoading(true);
    try {
      // Follow/unfollow logic here
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Follow error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const memberSince = new Date(user.joinedAt).getFullYear();
  const totalFlights = user.statsCache.lifetime.flights;
  const totalMiles = user.statsCache.lifetime.milesMi;
  const totalCountries = user.statsCache.lifetime.countries.length;
  const level = user.level;
  const xp = user.xp;

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="h-20 w-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            {/* Level badge */}
            <div className="absolute -bottom-2 -right-2 bg-gray-800 border-2 border-gray-600 rounded-full px-2 py-1">
              <span className="text-xs font-bold text-orange-400">L{level}</span>
            </div>
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              {user.roles?.verified && (
                <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">✓</span>
                </div>
              )}
            </div>
            
            <p className="text-gray-400 flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Member since {memberSince}</span>
            </p>
            
            {user.homeAirport && (
              <p className="text-gray-400 flex items-center space-x-2 mt-1">
                <MapPin className="h-4 w-4" />
                <span>Based at {user.homeAirport}</span>
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && currentUserId && currentUserId !== user.id && (
          <div className="flex space-x-2">
            <button
              onClick={handleFollow}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                isFollowing
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 hover:from-orange-600 hover:to-yellow-600'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              <span>{isFollowing ? 'Following' : 'Follow'}</span>
            </button>
            
            <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all">
              <MessageCircle className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <Plane className="h-6 w-6 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{totalFlights.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Flights</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <Globe className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{totalMiles.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Miles</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <MapPin className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{totalCountries}</div>
          <div className="text-sm text-gray-400">Countries</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{user.badges.length}</div>
          <div className="text-sm text-gray-400">Badges</div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Level {level} Progress</span>
          <span className="text-sm text-gray-400">{xp.toLocaleString()} XP</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-orange-500 to-yellow-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${(xp % 1000) / 10}%` }}
          ></div>
        </div>
      </div>

      {/* Social Stats */}
      <div className="flex justify-center space-x-8 mb-6">
        <Link href={`/profile/${user.id}/followers`} className="text-center hover:text-orange-400 transition-colors">
          <div className="text-xl font-bold text-white">{user.followerCount.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Followers</div>
        </Link>
        
        <Link href={`/profile/${user.id}/following`} className="text-center hover:text-orange-400 transition-colors">
          <div className="text-xl font-bold text-white">{user.followingCount.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Following</div>
        </Link>
      </div>

      {/* Recent Badges */}
      {user.badges.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-500" />
            <span>Recent Achievements</span>
          </h3>
          
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {user.badges.slice(0, 6).map((badge, index) => (
              <div
                key={index}
                className="flex-shrink-0 bg-gray-800 rounded-lg p-3 text-center min-w-[80px] hover:bg-gray-700 transition-all cursor-pointer"
                title={badge.description}
              >
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className="text-xs text-gray-400 font-medium">{badge.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorite Airlines */}
      {user.favoriteAirlines && user.favoriteAirlines.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Favorite Airlines</span>
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {user.favoriteAirlines.map((airline, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
              >
                {airline}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* View Full Profile Link */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <Link
          href={`/profile/${user.id}`}
          className="w-full flex items-center justify-center space-x-2 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all text-gray-300 hover:text-white"
        >
          <span>View Full Profile</span>
          <Users className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
