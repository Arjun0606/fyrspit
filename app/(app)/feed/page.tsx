'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { Flight } from '@/types';
import { FlightCard } from '@/components/flight-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Plus, Filter } from 'lucide-react';
import Link from 'next/link';

export default function FeedPage() {
  const [user] = useAuthState(auth);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'friends'>('all');

  useEffect(() => {
    const fetchFeed = async () => {
      if (!user) return;

      try {
        let feedQuery;
        
        if (filter === 'friends') {
          // TODO: Implement friends feed once follows are implemented
          feedQuery = query(
            collection(db, 'flights'),
            where('visibility', '==', 'public'),
            orderBy('createdAt', 'desc'),
            limit(20)
          );
        } else {
          feedQuery = query(
            collection(db, 'flights'),
            where('visibility', '==', 'public'),
            orderBy('createdAt', 'desc'),
            limit(20)
          );
        }

        const querySnapshot = await getDocs(feedQuery);
        const flightData: Flight[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          flightData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            editedAt: data.editedAt?.toDate(),
          } as Flight);
        });

        setFlights(flightData);
      } catch (error) {
        console.error('Error fetching feed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [user, filter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Feed</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                filter === 'all' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('friends')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                filter === 'friends' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Friends
            </button>
          </div>
        </div>
      </div>

      {/* Composer CTA */}
      <Link href="/flights/new" className="block mb-6">
        <div className="card border-dashed border-gray-600 hover:border-teal-500 transition-colors cursor-pointer group">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-teal-600 rounded-full flex items-center justify-center group-hover:bg-teal-500 transition-colors">
                <Plus className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-gray-300 group-hover:text-white transition-colors">
                Share your latest flight experience...
              </p>
            </div>
          </div>
        </div>
      </Link>

      {/* Feed */}
      {flights.length === 0 ? (
        <EmptyFeed />
      ) : (
        <div className="space-y-6">
          {flights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyFeed() {
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="h-16 w-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="h-8 w-8 text-gray-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Your feed is empty</h3>
        <p className="text-gray-400 mb-6">
          Start by logging your first flight or following other aviation enthusiasts to see their journeys.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/flights/new" className="btn-primary">
            Log Your First Flight
          </Link>
          <Link href="/explore" className="btn-secondary">
            Discover People
          </Link>
        </div>
      </div>
    </div>
  );
}
