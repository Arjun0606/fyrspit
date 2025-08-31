'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Award, 
  Plane, 
  Globe, 
  Star, 
  Trophy, 
  Target,
  Clock,
  MapPin,
  Upload,
  Route,
  Users,
  Utensils,
  Building,
  Coffee,
  Sunrise,
  Moon
} from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'flights' | 'social' | 'exploration' | 'experience';
  criteria: string;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  earned: boolean;
  earnedAt?: Date;
  progress?: {
    current: number;
    target: number;
  };
}

export default function BadgesPage() {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            id: userDoc.id,
            ...data,
            joinedAt: data.joinedAt?.toDate() || new Date(),
          } as User);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const getBadges = (): Badge[] => {
    const stats = userData?.statsCache?.lifetime || {};
    const userBadges = userData?.badges || [];

    return [
      // Flight Badges
      {
        id: 'first-flight',
        name: 'First Flight',
        description: 'Log your first flight',
        icon: <Plane className="h-6 w-6" />,
        category: 'flights',
        criteria: 'Log 1 flight',
        earned: (userData as any)?.computed?.flightsCount >= 1 || (stats.flights || 0) >= 1,
        progress: { current: Math.min(((userData as any)?.computed?.flightsCount || stats.flights || 0), 1), target: 1 }
      },
      {
        id: 'frequent-flyer',
        name: 'Frequent Flyer',
        description: 'Complete 50 flights',
        icon: <Trophy className="h-6 w-6" />,
        category: 'flights',
        criteria: 'Log 50 flights',
        tier: 'silver',
        earned: ((userData as any)?.computed?.flightsCount || stats.flights || 0) >= 50,
        progress: { current: Math.min(((userData as any)?.computed?.flightsCount || stats.flights || 0), 50), target: 50 }
      },
      {
        id: 'century-club',
        name: 'Century Club',
        description: 'Complete 100 flights',
        icon: <Award className="h-6 w-6" />,
        category: 'flights',
        criteria: 'Log 100 flights',
        tier: 'gold',
        earned: (stats.flights || 0) >= 100,
        progress: { current: Math.min(stats.flights || 0, 100), target: 100 }
      },

      // Exploration Badges
      {
        id: 'globetrotter',
        name: 'Globetrotter',
        description: 'Visit 10 different countries',
        icon: <Globe className="h-6 w-6" />,
        category: 'exploration',
        criteria: 'Visit 10 countries',
        earned: (stats.countries?.length || 0) >= 10,
        progress: { current: Math.min(stats.countries?.length || 0, 10), target: 10 }
      },
      {
        id: 'worldly',
        name: 'Worldly',
        description: 'Visit 30 different countries',
        icon: <Star className="h-6 w-6" />,
        category: 'exploration',
        criteria: 'Visit 30 countries',
        tier: 'gold',
        earned: (stats.countries?.length || 0) >= 30,
        progress: { current: Math.min(stats.countries?.length || 0, 30), target: 30 }
      },
      {
        id: 'airport-hopper',
        name: 'Airport Hopper',
        description: 'Visit 25 different airports',
        icon: <MapPin className="h-6 w-6" />,
        category: 'exploration',
        criteria: 'Visit 25 airports',
        earned: (stats.airports?.length || 0) >= 25,
        progress: { current: Math.min(stats.airports?.length || 0, 25), target: 25 }
      },

      // Experience Badges
      {
        id: 'a380-club',
        name: 'A380 Club',
        description: 'Fly on an Airbus A380',
        icon: <Plane className="h-6 w-6" />,
        category: 'experience',
        criteria: 'Fly A380 aircraft',
        earned: stats.aircraft?.includes('A380') || false,
      },
      {
        id: 'dreamliner',
        name: 'Dreamliner',
        description: 'Fly on a Boeing 787',
        icon: <Star className="h-6 w-6" />,
        category: 'experience',
        criteria: 'Fly B787 aircraft',
        earned: stats.aircraft?.includes('B787') || false,
      },
      {
        id: 'red-eye-veteran',
        name: 'Red-Eye Veteran',
        description: 'Complete 10 overnight flights',
        icon: <Moon className="h-6 w-6" />,
        category: 'experience',
        criteria: 'Complete 10 night flights',
        earned: (stats.dayNightRatio?.night || 0) >= 10,
        progress: { current: Math.min(stats.dayNightRatio?.night || 0, 10), target: 10 }
      },
      {
        id: 'early-bird',
        name: 'Early Bird',
        description: 'Take 10 early morning flights',
        icon: <Sunrise className="h-6 w-6" />,
        category: 'experience',
        criteria: 'Complete 10 day flights',
        earned: (stats.dayNightRatio?.day || 0) >= 10,
        progress: { current: Math.min(stats.dayNightRatio?.day || 0, 10), target: 10 }
      },

      // Social Badges
      {
        id: 'import-hero',
        name: 'Import Hero',
        description: 'Import 100+ flights at once',
        icon: <Upload className="h-6 w-6" />,
        category: 'social',
        criteria: 'Import 100 flights',
        earned: userBadges.includes('import-hero'),
      },
    ];
  };

  const badges = getBadges();
  const categories = [
    { id: 'all', name: 'All Badges', icon: Award },
    { id: 'flights', name: 'Flights', icon: Plane },
    { id: 'exploration', name: 'Exploration', icon: Globe },
    { id: 'experience', name: 'Experience', icon: Star },
    { id: 'social', name: 'Social', icon: Users },
  ];

  const filteredBadges = selectedCategory === 'all' 
    ? badges 
    : badges.filter(badge => badge.category === selectedCategory);

  const earnedBadges = badges.filter(badge => badge.earned);
  const totalBadges = badges.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Badges</h1>
        <p className="text-gray-400 mb-4">
          Unlock achievements as you explore the world of aviation
        </p>
        
        {/* Progress */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold">
              {earnedBadges.length} of {totalBadges} badges earned
            </span>
            <span className="text-teal-400 font-bold">
              {Math.round((earnedBadges.length / totalBadges) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(earnedBadges.length / totalBadges) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(({ id, name, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSelectedCategory(id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === id
                ? 'bg-teal-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{name}</span>
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </div>
    </div>
  );
}

function BadgeCard({ badge }: { badge: Badge }) {
  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600';
      case 'silver': return 'text-gray-400';
      case 'gold': return 'text-yellow-400';
      case 'platinum': return 'text-purple-400';
      default: return 'text-teal-500';
    }
  };

  const getTierBg = (tier?: string) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-600/20 border-amber-600/30';
      case 'silver': return 'bg-gray-400/20 border-gray-400/30';
      case 'gold': return 'bg-yellow-400/20 border-yellow-400/30';
      case 'platinum': return 'bg-purple-400/20 border-purple-400/30';
      default: return 'bg-teal-500/20 border-teal-500/30';
    }
  };

  return (
    <div className={`card transition-all duration-200 ${
      badge.earned 
        ? `${getTierBg(badge.tier)} hover:scale-105` 
        : 'bg-gray-900/50 border-gray-700 opacity-75'
    }`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 p-3 rounded-lg ${
          badge.earned ? getTierBg(badge.tier) : 'bg-gray-800'
        }`}>
          <div className={badge.earned ? getTierColor(badge.tier) : 'text-gray-600'}>
            {badge.icon}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className={`font-semibold ${badge.earned ? 'text-white' : 'text-gray-500'}`}>
              {badge.name}
            </h3>
            {badge.tier && (
              <span className={`text-xs px-2 py-1 rounded-full ${getTierBg(badge.tier)} ${getTierColor(badge.tier)}`}>
                {badge.tier}
              </span>
            )}
          </div>
          
          <p className={`text-sm mb-2 ${badge.earned ? 'text-gray-300' : 'text-gray-600'}`}>
            {badge.description}
          </p>
          
          <p className={`text-xs ${badge.earned ? 'text-gray-400' : 'text-gray-600'}`}>
            {badge.criteria}
          </p>
          
          {badge.progress && !badge.earned && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400">Progress</span>
                <span className="text-gray-400">
                  {badge.progress.current} / {badge.progress.target}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                <div 
                  className="bg-teal-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((badge.progress.current / badge.progress.target) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          )}
          
          {badge.earned && badge.earnedAt && (
            <p className="text-xs text-teal-400 mt-2">
              Earned {badge.earnedAt.toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
