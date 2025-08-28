/**
 * Flight Intelligence Engine
 * The ultimate "Enter flight number → Get EVERYTHING" system
 */

import { AirportDatabase } from './airport-database';
import { AircraftDatabase } from './aircraft-database';
import { flightEnricher } from './opensky';
import { GlobalFlightAPI, GlobalFlightData } from './global-flight-api';

export interface ComprehensiveFlightData {
  // Basic Info
  flightNumber: string;
  airline: {
    code: string;
    name: string;
    country: string;
    founded: number;
    alliance?: string;
    logo?: string;
    reputation: number; // 1-10
  };
  
  // Route Intelligence
  route: {
    from: {
      iata: string;
      name: string;
      city: string;
      country: string;
      timezone: string;
      elevation: number;
      terminals: number;
      runways: number;
    };
    to: {
      iata: string;
      name: string;
      city: string;
      country: string;
      timezone: string;
      elevation: number;
      terminals: number;
      runways: number;
    };
    distance: number;
    duration: number;
    isDomestic: boolean;
    timeZoneDiff: number;
  };
  
  // Aircraft Intelligence
  aircraft: {
    type: string;
    manufacturer: string;
    variant?: string;
    capacity: {
      economy: number;
      business: number;
      first: number;
      total: number;
    };
    engines: {
      count: number;
      type: string;
      manufacturer: string;
    };
    performance: {
      cruiseSpeed: number;
      maxSpeed: number;
      range: number;
      ceiling: number;
    };
    age?: number;
    registration?: string;
    firstFlight?: string;
    interiorFeatures: string[];
  };
  
  // Real-time Data
  realtime?: {
    status: 'scheduled' | 'departed' | 'airborne' | 'landed' | 'delayed' | 'cancelled';
    position?: { lat: number; lon: number; altitude: number };
    speed?: number;
    heading?: number;
    estimatedArrival?: string;
    delay?: number;
  };
  
  // Social Layer
  social: {
    friendsFlown: Array<{
      userId: string;
      name: string;
      avatar?: string;
      date: string;
      rating: number;
      review?: string;
    }>;
    globalStats: {
      totalFlights: number;
      averageRating: number;
      popularityRank: number;
    };
    insights: string[];
  };
  
  // Historical Data
  historical: {
    onTimePerformance: number;
    averageDelay: number;
    cancellationRate: number;
    bestMonths: string[];
    worstMonths: string[];
  };
  
  // Experience Insights
  experience: {
    highlights: string[];
    tips: string[];
    warnings: string[];
    bestSeats: string[];
    worstSeats: string[];
    foodRating: number;
    serviceRating: number;
    entertainmentRating: number;
  };
}

// Comprehensive airline database
const airlineDatabase = {
  // Indian Airlines
  'QP': {
    name: 'Akasa Air',
    country: 'India',
    founded: 2022,
    alliance: 'Independent',
    reputation: 8.5,
    fleet: ['Boeing 737 MAX 8'],
    hubs: ['BOM', 'BLR', 'DEL'],
    notes: 'India\'s newest airline with modern fleet'
  },
  '6E': {
    name: 'IndiGo',
    country: 'India', 
    founded: 2006,
    alliance: 'Independent',
    reputation: 8.2,
    fleet: ['Airbus A320neo', 'Airbus A321neo', 'ATR 72'],
    hubs: ['DEL', 'BOM', 'BLR', 'HYD'],
    notes: 'India\'s largest airline by market share'
  },
  'AI': {
    name: 'Air India',
    country: 'India',
    founded: 1932,
    alliance: 'Star Alliance',
    reputation: 7.1,
    fleet: ['Boeing 787', 'Airbus A320', 'Boeing 777'],
    hubs: ['DEL', 'BOM'],
    notes: 'India\'s flag carrier, recently privatized'
  },
  
  // US Airlines
  'AA': {
    name: 'American Airlines',
    country: 'United States',
    founded: 1930,
    alliance: 'Oneworld',
    reputation: 7.8,
    fleet: ['Boeing 737', 'Airbus A320', 'Boeing 777', 'Boeing 787'],
    hubs: ['DFW', 'CLT', 'PHX', 'PHL'],
    notes: 'World\'s largest airline by fleet size'
  },
  'DL': {
    name: 'Delta Air Lines',
    country: 'United States',
    founded: 1924,
    alliance: 'SkyTeam',
    reputation: 8.4,
    fleet: ['Boeing 737', 'Airbus A320', 'Boeing 767', 'Airbus A350'],
    hubs: ['ATL', 'DTW', 'MSP', 'SEA'],
    notes: 'Known for excellent service and reliability'
  },
  
  // European Airlines
  'BA': {
    name: 'British Airways',
    country: 'United Kingdom',
    founded: 1974,
    alliance: 'Oneworld',
    reputation: 8.1,
    fleet: ['Airbus A320', 'Boeing 777', 'Boeing 787', 'Airbus A380'],
    hubs: ['LHR', 'LGW'],
    notes: 'UK\'s flag carrier with premium service focus'
  },
  'LH': {
    name: 'Lufthansa',
    country: 'Germany',
    founded: 1953,
    alliance: 'Star Alliance',
    reputation: 8.6,
    fleet: ['Airbus A320', 'Boeing 747', 'Airbus A380', 'Boeing 777'],
    hubs: ['FRA', 'MUC'],
    notes: 'Europe\'s largest airline group'
  },
  
  // Middle Eastern Airlines
  'EK': {
    name: 'Emirates',
    country: 'United Arab Emirates',
    founded: 1985,
    alliance: 'Independent',
    reputation: 9.2,
    fleet: ['Airbus A380', 'Boeing 777'],
    hubs: ['DXB'],
    notes: 'Luxury airline with the world\'s largest A380 fleet'
  },
  'QR': {
    name: 'Qatar Airways',
    country: 'Qatar',
    founded: 1993,
    alliance: 'Oneworld',
    reputation: 9.4,
    fleet: ['Airbus A350', 'Boeing 777', 'Boeing 787', 'Airbus A380'],
    hubs: ['DOH'],
    notes: 'Multiple "Airline of the Year" awards winner'
  },
  
  // Asian Airlines
  'SQ': {
    name: 'Singapore Airlines',
    country: 'Singapore',
    founded: 1947,
    alliance: 'Star Alliance',
    reputation: 9.5,
    fleet: ['Airbus A350', 'Boeing 777', 'Boeing 787', 'Airbus A380'],
    hubs: ['SIN'],
    notes: 'Consistently rated world\'s best airline'
  }
};

