/**
 * Comprehensive Aircraft Achievement System
 * Covers ALL major aircraft types in aviation
 */

export interface AircraftAchievement {
  id: string;
  name: string;
  description: string;
  xp: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'narrow-body' | 'wide-body' | 'regional' | 'superjumbo' | 'cargo' | 'vintage' | 'military';
}

export class AircraftAchievementEngine {
  
  /**
   * Get achievement for any aircraft type
   */
  static getAircraftAchievement(aircraftType: string): AircraftAchievement | null {
    const type = aircraftType.toLowerCase().replace(/[-\s]/g, '');
    
    // Airbus Family
    if (type.includes('a380')) {
      return {
        id: 'superjumbo_a380',
        name: 'Superjumbo Explorer',
        description: 'Flew on the mighty Airbus A380 - World\'s largest passenger airliner',
        xp: 200,
        rarity: 'legendary',
        category: 'superjumbo'
      };
    }
    
    if (type.includes('a350')) {
      return {
        id: 'dreamliner_competitor',
        name: 'XWB Pioneer',
        description: 'Experienced the ultra-modern Airbus A350 with carbon fiber fuselage',
        xp: 150,
        rarity: 'epic',
        category: 'wide-body'
      };
    }
    
    if (type.includes('a340')) {
      return {
        id: 'four_engine_classic',
        name: 'Quad Power',
        description: 'Flew on the 4-engine Airbus A340 - Classic long-haul workhorse',
        xp: 120,
        rarity: 'rare',
        category: 'wide-body'
      };
    }
    
    if (type.includes('a330')) {
      return {
        id: 'versatile_twin',
        name: 'Twin Engine Master',
        description: 'Experienced the versatile Airbus A330 - Perfect for medium to long haul',
        xp: 100,
        rarity: 'rare',
        category: 'wide-body'
      };
    }
    
    if (type.includes('a321')) {
      return {
        id: 'stretched_narrow',
        name: 'Narrow-Body Giant',
        description: 'Flew on the Airbus A321 - Longest single-aisle aircraft',
        xp: 75,
        rarity: 'common',
        category: 'narrow-body'
      };
    }
    
    if (type.includes('a320') && type.includes('neo')) {
      return {
        id: 'neo_generation',
        name: 'New Engine Pioneer',
        description: 'Experienced the fuel-efficient Airbus A320neo with next-gen engines',
        xp: 80,
        rarity: 'common',
        category: 'narrow-body'
      };
    }
    
    if (type.includes('a320')) {
      return {
        id: 'european_narrow',
        name: 'European Excellence',
        description: 'Flew on the Airbus A320 family - Europe\'s answer to the 737',
        xp: 50,
        rarity: 'common',
        category: 'narrow-body'
      };
    }
    
    if (type.includes('a319')) {
      return {
        id: 'compact_airbus',
        name: 'Compact Cruiser',
        description: 'Experienced the smaller Airbus A319 - Perfect for shorter routes',
        xp: 45,
        rarity: 'common',
        category: 'narrow-body'
      };
    }
    
    // Boeing Family
    if (type.includes('747') && type.includes('8')) {
      return {
        id: 'queen_of_skies_8',
        name: 'Modern Queen',
        description: 'Flew on the Boeing 747-8 - Latest evolution of the Queen of the Skies',
        xp: 180,
        rarity: 'legendary',
        category: 'wide-body'
      };
    }
    
    if (type.includes('747')) {
      return {
        id: 'queen_of_skies',
        name: 'Queen of the Skies',
        description: 'Experienced the iconic Boeing 747 - The aircraft that democratized air travel',
        xp: 150,
        rarity: 'epic',
        category: 'wide-body'
      };
    }
    
    if (type.includes('787')) {
      return {
        id: 'dreamliner',
        name: 'Dreamliner Experience',
        description: 'Flew on the Boeing 787 Dreamliner - Revolutionary composite aircraft',
        xp: 140,
        rarity: 'epic',
        category: 'wide-body'
      };
    }
    
    if (type.includes('777') && type.includes('300er')) {
      return {
        id: 'triple_seven_er',
        name: 'Extended Range Master',
        description: 'Experienced the Boeing 777-300ER - Ultra long-range twin-engine giant',
        xp: 130,
        rarity: 'rare',
        category: 'wide-body'
      };
    }
    
    if (type.includes('777')) {
      return {
        id: 'triple_seven',
        name: 'Triple Seven',
        description: 'Flew on the Boeing 777 - World\'s largest twin-engine airliner',
        xp: 120,
        rarity: 'rare',
        category: 'wide-body'
      };
    }
    
    if (type.includes('767')) {
      return {
        id: 'medium_wide',
        name: 'Medium Wide-Body',
        description: 'Experienced the Boeing 767 - Perfect for trans-Atlantic routes',
        xp: 90,
        rarity: 'common',
        category: 'wide-body'
      };
    }
    
    if (type.includes('757')) {
      return {
        id: 'flying_pencil',
        name: 'The Flying Pencil',
        description: 'Flew on the Boeing 757 - Narrow-body with wide-body performance',
        xp: 85,
        rarity: 'rare',
        category: 'narrow-body'
      };
    }
    
    if (type.includes('737') && type.includes('max')) {
      return {
        id: 'max_generation',
        name: 'MAX Generation',
        description: 'Experienced the Boeing 737 MAX - Latest evolution of the 737 family',
        xp: 60,
        rarity: 'common',
        category: 'narrow-body'
      };
    }
    
    if (type.includes('737') && type.includes('800')) {
      return {
        id: 'workhorse_800',
        name: 'Workhorse 800',
        description: 'Flew on the Boeing 737-800 - Most popular variant of the 737 family',
        xp: 50,
        rarity: 'common',
        category: 'narrow-body'
      };
    }
    
    if (type.includes('737')) {
      return {
        id: 'american_workhorse',
        name: 'American Workhorse',
        description: 'Experienced the Boeing 737 - World\'s most popular commercial aircraft',
        xp: 45,
        rarity: 'common',
        category: 'narrow-body'
      };
    }
    
    // Embraer Family
    if (type.includes('e190') || type.includes('e195')) {
      return {
        id: 'brazilian_large_regional',
        name: 'Brazilian Excellence',
        description: 'Flew on the Embraer E-Jet - Brazil\'s contribution to aviation',
        xp: 70,
        rarity: 'common',
        category: 'regional'
      };
    }
    
    if (type.includes('e170') || type.includes('e175')) {
      return {
        id: 'regional_comfort',
        name: 'Regional Comfort',
        description: 'Experienced the Embraer E170/175 - Comfortable regional flying',
        xp: 60,
        rarity: 'common',
        category: 'regional'
      };
    }
    
    // Bombardier Family
    if (type.includes('crj') || type.includes('canadair')) {
      return {
        id: 'canadian_regional',
        name: 'Canadian Regional',
        description: 'Flew on a Bombardier CRJ - Canadian regional jet excellence',
        xp: 55,
        rarity: 'common',
        category: 'regional'
      };
    }
    
    if (type.includes('dash') || type.includes('q400')) {
      return {
        id: 'turboprop_master',
        name: 'Turboprop Master',
        description: 'Experienced a Bombardier Dash 8 - Efficient turboprop flying',
        xp: 65,
        rarity: 'rare',
        category: 'regional'
      };
    }
    
    // ATR Family
    if (type.includes('atr')) {
      return {
        id: 'island_hopper',
        name: 'Island Hopper',
        description: 'Flew on an ATR turboprop - Perfect for short island routes',
        xp: 60,
        rarity: 'common',
        category: 'regional'
      };
    }
    
    // McDonnell Douglas / MD Family
    if (type.includes('md11')) {
      return {
        id: 'trijet_classic',
        name: 'Trijet Classic',
        description: 'Experienced the MD-11 - Last of the great tri-jets',
        xp: 120,
        rarity: 'epic',
        category: 'wide-body'
      };
    }
    
    if (type.includes('md80') || type.includes('md88') || type.includes('md90')) {
      return {
        id: 'mad_dog',
        name: 'Mad Dog',
        description: 'Flew on an MD-80 series - The "Mad Dog" of aviation',
        xp: 85,
        rarity: 'rare',
        category: 'narrow-body'
      };
    }
    
    if (type.includes('dc10')) {
      return {
        id: 'vintage_trijet',
        name: 'Vintage Tri-Jet',
        description: 'Experienced the classic DC-10 - Vintage wide-body excellence',
        xp: 110,
        rarity: 'epic',
        category: 'wide-body'
      };
    }
    
    // Concorde (if someone somehow flies on one)
    if (type.includes('concorde')) {
      return {
        id: 'supersonic_legend',
        name: 'Supersonic Legend',
        description: 'Flew on Concorde - The supersonic dream (museum/special flight)',
        xp: 1000,
        rarity: 'legendary',
        category: 'vintage'
      };
    }
    
    // Generic categories for unknown aircraft
    if (type.includes('cargo') || type.includes('freight')) {
      return {
        id: 'cargo_rider',
        name: 'Cargo Rider',
        description: 'Flew on a cargo aircraft - Behind-the-scenes aviation',
        xp: 100,
        rarity: 'rare',
        category: 'cargo'
      };
    }
    
    // Default for any other aircraft
    return {
      id: 'aircraft_explorer',
      name: 'Aircraft Explorer',
      description: `Experienced the ${aircraftType} - Adding to your aircraft collection`,
      xp: 40,
      rarity: 'common',
      category: 'narrow-body'
    };
  }
  
