/**
 * ADVANCED GAMIFICATION ENGINE
 * Complete XP, levels, badges, achievements, and leaderboards
 * Like "Forza for Aviation" - comprehensive stats and unlocks
 */

import { ProductionFlightData } from './production-flight-api';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'distance' | 'frequency' | 'exploration' | 'aircraft' | 'airlines' | 'special';
  requirements: {
    type: 'flights' | 'miles' | 'countries' | 'airports' | 'airlines' | 'aircraft' | 'custom';
    value: number;
    condition?: string;
  };
  xp: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked?: boolean;
  unlockedAt?: Date;
}

export interface LevelSystem {
  level: number;
  xp: number;
  xpToNext: number;
  title: string;
  benefits: string[];
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  value: number;
  rank: number;
  avatar?: string;
}

export class GamificationEngine {
  
  /**
   * Calculate XP for a flight based on comprehensive factors
   */
  static calculateFlightXP(flight: ProductionFlightData, userStats: any): number {
    let baseXP = 100;
    let bonusXP = 0;
    
    // Distance bonus (1 XP per mile)
    bonusXP += flight.route.distance;
    
    // International flight bonus
    if (flight.route.departure.country !== flight.route.arrival.country) {
      bonusXP += 200;
    }
    
    // Long-haul bonus (>6 hours)
    if (flight.route.duration > 360) {
      bonusXP += 300;
    }
    
    // Wide-body aircraft bonus
    if (this.isWideBodAircraft(flight.aircraft.type)) {
      bonusXP += 150;
    }
    
    // First time airport bonus
    if (!userStats.airports.includes(flight.route.departure.iata)) {
      bonusXP += 100;
    }
    if (!userStats.airports.includes(flight.route.arrival.iata)) {
      bonusXP += 100;
    }
    
    // First time country bonus
    if (!userStats.countries.includes(flight.route.departure.country)) {
      bonusXP += 200;
    }
    if (!userStats.countries.includes(flight.route.arrival.country)) {
      bonusXP += 200;
    }
    
    // Premium cabin bonus
    if (flight.status.current === 'business' || flight.status.current === 'first') {
      bonusXP += 150;
    }
    
    // Night flight bonus (red-eye)
    const departureHour = new Date(flight.schedule.departureTime).getHours();
    if (departureHour < 6 || departureHour > 22) {
      bonusXP += 75;
    }
    
    return baseXP + bonusXP;
  }

  /**
   * Calculate user level from total XP
   */
  static calculateLevel(totalXP: number): LevelSystem {
    const level = Math.floor(totalXP / 1000) + 1;
    const currentLevelXP = (level - 1) * 1000;
    const nextLevelXP = level * 1000;
    const xpInCurrentLevel = totalXP - currentLevelXP;
    const xpToNext = nextLevelXP - totalXP;
    
    const titles = [
      'Ground Crew', 'Student Pilot', 'Private Pilot', 'Commercial Pilot', 'Airline Pilot',
      'Captain', 'Senior Captain', 'Chief Pilot', 'Training Captain', 'Fleet Captain',
      'Aviation Expert', 'Sky Master', 'Flight Legend', 'Aviation Icon', 'Sky God'
    ];
    
    const title = titles[Math.min(level - 1, titles.length - 1)] || 'Aviation Deity';
    
    const benefits = this.getLevelBenefits(level);
    
    return {
      level,
      xp: totalXP,
      xpToNext,
      title,
      benefits
    };
  }

  /**
   * Get benefits for reaching a level
   */
  private static getLevelBenefits(level: number): string[] {
    const benefits: Record<number, string[]> = {
      1: ['Welcome to Fyrspit!'],
      5: ['Profile badge', 'Custom status'],
      10: ['Priority support', 'Advanced stats'],
      15: ['Beta features access'],
      20: ['Exclusive content', 'VIP status'],
      25: ['Custom themes', 'Profile customization'],
      30: ['Leaderboard highlighting'],
      50: ['Aviation expert status'],
      100: ['Legendary pilot status']
    };
    
    return benefits[level] || [`Level ${level} pilot`];
  }

  /**
   * Check for newly unlocked achievements
   */
  static checkAchievements(userStats: any, newFlight?: ProductionFlightData): Achievement[] {
    const newAchievements: Achievement[] = [];
    const allAchievements = this.getAllAchievements();
    
    for (const achievement of allAchievements) {
      if (achievement.unlocked) continue;
      
      if (this.isAchievementUnlocked(achievement, userStats, newFlight)) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        newAchievements.push(achievement);
      }
    }
    