class FlightIntelligenceEngine {
  /**
   * Get EVERYTHING about a flight from just the flight number
   */
  async getComprehensiveFlightData(flightNumber: string, date?: string): Promise<ComprehensiveFlightData | null> {
    try {
      console.log(`🌍 Looking up ${flightNumber} globally...`);
      
      // 1. Use Global Flight API for ANY flight worldwide (NO DATABASES!)
      const globalData = await GlobalFlightAPI.lookupFlight(flightNumber);
      
      if (!globalData) {
        console.log(`❌ No global data found for ${flightNumber}`);
        return null;
      }
      
      console.log(`✅ Found ${flightNumber}: ${globalData.route.departure.city} → ${globalData.route.arrival.city}`);
      
      // 2. Convert to comprehensive format
      return this.convertGlobalToComprehensive(globalData);
    } catch (error) {
      console.error('Flight intelligence error:', error);
      return null;
    }
  }

  /**
   * Convert global flight data to comprehensive format
   */
  private convertGlobalToComprehensive(globalData: GlobalFlightData): ComprehensiveFlightData {
    return {
      flightNumber: globalData.flightNumber,
      
      airline: {
        code: globalData.airline.code,
        name: globalData.airline.name,
        country: globalData.airline.country || 'Unknown',
        founded: 2000,
        alliance: null,
        reputation: 7.5,
      },
      
      route: {
        airports: {
          from: {
            iata: globalData.route.departure.iata,
            name: globalData.route.departure.airport,
            city: globalData.route.departure.city,
            country: globalData.route.departure.country
          },
          to: {
            iata: globalData.route.arrival.iata,
            name: globalData.route.arrival.airport,
            city: globalData.route.arrival.city,
            country: globalData.route.arrival.country
          }
        },
        distance: globalData.route.distance,
        duration: globalData.route.duration,
        isDomestic: globalData.route.departure.country === globalData.route.arrival.country,
        timeZoneDiff: 0
      },
      
      aircraft: {
        type: globalData.aircraft.type,
        manufacturer: globalData.aircraft.manufacturer || 'Unknown',
        registration: globalData.aircraft.registration || 'Unknown',
        specs: {
          dataSource: 'global-api',
          category: this.getAircraftCategory(globalData.aircraft.type),
          isLiveData: true
        }
      },
      
      realtime: globalData.status.position ? {
        status: globalData.status.current,
        position: globalData.status.position
      } : undefined,
      
      social: {
        friendsFlown: [],
        insights: [`✈️ Real-time flight data for ${globalData.flightNumber}`]
      },
      
      historical: {
        onTimePerformance: 85,
        averageDelay: 12,
        popularity: 7.5
      },
      
      experience: {
        highlights: [`Flying ${globalData.aircraft.type}`, `${globalData.route.distance} mile journey`],
        tips: ['Check in online for best seats', 'Arrive 2 hours early'],
        bestSeats: ['6A', '6F'],
        worstSeats: ['Last row', 'Middle seats']
      }
    };
  }


  // Helper methods for the comprehensive data
  private getAircraftCategory(model?: string): string {
    if (!model) return 'unknown';
    
    const modelUpper = model.toUpperCase();
    
    const wideBodies = [
      'A330', 'A340', 'A350', 'A380', 'A400',
      'B747', 'B767', 'B777', 'B787', 'B747-8',
      'MD-11', 'DC-10', 'L-1011'
    ];
    
    const regionals = [
      'ATR', 'CRJ', 'ERJ', 'DASH', 'DHC',
      'SAAB', 'EMB', 'BAE', 'DO328'
    ];
    
    for (const pattern of wideBodies) {
      if (modelUpper.includes(pattern)) return 'wide-body';
    }
    
    for (const pattern of regionals) {
      if (modelUpper.includes(pattern)) return 'regional';
    }
    
    return 'narrow-body';
  }

  private extractAirlineCode(flightNumber: string): string {
    const patterns = [
      /^([A-Z]{2})\d+$/,    // Two letters + numbers (QP1728, AA123)
      /^([A-Z]{3})\d+$/,    // Three letters + numbers (SWA123)
      /^([A-Z]\d)[A-Z]?\d+$/ // Letter + digit pattern (9W123)
    ];
    
    for (const pattern of patterns) {
      const match = flightNumber.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return flightNumber.substring(0, 2);
  }
}

export const flightIntelligence = new FlightIntelligenceEngine();
