'use client';

import { Achievement } from '@/lib/achievements';
import { toast } from 'react-hot-toast';
import { 
  Trophy, 
  Star, 
  Crown, 
  Medal,
  Zap,
  Gift
} from 'lucide-react';

interface AchievementToastProps {
  achievement: Achievement;
  xpEarned: number;
}

export function showAchievementToast(achievement: Achievement, xpEarned: number) {
  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getRarityIcon = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return <Star className="h-4 w-4" />;
      case 'rare': return <Medal className="h-4 w-4" />;
      case 'epic': return <Trophy className="h-4 w-4" />;
      case 'legendary': return <Crown className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const CustomToast = () => (
    <div className="bg-gray-900 border border-teal-500 rounded-lg p-4 shadow-xl max-w-sm">
      <div className="flex items-start space-x-3">
        <div className={`${getRarityColor(achievement.rarity)} mt-1`}>
          {getRarityIcon(achievement.rarity)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-lg">{achievement.icon}</span>
            <p className="text-sm font-bold text-white truncate">
              Achievement Unlocked!
            </p>
          </div>
          
          <p className="text-white font-semibold text-sm mb-1">
            {achievement.name}
          </p>
          
          <p className="text-gray-300 text-xs mb-2">
            {achievement.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${getRarityColor(achievement.rarity)} uppercase`}>
              {achievement.rarity}
            </span>
            <div className="flex items-center space-x-1 text-yellow-400">
              <Zap className="h-3 w-3" />
              <span className="text-xs font-bold">+{xpEarned} XP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Show toast with custom component
  toast.custom(<CustomToast />, {
    duration: achievement.rarity === 'legendary' ? 8000 : 5000,
    position: 'top-center',
  });

  // Also show a simpler toast for quick feedback
  toast.success(`🏆 ${achievement.name} unlocked! +${xpEarned} XP`, {
    duration: 3000,
    position: 'bottom-right',
  });
}

export function showLevelUpToast(newLevel: number, xpEarned: number) {
  const CustomLevelUpToast = () => (
    <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-4 shadow-xl max-w-sm border border-yellow-400">
      <div className="flex items-center space-x-3">
        <div className="text-yellow-200">
          <Crown className="h-6 w-6" />
        </div>
        
        <div className="flex-1">
          <p className="text-yellow-100 font-bold text-lg">
            LEVEL UP!
          </p>
          
          <p className="text-yellow-200 text-sm mb-2">
            You've reached Level {newLevel}!
          </p>
          
          <div className="flex items-center space-x-1 text-yellow-100">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-bold">+{xpEarned} XP</span>
          </div>
        </div>
        
        <div className="text-4xl">
          🎉
        </div>
      </div>
    </div>
  );

  toast.custom(<CustomLevelUpToast />, {
    duration: 6000,
    position: 'top-center',
  });
}

export function showStatsToast(stats: {
  flightsThisMonth: number;
  milesThisYear: number;
  newAirports: number;
  newCountries: number;
}) {
  if (stats.newAirports > 0) {
    toast.success(`🛫 ${stats.newAirports} new airport${stats.newAirports > 1 ? 's' : ''} unlocked!`, {
      duration: 3000,
    });
  }

  if (stats.newCountries > 0) {
    toast.success(`🌍 ${stats.newCountries} new countr${stats.newCountries > 1 ? 'ies' : 'y'} visited!`, {
      duration: 3000,
    });
  }

  // Milestone celebrations
  if (stats.flightsThisMonth === 5) {
    toast.success('🔥 5 flights this month! You\'re on fire!', { duration: 4000 });
  } else if (stats.flightsThisMonth === 10) {
    toast.success('🚀 10 flights this month! Frequent flyer status!', { duration: 4000 });
  }

  if (stats.milesThisYear === 25000) {
    toast.success('✈️ 25,000 miles this year! Elite status!', { duration: 4000 });
  }
}

// Export the component for other uses
export function AchievementToast({ achievement, xpEarned }: AchievementToastProps) {
  return (
    <div className="bg-gray-900 border border-teal-500 rounded-lg p-4 shadow-xl">
      <div className="flex items-start space-x-3">
        <div className="text-teal-400 mt-1">
          <Trophy className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-lg">{achievement.icon}</span>
            <p className="text-sm font-bold text-white">
              Achievement Unlocked!
            </p>
          </div>
          
          <p className="text-white font-semibold text-sm mb-1">
            {achievement.name}
          </p>
          
          <p className="text-gray-300 text-xs mb-2">
            {achievement.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-400 uppercase">
              {achievement.rarity}
            </span>
            <div className="flex items-center space-x-1 text-yellow-400">
              <Zap className="h-3 w-3" />
              <span className="text-xs font-bold">+{xpEarned} XP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
