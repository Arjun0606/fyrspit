'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Flight } from '@/types';
import { formatDistance, formatDuration, formatRelativeTime } from '@/lib/utils';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Star, 
  MapPin, 
  Clock, 
  Plane,
  User,
  MoreHorizontal
} from 'lucide-react';

interface FlightCardProps {
  flight: Flight;
  showUserInfo?: boolean;
}

export function FlightCard({ flight, showUserInfo = true }: FlightCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const handleLike = async () => {
    try {
      const { auth } = await import('@/lib/firebase');
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      
      if (isLiked) {
        // Unlike
        const response = await fetch(`/api/flights/${flight.id}/unlike`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          setIsLiked(false);
          setLikesCount(prev => prev - 1);
        }
      } else {
        // Like
        const response = await fetch(`/api/flights/${flight.id}/like`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          setIsLiked(true);
          setLikesCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${flight.fromIata} → ${flight.toIata} flight on Fyrspit`,
          text: flight.reviewShort,
          url: `/flights/${flight.id}`,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/flights/${flight.id}`);
    }
  };

  const averageRating = flight.ratings ? 
    Object.values(flight.ratings).reduce((sum, rating) => sum + (rating || 0), 0) / 
    Object.values(flight.ratings).filter(rating => rating).length : 0;

  return (
    <article className="card hover:bg-gray-800/50 transition-colors">
      {/* User Info */}
      {showUserInfo && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-white">User {flight.userId.slice(0, 8)}</p>
              <p className="text-sm text-gray-400">
                {formatRelativeTime(flight.createdAt)}
              </p>
            </div>
          </div>
          <button className="p-1 hover:bg-gray-700 rounded">
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      )}

      {/* Flight Header */}
      <Link href={`/flights/${flight.id}`} className="block mb-4 group">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{flight.fromIata}</p>
              <p className="text-xs text-gray-400">Departure</p>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="h-px bg-gray-600 w-8"></div>
              <Plane className="h-4 w-4" />
              <div className="h-px bg-gray-600 w-8"></div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{flight.toIata}</p>
              <p className="text-xs text-gray-400">Arrival</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-white">
              {formatDistance(flight.milesKm)}
            </p>
            <p className="text-xs text-gray-400">
              {formatDuration(flight.hoursEstimate)}
            </p>
          </div>
        </div>
      </Link>

      {/* Flight Details */}
      <div className="mb-4">
        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
          <span>{flight.airlineCode}</span>
          {flight.flightNumber && <span>#{flight.flightNumber}</span>}
          {flight.aircraftCode && <span>{flight.aircraftCode}</span>}
          <span className="capitalize">{flight.cabinClass}</span>
          {flight.seat && <span>Seat {flight.seat}</span>}
        </div>
        
        {/* Ratings */}
        {averageRating > 0 && (
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(averageRating) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-400">
              {averageRating.toFixed(1)} average rating
            </span>
          </div>
        )}
      </div>

      {/* Review */}
      <Link href={`/flights/${flight.id}`} className="block mb-4 group">
        <p className="text-white group-hover:text-gray-100 transition-colors leading-relaxed">
          "{flight.reviewShort}"
        </p>
        {flight.reviewLong && (
          <p className="text-teal-400 text-sm mt-2 group-hover:text-teal-300 transition-colors">
            Read more...
          </p>
        )}
      </Link>

      {/* Photos */}
      {flight.photos && flight.photos.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2">
            {flight.photos.slice(0, 4).map((photo, index) => (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={photo}
                  alt={`Flight photo ${index + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-200"
                />
                {index === 3 && flight.photos.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold">
                      +{flight.photos.length - 4} more
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {flight.tags && flight.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {flight.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-800 text-teal-400 text-xs rounded-full hover:bg-gray-700 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-colors ${
              isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">{likesCount}</span>
          </button>
          
          <Link
            href={`/flights/${flight.id}#comments`}
            className="flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">0</span>
          </Link>
          
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 text-gray-400 hover:text-green-500 transition-colors"
          >
            <Share className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <MapPin className="h-3 w-3" />
          <span>{flight.date}</span>
          {flight.xpAwarded > 0 && (
            <>
              <span>•</span>
              <span className="text-teal-400">+{flight.xpAwarded} XP</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
