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
            country: fromAirport.country,
            timezone: fromAirport.timezone,
            elevation: fromAirport.elevation,
            terminals: this.getAirportTerminals(fromAirport.iata),
            runways: this.getAirportRunways(fromAirport.iata),
          },
          to: {
            iata: toAirport.iata,
            name: toAirport.name,
            city: toAirport.city,
            country: toAirport.country,
            timezone: toAirport.timezone,
            elevation: toAirport.elevation,
            terminals: this.getAirportTerminals(toAirport.iata),
            runways: this.getAirportRunways(toAirport.iata),
          },
          distance: enrichedData.route.distance!,
          duration: enrichedData.route.duration!,
          isDomestic: fromAirport.country === toAirport.country,
          timeZoneDiff: this.calculateTimeZoneDiff(fromAirport.timezone, toAirport.timezone),
        },
        
        aircraft: {
          type: aircraftInfo?.model || this.getTypicalAircraft(airlineCode, enrichedData.route?.distance || 0),
          manufacturer: aircraftInfo?.manufacturer || this.getManufacturerFromAircraft(aircraftInfo?.model || this.getTypicalAircraft(airlineCode, enrichedData.route?.distance || 0)),
          registration: aircraftInfo?.registration || 'Live lookup required',
          icaoType: aircraftInfo?.icaoAircraftType || null,
          specs: {
            dataSource: aircraftInfo?.model ? 'real-time' : 'airline-typical',
            category: this.getAircraftCategory(aircraftInfo?.model || this.getTypicalAircraft(airlineCode, enrichedData.route?.distance || 0)),
            age: aircraftInfo?.built ? new Date().getFullYear() - parseInt(aircraftInfo.built) : null,
            isLiveData: !!aircraftInfo?.model
          }
        },
        
        realtime: enrichedData.realtime,
        
        social: {
          friendsFlown: [], // This would be populated from user's friends' flight data
          globalStats: {
            totalFlights: Math.floor(Math.random() * 10000) + 1000, // Mock data
            averageRating: 4.2 + Math.random() * 0.6,
            popularityRank: Math.floor(Math.random() * 1000) + 1,
          },
          insights: this.generateInsights(fromAirport, toAirport, airlineInfo),
        },
        
        historical: {
          onTimePerformance: 75 + Math.random() * 20, // Mock data
          averageDelay: Math.random() * 30,
          cancellationRate: Math.random() * 5,
          bestMonths: ['October', 'November', 'December'],
          worstMonths: ['June', 'July', 'August'],
        },
        
        experience: {
          highlights: this.getFlightHighlights(fromAirport, toAirport, airlineCode),
          tips: this.getFlightTips(fromAirport, toAirport, airlineCode),
          warnings: this.getFlightWarnings(fromAirport, toAirport),
          bestSeats: this.getBestSeats(enrichedData.aircraft?.model),
          worstSeats: this.getWorstSeats(enrichedData.aircraft?.model),
          foodRating: (airlineInfo?.reputation || 7) + Math.random() * 1 - 0.5,
          serviceRating: (airlineInfo?.reputation || 7) + Math.random() * 1 - 0.5,
          entertainmentRating: Math.random() * 3 + 6,
        },
      };
      
      return comprehensiveData;
      
    } catch (error) {
      console.error('Flight intelligence error:', error);
      return null;
    }
  }
  
  private extractAirlineCode(flightNumber: string): string {
    // Handle different airline code patterns
    const patterns = [
      /^([A-Z]{2})\d+$/,    // Two letters + numbers (AA123, QP1457)
      /^([A-Z]{3})\d+$/,    // Three letters + numbers (SWA123)
      /^([A-Z]\d)[A-Z]?\d+$/, // Letter + digit pattern (9W123)
    ];
    
    for (const pattern of patterns) {
      const match = flightNumber.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    // Fallback to first 2 characters
    return flightNumber.substring(0, 2);
  }
  
  private getAirportTerminals(iata: string): number {
    const terminalData: Record<string, number> = {
      'JFK': 6, 'LAX': 9, 'LHR': 5, 'CDG': 3, 'DXB': 3,
      'BOM': 2, 'BLR': 2, 'DEL': 3, 'SIN': 4, 'NRT': 3
    };
    return terminalData[iata] || 1;
  }
  
  private getAirportRunways(iata: string): number {
    const runwayData: Record<string, number> = {
      'JFK': 4, 'LAX': 4, 'LHR': 2, 'CDG': 4, 'DXB': 2,
      'BOM': 2, 'BLR': 1, 'DEL': 3, 'SIN': 2, 'NRT': 3
    };
    return runwayData[iata] || 2;
  }
  
  private calculateTimeZoneDiff(tz1: string, tz2: string): number {
    // Simplified timezone difference calculation
    const timezoneOffsets: Record<string, number> = {
      'Asia/Kolkata': 5.5,
      'America/New_York': -5,
      'America/Los_Angeles': -8,
      'Europe/London': 0,
      'Europe/Paris': 1,
      'Asia/Dubai': 4,
      'Asia/Singapore': 8,
      'Asia/Tokyo': 9,
    };
    
    const offset1 = timezoneOffsets[tz1] || 0;
    const offset2 = timezoneOffsets[tz2] || 0;
    return Math.abs(offset2 - offset1);
  }
  
  private getEngineManufacturer(aircraftManufacturer?: string): string {
    if (aircraftManufacturer?.includes('Boeing')) return 'CFM International';
    if (aircraftManufacturer?.includes('Airbus')) return 'CFM International';
    return 'CFM International';
  }
  
  private getAircraftFirstFlight(model?: string): string {
    const firstFlights: Record<string, string> = {
      'A320': '1987-02-22',
      'A321': '1993-03-11', 
      'A350': '2013-06-14',
      '737': '1967-04-09',
      '737 MAX 8': '2016-01-29',
      '777': '1994-06-12',
      '787': '2009-12-15',
    };
    return firstFlights[model || ''] || 'Unknown';
  }
  
  private getAircraftFeatures(model?: string): string[] {
    const features: Record<string, string[]> = {
      'A320': ['LED Cabin Lighting', 'WiFi Available', 'Power Outlets'],
      '737 MAX 8': ['Sky Interior', 'WiFi', 'USB Power', 'LED Mood Lighting'],
      '787': ['Dreamliner Windows', 'Cabin Pressure', 'Humidity Control', 'WiFi'],
      'A350': ['Ambient Lighting', 'Quiet Cabin', 'WiFi', 'Personal Device Power'],
    };
    return features[model || ''] || ['Standard Amenities'];
  }
  
  private generateInsights(fromAirport: any, toAirport: any, airlineInfo: any): string[] {
    const insights = [];
    
    if (fromAirport.country !== toAirport.country) {
      insights.push('🌍 International flight - bring your passport!');
    }
    
    if (airlineInfo?.reputation > 8.5) {
      insights.push('⭐ Premium airline with excellent service ratings');
    }
    
    insights.push(`✈️ Popular route with ${Math.floor(Math.random() * 50 + 10)} daily flights`);
    insights.push(`🕐 Best booking time: ${Math.floor(Math.random() * 8 + 6)} weeks in advance`);
    
    return insights;
  }
  
  private getFlightHighlights(fromAirport: any, toAirport: any, airlineCode: string): string[] {
    return [
      '🌅 Beautiful sunrise views during takeoff',
      '🏔️ Scenic mountain views during cruise',
      '🍽️ Complimentary meal service',
      '📺 In-flight entertainment system',
    ];
  }
  
  private getFlightTips(fromAirport: any, toAirport: any, airlineCode: string): string[] {
    return [
      '💺 Book seats 24hrs before for better selection',
      '🧳 Check baggage allowance before packing',
      '📱 Download airline app for mobile boarding pass',
      '⏰ Arrive 2 hours early for domestic flights',
    ];
  }
  
  private getFlightWarnings(fromAirport: any, toAirport: any): string[] {
    const warnings = [];
    
    if (fromAirport.elevation > 5000) {
      warnings.push('🏔️ High altitude airport - potential weather delays');
    }
    
    if (Math.random() > 0.7) {
      warnings.push('⛈️ Monsoon season - possible weather disruptions');
    }
    
    return warnings;
  }
  
  private getBestSeats(model?: string): string[] {
    const bestSeats: Record<string, string[]> = {
      'A320': ['6A', '6F', '7A', '7F'],
      '737': ['6A', '6F', '7A', '7F'], 
      'A350': ['6A', '6K', '7A', '7K'],
    };
    return bestSeats[model || ''] || ['6A', '6F'];
  }
  
  private getWorstSeats(model?: string): string[] {
    return ['Last row', 'Middle seats near galleys', 'Seats near lavatories'];
  }
  
  /**
   * Get aircraft category from model name
   */
  private getAircraftCategory(model?: string): string {
    if (!model) return 'unknown';
    
    const modelUpper = model.toUpperCase();
    
    // Wide-body aircraft patterns
    const wideBodies = [
      'A330', 'A340', 'A350', 'A380', 'A400',
      'B747', 'B767', 'B777', 'B787', 'B747-8',
      'MD-11', 'DC-10', 'L-1011'
    ];
    
    // Regional aircraft patterns  
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
    
    // Default to narrow-body for most commercial aircraft
    return 'narrow-body';
  }

  /**
   * Get manufacturer from aircraft model
   */
  private getManufacturerFromAircraft(aircraft: string): string {
    if (!aircraft) return 'Unknown';
    
    const aircraftUpper = aircraft.toUpperCase();
    
    if (aircraftUpper.includes('BOEING') || aircraftUpper.includes('B737') || aircraftUpper.includes('B777') || aircraftUpper.includes('B787') || aircraftUpper.includes('B747')) {
      return 'Boeing';
    }
    if (aircraftUpper.includes('AIRBUS') || aircraftUpper.includes('A320') || aircraftUpper.includes('A330') || aircraftUpper.includes('A340') || aircraftUpper.includes('A350') || aircraftUpper.includes('A380')) {
      return 'Airbus';
    }
    if (aircraftUpper.includes('EMBRAER') || aircraftUpper.includes('ERJ') || aircraftUpper.includes('EMB')) {
      return 'Embraer';
    }
    if (aircraftUpper.includes('BOMBARDIER') || aircraftUpper.includes('CRJ') || aircraftUpper.includes('DASH')) {
      return 'Bombardier';
    }
    if (aircraftUpper.includes('ATR')) {
      return 'ATR';
    }
    
    return 'Unknown';
  }

  /**
   * Get real-time aircraft data from multiple aviation APIs
   */
  private async getRealTimeAircraftData(flightNumber: string): Promise<any> {
    try {
      // Try multiple real-time aviation APIs
      const apiCalls = [
        this.tryAviationStackAPI(flightNumber),
        this.tryFlightAwareAPI(flightNumber),
        this.tryOpenSkyAdvanced(flightNumber)
      ];
      
      const results = await Promise.allSettled(apiCalls);
      
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          return result.value;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Real-time aircraft lookup failed:', error);
      return null;
    }
  }

  private async tryAviationStackAPI(flightNumber: string): Promise<any> {
    // AviationStack API call (if we had API key)
    // For now, return null to continue to next provider
    return null;
  }

  private async tryFlightAwareAPI(flightNumber: string): Promise<any> {
    // FlightAware API call (if we had API key) 
    // For now, return null to continue to next provider
    return null;
  }

  private async tryOpenSkyAdvanced(flightNumber: string): Promise<any> {
    // Enhanced OpenSky lookup with flight number correlation
    const opensky = new OpenSkyAPI();
    
    // Get all current flights and filter by callsign
    const allFlights = await opensky.getAllFlights();
    const matchingFlights = allFlights.filter(flight => 
      flight.callsign && flight.callsign.trim().toUpperCase().includes(flightNumber.toUpperCase())
    );
    
    if (matchingFlights.length > 0) {
      const flight = matchingFlights[0];
      const aircraftInfo = await opensky.getAircraftInfo(flight.icao24);
      
      return {
        aircraftType: aircraftInfo?.model || 'Unknown',
        registration: aircraftInfo?.registration,
        airline: aircraftInfo?.operator,
        manufacturer: aircraftInfo?.manufacturerName,
        position: {
          latitude: flight.latitude,
          longitude: flight.longitude,
          altitude: flight.altitude,
          velocity: flight.velocity
        },
        status: flight.on_ground ? 'on_ground' : 'airborne'
      };
    }
    
    return null;
  }

  /**
   * Intelligent aircraft type guessing based on airline and route
   */
  private guessAircraftType(airlineCode: string, distance: number): string | null {
    // Aircraft assignments based on airline preferences and route distance
    const airlineFleets: Record<string, { short: string[]; medium: string[]; long: string[] }> = {
      // Indian Airlines
      'QP': {
        short: ['Boeing 737 MAX 8'],
        medium: ['Boeing 737 MAX 8'],
        long: ['Boeing 737 MAX 8']
      },
      '6E': {
        short: ['Airbus A320neo', 'ATR 72'],
        medium: ['Airbus A320neo', 'Airbus A321neo'],
        long: ['Airbus A321neo']
      },
      'AI': {
        short: ['Airbus A320'],
        medium: ['Boeing 787-8', 'Airbus A320'],
        long: ['Boeing 777-300ER', 'Boeing 787-9']
      },
      
      // US Airlines
      'AA': {
        short: ['Boeing 737-800', 'Airbus A320'],
        medium: ['Boeing 737 MAX 8', 'Airbus A321'],
        long: ['Boeing 777-300ER', 'Boeing 787-9']
      },
      'DL': {
        short: ['Boeing 737-900', 'Airbus A320'],
        medium: ['Boeing 757-200', 'Airbus A321'],
        long: ['Airbus A350-900', 'Boeing 767-300']
      },
      'UA': {
        short: ['Boeing 737 MAX 9', 'Airbus A320'],
        medium: ['Boeing 757-200', 'Boeing 737 MAX 10'],
        long: ['Boeing 777-300ER', 'Boeing 787-10']
      },
      
      // European Airlines
      'BA': {
        short: ['Airbus A320', 'Boeing 737-800'],
        medium: ['Airbus A321neo', 'Boeing 787-8'],
        long: ['Boeing 777-300ER', 'Airbus A380-800']
      },
      'LH': {
        short: ['Airbus A320', 'Airbus A319'],
        medium: ['Airbus A321', 'Boeing 737-800'],
        long: ['Boeing 747-8', 'Airbus A350-900']
      },
      
      // Middle Eastern Airlines
      'EK': {
        short: ['Boeing 777-300ER'],
        medium: ['Boeing 777-300ER'],
        long: ['Airbus A380-800', 'Boeing 777-300ER']
      },
      'QR': {
        short: ['Airbus A320'],
        medium: ['Boeing 787-8'],
        long: ['Airbus A350-900', 'Boeing 777-300ER']
      },
      
      // Asian Airlines
      'SQ': {
        short: ['Airbus A320'],
        medium: ['Boeing 787-10'],
        long: ['Airbus A350-900', 'Airbus A380-800']
      }
    };
    
    const fleet = airlineFleets[airlineCode];
    if (!fleet) return null;
    
    // Choose aircraft based on distance
    let aircraftList: string[];
    if (distance < 1000) {
      aircraftList = fleet.short;
    } else if (distance < 3000) {
      aircraftList = fleet.medium;
    } else {
      aircraftList = fleet.long;
    }
    
    // Return the most common aircraft for this airline/distance
    return aircraftList[0] || null;
  }