    return newAchievements;
  }

  /**
   * Check if specific achievement is unlocked
   */
  private static isAchievementUnlocked(
    achievement: Achievement, 
    userStats: any, 
    newFlight?: ProductionFlightData
  ): boolean {
    const req = achievement.requirements;
    
    switch (req.type) {
      case 'flights':
        return userStats.flights >= req.value;
      case 'miles':
        return userStats.milesMi >= req.value;
      case 'countries':
        return userStats.countries.length >= req.value;
      case 'airports':
        return userStats.airports.length >= req.value;
      case 'airlines':
        return userStats.airlines.length >= req.value;
      case 'aircraft':
        return userStats.aircraft.length >= req.value;
      case 'custom':
        return this.checkCustomAchievement(achievement.id, userStats, newFlight);
      default:
        return false;
    }
  }

  /**
   * Check custom achievements with special conditions
   */
  private static checkCustomAchievement(
    achievementId: string, 
    userStats: any, 
    newFlight?: ProductionFlightData
  ): boolean {
    switch (achievementId) {
      case 'first_flight':
        return userStats.flights >= 1;
      
      case 'international_explorer':
        return userStats.countries.length >= 5;
      
      case 'frequent_flyer':
        return userStats.flights >= 50;
      
      case 'globe_trotter':
        return userStats.countries.length >= 25;
      
      case 'million_mile_club':
        return userStats.milesMi >= 1000000;
      
      case 'red_eye_warrior':
        // Check if user has taken 10+ night flights
        return userStats.nightFlights >= 10;
      
      case 'wide_body_lover':
        // Check if user has flown on 10+ wide-body aircraft
        return userStats.wideBodies >= 10;
      
      case 'airline_collector':
        return userStats.airlines.length >= 20;
      
      case 'airport_hopper':
        return userStats.airports.length >= 100;
      
      case 'continent_crusher':
        return userStats.continents.length >= 6;
      
      default:
        return false;
    }
  }

  /**
   * Get all available achievements
   */
  static getAllAchievements(): Achievement[] {
    return [
      // Distance Achievements
      {
        id: 'first_flight',
        name: 'First Flight',
        description: 'Log your very first flight',
        icon: '🛫',
        category: 'frequency',
        requirements: { type: 'flights', value: 1 },
        xp: 100,
        rarity: 'common'
      },
      {
        id: 'frequent_flyer',
        name: 'Frequent Flyer',
        description: 'Complete 50 flights',
        icon: '✈️',
        category: 'frequency',
        requirements: { type: 'flights', value: 50 },
        xp: 500,
        rarity: 'rare'
      },
      {
        id: 'sky_warrior',
        name: 'Sky Warrior',
        description: 'Complete 200 flights',
        icon: '🛩️',
        category: 'frequency',
        requirements: { type: 'flights', value: 200 },
        xp: 2000,
        rarity: 'epic'
      },
      
      // Distance Achievements
      {
        id: 'hundred_k_club',
        name: '100K Mile Club',
        description: 'Fly 100,000 miles',
        icon: '🌍',
        category: 'distance',
        requirements: { type: 'miles', value: 100000 },
        xp: 1000,
        rarity: 'rare'
      },
      {
        id: 'million_mile_club',
        name: 'Million Mile Club',
        description: 'Fly 1,000,000 miles',
        icon: '🌌',
        category: 'distance',
        requirements: { type: 'custom', value: 1000000 },
        xp: 10000,
        rarity: 'legendary'
      },
      
      // Exploration Achievements
      {
        id: 'international_explorer',
        name: 'International Explorer',
        description: 'Visit 5 different countries',
        icon: '🗺️',
        category: 'exploration',
        requirements: { type: 'countries', value: 5 },
        xp: 500,
        rarity: 'common'
      },
      {
        id: 'globe_trotter',
        name: 'Globe Trotter',
        description: 'Visit 25 different countries',
        icon: '🌏',
        category: 'exploration',
        requirements: { type: 'custom', value: 25 },
        xp: 2500,
        rarity: 'epic'
      },
      {
        id: 'continent_crusher',
        name: 'Continent Crusher',
        description: 'Visit all 6 inhabited continents',
        icon: '🌐',
        category: 'exploration',
        requirements: { type: 'custom', value: 6 },
        xp: 5000,
        rarity: 'legendary'
      },
      
      // Aircraft Achievements
      {
        id: 'aircraft_collector',
        name: 'Aircraft Collector',
        description: 'Fly on 20 different aircraft types',
        icon: '🛫',
        category: 'aircraft',
        requirements: { type: 'aircraft', value: 20 },
        xp: 1000,
        rarity: 'rare'
      },
      {
        id: 'wide_body_lover',
        name: 'Wide-Body Lover',
        description: 'Fly 10 times on wide-body aircraft',
        icon: '🛬',
        category: 'aircraft',
        requirements: { type: 'custom', value: 10 },
        xp: 1500,
        rarity: 'epic'
      },
      
      // Airline Achievements
      {
        id: 'airline_collector',
        name: 'Airline Collector',
        description: 'Fly with 20 different airlines',
        icon: '✈️',
        category: 'airlines',
        requirements: { type: 'custom', value: 20 },
        xp: 2000,
        rarity: 'epic'
      },
      
      // Special Achievements
      {
        id: 'red_eye_warrior',
        name: 'Red-Eye Warrior',
        description: 'Complete 10 overnight flights',
        icon: '🌙',
        category: 'special',
        requirements: { type: 'custom', value: 10 },
        xp: 1000,
        rarity: 'rare'
      },
      {
        id: 'airport_hopper',
        name: 'Airport Hopper',
        description: 'Visit 100 different airports',
        icon: '🏢',
        category: 'exploration',
        requirements: { type: 'custom', value: 100 },
        xp: 5000,
        rarity: 'legendary'
      }
    ];
  }

  /**
   * Generate leaderboards for different categories
   */
  static generateLeaderboards(users: any[]): Record<string, LeaderboardEntry[]> {
    const leaderboards: Record<string, LeaderboardEntry[]> = {};
    
    // Total Flights Leaderboard
    leaderboards.flights = users
      .map(user => ({
        userId: user.id,
        name: user.name,
        value: user.statsCache.lifetime.flights,
        rank: 0,
        avatar: user.avatar
      }))
      .sort((a, b) => b.value - a.value)
      .map((entry, index) => ({ ...entry, rank: index + 1 }))
      .slice(0, 100);

    // Total Miles Leaderboard
    leaderboards.miles = users
      .map(user => ({
        userId: user.id,
        name: user.name,
        value: user.statsCache.lifetime.milesMi,
        rank: 0,
        avatar: user.avatar
      }))
      .sort((a, b) => b.value - a.value)
      .map((entry, index) => ({ ...entry, rank: index + 1 }))
      .slice(0, 100);

    // Countries Visited Leaderboard
    leaderboards.countries = users
      .map(user => ({
        userId: user.id,
        name: user.name,
        value: user.statsCache.lifetime.countries.length,
        rank: 0,
        avatar: user.avatar
      }))
      .sort((a, b) => b.value - a.value)
      .map((entry, index) => ({ ...entry, rank: index + 1 }))
      .slice(0, 100);

    // XP Leaderboard
    leaderboards.xp = users
      .map(user => ({
        userId: user.id,
        name: user.name,
        value: user.xp,
        rank: 0,
        avatar: user.avatar
      }))
      .sort((a, b) => b.value - a.value)
      .map((entry, index) => ({ ...entry, rank: index + 1 }))
      .slice(0, 100);

    return leaderboards;
  }

  /**
   * Check if aircraft is wide-body
   */
  private static isWideBodAircraft(aircraftType: string): boolean {
    const wideBodies = [
      'A330', 'A340', 'A350', 'A380',
      'B747', 'B767', 'B777', 'B787',
      'MD-11', 'DC-10', 'L-1011'
    ];
    
    return wideBodies.some(type => aircraftType.toUpperCase().includes(type));
  }

  /**
   * Calculate friend comparison stats
   */
  static calculateFriendComparison(userStats: any, friendStats: any[]) {
    const comparisons = [];
    
    // Total flights comparison
    const avgFlights = friendStats.reduce((sum, friend) => sum + friend.flights, 0) / friendStats.length;
    comparisons.push({
      category: 'Total Flights',
      userValue: userStats.flights,
      friendsAverage: Math.round(avgFlights),
      percentile: this.calculatePercentile(userStats.flights, friendStats.map(f => f.flights))
    });

    // Total miles comparison
    const avgMiles = friendStats.reduce((sum, friend) => sum + friend.milesMi, 0) / friendStats.length;
    comparisons.push({
      category: 'Total Miles',
      userValue: userStats.milesMi,
      friendsAverage: Math.round(avgMiles),
      percentile: this.calculatePercentile(userStats.milesMi, friendStats.map(f => f.milesMi))
    });

    // Countries comparison
    const avgCountries = friendStats.reduce((sum, friend) => sum + friend.countries.length, 0) / friendStats.length;
    comparisons.push({
      category: 'Countries Visited',
      userValue: userStats.countries.length,
      friendsAverage: Math.round(avgCountries),
      percentile: this.calculatePercentile(userStats.countries.length, friendStats.map(f => f.countries.length))
    });

    return comparisons;
  }

  /**
   * Calculate percentile ranking
   */
  private static calculatePercentile(userValue: number, friendValues: number[]): number {
    const belowUser = friendValues.filter(value => value < userValue).length;
    return Math.round((belowUser / friendValues.length) * 100);
  }
}
