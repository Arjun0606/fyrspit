/**
 * Comprehensive Achievement & Gamification System
 * Like Forza Horizon but for Aviation! 🎮✈️
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'geographic' | 'aircraft' | 'airline' | 'distance' | 'frequency' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xp: number;
  condition: {
    type: string;
    target: number;
    current?: number;
  };
  unlocked?: boolean;
  unlockedAt?: Date;
}

export interface UserStats {
  // Core Stats
  totalFlights: number;
  totalMiles: number;
  totalHours: number;
  totalXP: number;
  level: number;
  
  // Geographic Stats
  countriesVisited: string[];
  continentsVisited: string[];
  citiesVisited: string[];
  airportsVisited: string[];
  
  // Aircraft Stats
  aircraftTypes: string[];
  manufacturers: string[];
  engineTypes: string[];
  cabinClasses: string[];
  
  // Airline Stats
  airlinesFlown: string[];
  favoriteAirline: string;
  loyaltyStatus: Record<string, string>;
  
  // Flight Patterns
  shortHaulFlights: number; // < 3 hours
  mediumHaulFlights: number; // 3-6 hours
  longHaulFlights: number; // > 6 hours
  domesticFlights: number;
  internationalFlights: number;
  
  // Time Stats
  averageFlightTime: number;
  longestFlight: number;
  shortestFlight: number;
  
  // Social Stats
  friendsCount: number;
  globalRank: number;
  friendsRank: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  progress: number; // 0-100
  unlocked: boolean;
}

// Complete Achievement Database
export const achievementDatabase: Achievement[] = [
  // Geographic Achievements
  {
    id: 'first_flight',
    name: 'First Flight',
    description: 'Take your first flight',
    icon: '🛫',
    category: 'frequency',
    rarity: 'common',
    xp: 100,
    condition: { type: 'total_flights', target: 1 }
  },
  {
    id: 'domestic_explorer',
    name: 'Domestic Explorer',
    description: 'Visit 5 cities in your home country',
    icon: '🏡',
    category: 'geographic',
    rarity: 'common',
    xp: 200,
    condition: { type: 'domestic_cities', target: 5 }
  },
  {
    id: 'international_debut',
    name: 'International Debut',
    description: 'Take your first international flight',
    icon: '🌍',
    category: 'geographic',
    rarity: 'rare',
    xp: 500,
    condition: { type: 'international_flights', target: 1 }
  },
  {
    id: 'continent_collector',
    name: 'Continent Collector',
    description: 'Visit all 7 continents',
    icon: '🗺️',
    category: 'geographic',
    rarity: 'legendary',
    xp: 5000,
    condition: { type: 'continents', target: 7 }
  },
  {
    id: 'airport_hunter',
    name: 'Airport Hunter',
    description: 'Visit 50 different airports',
    icon: '🛫',
    category: 'geographic',
    rarity: 'epic',
    xp: 2000,
    condition: { type: 'airports', target: 50 }
  },
  
  // Aircraft Achievements
  {
    id: 'narrow_body_novice',
    name: 'Narrow Body Novice',
    description: 'Fly on 5 different narrow-body aircraft',
    icon: '✈️',
    category: 'aircraft',
    rarity: 'common',
    xp: 300,
    condition: { type: 'narrow_body_types', target: 5 }
  },
  {
    id: 'wide_body_warrior',
    name: 'Wide Body Warrior',
    description: 'Experience the comfort of wide-body aircraft',
    icon: '🛩️',
    category: 'aircraft',
    rarity: 'rare',
    xp: 800,
    condition: { type: 'wide_body_flights', target: 1 }
  },
  {
    id: 'airbus_ambassador',
    name: 'Airbus Ambassador',
    description: 'Fly on 10 different Airbus aircraft',
    icon: '🏗️',
    category: 'aircraft',
    rarity: 'epic',
    xp: 1500,
    condition: { type: 'airbus_types', target: 10 }
  },
  {
    id: 'boeing_believer',
    name: 'Boeing Believer',
    description: 'Experience 10 different Boeing models',
    icon: '🔧',
    category: 'aircraft',
    rarity: 'epic',
    xp: 1500,
    condition: { type: 'boeing_types', target: 10 }
  },
  {
    id: 'jumbo_jet_rider',
    name: 'Jumbo Jet Rider',
    description: 'Fly on the iconic A380 or 747',
    icon: '🐘',
    category: 'aircraft',
    rarity: 'legendary',
    xp: 3000,
    condition: { type: 'jumbo_aircraft', target: 1 }
  },
  
  // Distance & Time Achievements
  {
    id: 'mile_high_club',
    name: 'Mile High Club',
    description: 'Accumulate 10,000 flight miles',
    icon: '📏',
    category: 'distance',
    rarity: 'rare',
    xp: 1000,
    condition: { type: 'total_miles', target: 10000 }
  },
  {
    id: 'frequent_flyer',
    name: 'Frequent Flyer',
    description: 'Take 25 flights in one year',
    icon: '🔄',
    category: 'frequency',
    rarity: 'rare',
    xp: 800,
    condition: { type: 'yearly_flights', target: 25 }
  },
  {
    id: 'long_haul_legend',
    name: 'Long Haul Legend',
    description: 'Complete 5 flights over 8 hours',
    icon: '🌙',
    category: 'distance',
    rarity: 'epic',
    xp: 2500,
    condition: { type: 'long_haul_flights', target: 5 }
  },
  {
    id: 'around_the_world',
    name: 'Around The World',
    description: 'Fly 40,075 km (Earth\'s circumference)',
    icon: '🌎',
    category: 'distance',
    rarity: 'legendary',
    xp: 10000,
    condition: { type: 'total_km', target: 40075 }
  },
  
  // Airline Achievements
  {
    id: 'airline_sampler',
    name: 'Airline Sampler',
    description: 'Fly with 10 different airlines',
    icon: '🏢',
    category: 'airline',
    rarity: 'rare',
    xp: 600,
    condition: { type: 'airlines', target: 10 }
  },
  {
    id: 'loyalty_member',
    name: 'Loyalty Member',
    description: 'Take 10 flights with the same airline',
    icon: '💳',
    category: 'airline',
    rarity: 'common',
    xp: 400,
    condition: { type: 'same_airline_flights', target: 10 }
  },
  {
    id: 'premium_passenger',
    name: 'Premium Passenger',
    description: 'Experience business or first class',
    icon: '👑',
    category: 'airline',
    rarity: 'epic',
    xp: 2000,
    condition: { type: 'premium_cabin', target: 1 }
  },
  
  // Special Achievements
  {
    id: 'red_eye_warrior',
    name: 'Red Eye Warrior',
    description: 'Take 5 overnight flights',
    icon: '🌃',
    category: 'special',
    rarity: 'rare',
    xp: 700,
    condition: { type: 'overnight_flights', target: 5 }
  },
  {
    id: 'same_day_return',
    name: 'Same Day Return',
    description: 'Complete a round trip in one day',
    icon: '⚡',
    category: 'special',
    rarity: 'epic',
    xp: 1200,
    condition: { type: 'same_day_return', target: 1 }
  },
  {
    id: 'aviation_photographer',
    name: 'Aviation Photographer',
    description: 'Upload 50 flight photos',
    icon: '📸',
    category: 'special',
    rarity: 'rare',
    xp: 500,
    condition: { type: 'photos_uploaded', target: 50 }
  }
];

export class AchievementEngine {
  /**
   * Calculate user level from XP
   */
  static calculateLevel(xp: number): number {
    // Every 1000 XP = 1 level, with exponential scaling
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }
  
  /**
   * Calculate XP needed for next level
   */
  static xpForNextLevel(currentLevel: number): number {
    return Math.pow(currentLevel, 2) * 100;
  }
  
  /**
   * Check which achievements should be unlocked
   */
  static checkAchievements(stats: UserStats): Achievement[] {
    const newUnlocks: Achievement[] = [];
    
    for (const achievement of achievementDatabase) {
      if (achievement.unlocked) continue;
      
      const shouldUnlock = this.evaluateCondition(achievement.condition, stats);
      if (shouldUnlock) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        newUnlocks.push(achievement);
      }
    }
    
    return newUnlocks;
  }
  
  /**
   * Evaluate if an achievement condition is met
   */
  private static evaluateCondition(condition: Achievement['condition'], stats: UserStats): boolean {
    switch (condition.type) {
      case 'total_flights':
        return stats.totalFlights >= condition.target;
      case 'total_miles':
        return stats.totalMiles >= condition.target;
      case 'airports':
        return stats.airportsVisited.length >= condition.target;
      case 'continents':
        return stats.continentsVisited.length >= condition.target;
      case 'airlines':
        return stats.airlinesFlown.length >= condition.target;
      case 'international_flights':
        return stats.internationalFlights >= condition.target;
      case 'long_haul_flights':
        return stats.longHaulFlights >= condition.target;
      // Add more condition types as needed
      default:
        return false;
    }
  }
  
  /**
   * Generate leaderboard comparison
   */
  static generateFriendsComparison(userStats: UserStats, friendsStats: UserStats[]): {
    ranking: Array<{
      userId: string;
      name: string;
      stats: UserStats;
      rank: number;
    }>;
    userRank: number;
    categories: Array<{
      name: string;
      userValue: number;
      userRank: number;
      leader: { name: string; value: number };
    }>;
  } {
    // Implementation for friends comparison
    // This would compare total flights, miles, countries, etc.
    
    const categories = [
      {
        name: 'Total Flights',
        userValue: userStats.totalFlights,
        userRank: 1, // Calculate actual rank
        leader: { name: 'Friend Name', value: 45 }
      },
      {
        name: 'Countries Visited',
        userValue: userStats.countriesVisited.length,
        userRank: 2,
        leader: { name: 'Another Friend', value: 12 }
      },
      // Add more categories
    ];
    
    return {
      ranking: [], // Sorted list of all friends + user
      userRank: 1,
      categories
    };
  }
}

export const achievements = achievementDatabase;
