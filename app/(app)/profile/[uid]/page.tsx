'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { User, Flight } from '@/types';
import { FlightCard } from '@/components/flight-card';
import { StatsGrid } from '@/components/stats-grid';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDistance, formatDuration } from '@/lib/utils';
import { 
  User as UserIcon, 
  MapPin, 
  Calendar, 
  Plane, 
  Users, 
  Settings,
  Share,
  MoreHorizontal
} from 'lucide-react';

export default function ProfilePage() {
  const [currentUser] = useAuthState(auth);
  const params = useParams();
  const uid = params.uid as string;
  
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('flights');
  const [isFollowing, setIsFollowing] = useState(false);
  const [canViewProfile, setCanViewProfile] = useState(true);

  const isOwnProfile = currentUser?.uid === uid;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch user profile
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Check profile visibility
          const profileVisibility = userData?.privacy?.profileVisibility || 'public';
          const currentUserId = currentUser?.uid;
          
          if (!isOwnProfile && profileVisibility === 'private') {
            setCanViewProfile(false);
            setLoading(false);
            return;
          }
          
          if (!isOwnProfile && profileVisibility === 'friends' && !currentUserId) {
            setCanViewProfile(false);
            setLoading(false);
            return;
          }
          
          // TODO: Check friendship status for 'friends' visibility
          // For now, allow public and own profile only
          if (!isOwnProfile && profileVisibility === 'friends') {
            setCanViewProfile(false);
            setLoading(false);
            return;
          }
          
          setProfileUser({
            id: userDoc.id,
            ...userData,
            joinedAt: userData.joinedAt?.toDate() || new Date(),
          } as User);
        }

        // Fetch user's flights via API with auth token
        const flightsHeaders: HeadersInit = {};
        if (currentUser) {
          try {
            const token = await currentUser.getIdToken();
            flightsHeaders['Authorization'] = `Bearer ${token}`;
          } catch (error) {
            console.log('No auth token available');
          }
        }
        
        const flightsResponse = await fetch(`/api/flights?userId=${uid}&limit=20`, {
          headers: flightsHeaders
        });
        if (flightsResponse.ok) {
          const flightsData = await flightsResponse.json();
          const flightData: Flight[] = flightsData.flights.map((flight: any) => ({
            ...flight,
            createdAt: new Date(flight.createdAt),
            editedAt: flight.editedAt ? new Date(flight.editedAt) : undefined,
          }));
          setFlights(flightData);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (uid) {
      fetchProfile();
    }
  }, [uid]);

  const handleFollow = async () => {
    // TODO: Implement follow functionality
    setIsFollowing(!isFollowing);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileUser?.name}'s profile on Fyrspit`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!canViewProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Private Profile</h1>
          <p className="text-gray-400">This user's profile is private or only visible to friends.</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">User not found</h1>
          <p className="text-gray-400">This profile doesn't exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  const stats = profileUser.statsCache?.lifetime || {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-gray-700 rounded-full flex items-center justify-center">
              {profileUser.avatarUrl ? (
                <img
                  src={profileUser.avatarUrl}
                  alt={profileUser.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center space-x-2">
                <span>{profileUser.name}</span>
                {profileUser.roles?.verified && (
                  <div className="h-5 w-5 bg-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </h1>
              {profileUser.bio && (
                <p className="text-gray-400 mt-1">{profileUser.bio}</p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                {profileUser.homeAirportIata && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>Home: {profileUser.homeAirportIata}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {profileUser.joinedAt.getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Share className="h-5 w-5" />
            </button>
            
            {isOwnProfile ? (
              <button className="btn-secondary">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleFollow}
                className={isFollowing ? 'btn-secondary' : 'btn-primary'}
              >
                <Users className="h-4 w-4 mr-2" />
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
            
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Follow Stats */}
        <div className="flex items-center space-x-6 text-sm">
          <div>
            <span className="font-bold text-white">{profileUser.followerCount}</span>
            <span className="text-gray-400 ml-1">followers</span>
          </div>
          <div>
            <span className="font-bold text-white">{profileUser.followingCount}</span>
            <span className="text-gray-400 ml-1">following</span>
          </div>
          <div>
            <span className="font-bold text-white">Level {profileUser.level}</span>
            <span className="text-gray-400 ml-1">• {profileUser.xp} XP</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-teal-400">{stats.flights || 0}</div>
          <div className="text-sm text-gray-400">Flights</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-teal-400">
            {formatDistance(stats.milesKm || 0, 'mi').split(' ')[0]}
          </div>
          <div className="text-sm text-gray-400">Miles</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-teal-400">{stats.airports?.length || 0}</div>
          <div className="text-sm text-gray-400">Airports</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-teal-400">{stats.countries?.length || 0}</div>
          <div className="text-sm text-gray-400">Countries</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 mb-6">
        <nav className="flex space-x-8">
          {['flights', 'stats', 'badges', 'lists'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-teal-500 text-teal-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'flights' && (
        <div className="space-y-6">
          {flights.length === 0 ? (
            <div className="text-center py-12">
              <Plane className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No flights yet</h3>
              <p className="text-gray-400">
                {isOwnProfile 
                  ? "Start by logging your first flight!"
                  : `${profileUser.name} hasn't shared any flights yet.`
                }
              </p>
            </div>
          ) : (
            flights.map((flight) => (
              <FlightCard key={flight.id} flight={flight} showUserInfo={false} />
            ))
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <StatsGrid stats={stats} />
      )}

      {activeTab === 'badges' && (
        <div className="text-center py-12">
          <div className="h-12 w-12 bg-gray-800 rounded-full mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold mb-2">Badges coming soon</h3>
          <p className="text-gray-400">Achievement system is being developed.</p>
        </div>
      )}

      {activeTab === 'lists' && (
        <div className="text-center py-12">
          <div className="h-12 w-12 bg-gray-800 rounded-full mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold mb-2">Lists coming soon</h3>
          <p className="text-gray-400">User-created lists feature is being developed.</p>
        </div>
      )}
    </div>
  );
}