  /**
   * Get manufacturer bonus
   */
  static getManufacturerBonus(manufacturer: string): number {
    const bonuses: Record<string, number> = {
      'Airbus': 10,
      'Boeing': 10,
      'Embraer': 15,
      'Bombardier': 15,
      'ATR': 20,
      'McDonnell Douglas': 25, // Vintage bonus
      'Lockheed': 30, // Rare
      'Tupolev': 40, // Very rare
      'Antonov': 50 // Ultra rare
    };
    
    return bonuses[manufacturer] || 5;
  }
  
  /**
   * Check for aircraft family achievements
   */
  static checkFamilyAchievements(userAircraftHistory: string[]): AircraftAchievement[] {
    const achievements: AircraftAchievement[] = [];
    
    // Boeing 737 Family Collector
    const boeing737Variants = userAircraftHistory.filter(aircraft => 
      aircraft.toLowerCase().includes('737')).length;
    
    if (boeing737Variants >= 5) {
      achievements.push({
        id: 'boeing_737_collector',
        name: '737 Family Collector',
        description: 'Flew on 5+ different Boeing 737 variants',
        xp: 200,
        rarity: 'rare',
        category: 'narrow-body'
      });
    }
    
    // Airbus A320 Family Collector
    const airbusA320Family = userAircraftHistory.filter(aircraft => 
      aircraft.toLowerCase().includes('a32')).length;
    
    if (airbusA320Family >= 4) {
      achievements.push({
        id: 'airbus_a320_collector',
        name: 'A320 Family Master',
        description: 'Experienced the complete Airbus A320 family',
        xp: 180,
        rarity: 'rare',
        category: 'narrow-body'
      });
    }
    
    // Wide-Body Enthusiast
    const wideBodies = userAircraftHistory.filter(aircraft => 
      this.isWideBodAircraft(aircraft)).length;
    
    if (wideBodies >= 10) {
      achievements.push({
        id: 'wide_body_enthusiast',
        name: 'Wide-Body Enthusiast',
        description: 'Flew on 10+ different wide-body aircraft',
        xp: 500,
        rarity: 'epic',
        category: 'wide-body'
      });
    }
    
    return achievements;
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
    
    return wideBodies.some(type => 
      aircraftType.toUpperCase().includes(type.replace('B', ''))
    );
  }
}
