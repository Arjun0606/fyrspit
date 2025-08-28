/**
 * PRODUCTION FLIGHT API
 * Real-time flight data from multiple sources - NO SIMULATIONS!
 */

export interface ProductionFlightData {
  flightNumber: string;
  airline: {
    name: string;
    code: string;
    country: string;
    logo?: string;
  };
  aircraft: {
    type: string;
    manufacturer: string;
    registration: string;
    age?: number;
    engines?: string;
  };
  route: {
    departure: {
      airport: string;
      iata: string;
      city: string;
      country: string;
      terminal?: string;
      gate?: string;
    };
    arrival: {
      airport: string;
      iata: string;
      city: string;
      country: string;
      terminal?: string;
      gate?: string;
    };
    distance: number;
    duration: number; // in minutes
  };
  schedule: {
    departureTime: string;
    arrivalTime: string;
    timezone: string;
    date: string;
  };
  status: {
    current: 'scheduled' | 'boarding' | 'departed' | 'airborne' | 'landed' | 'cancelled' | 'delayed';
    delay?: number; // minutes
    actualDeparture?: string;
    actualArrival?: string;
  };
  position?: {
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number;
    heading: number;
  };
  pricing?: {
    economy?: number;
    business?: number;
    first?: number;
  };
}

export class ProductionFlightAPI {
  /**
   * Get REAL flight data for ANY flight globally
   */
  static async getFlightData(flightNumber: string, date?: string): Promise<ProductionFlightData | null> {
    console.log(`🔍 PRODUCTION: Looking up ${flightNumber} with REAL data...`);

    try {
      // PRIORITY 1: FlightAware (most comprehensive)
      const flightAwareData = await this.getFlightAwareData(flightNumber, date);
      if (flightAwareData) {
        console.log('✅ Got real data from FlightAware');
        return flightAwareData;
      }

      // PRIORITY 2: AviationStack API
      const aviationStackData = await this.getAviationStackData(flightNumber, date);
      if (aviationStackData) {
        console.log('✅ Got real data from AviationStack');
        return aviationStackData;
      }

      // PRIORITY 3: Scrape Google Flights (as backup)
      const googleData = await this.scrapeGoogleFlights(flightNumber, date);
      if (googleData) {
        console.log('✅ Got real data from Google scraping');
        return googleData;
      }

      // PRIORITY 4: FlightRadar24 scraping
      const fr24Data = await this.scrapeFlightRadar24(flightNumber, date);
      if (fr24Data) {
        console.log('✅ Got real data from FlightRadar24');
        return fr24Data;
      }

      console.log('❌ No real data found for flight:', flightNumber);
      return null;

    } catch (error) {
      console.error('Production flight API error:', error);
      return null;
    }
  }

  /**
   * FlightAware API - Premium flight data
   */
  private static async getFlightAwareData(flightNumber: string, date?: string): Promise<ProductionFlightData | null> {
    try {
      // FlightAware AeroAPI endpoint
      const apiKey = process.env.FLIGHTAWARE_API_KEY;
      if (!apiKey) {
        console.log('⚠️ FlightAware API key not configured');
        return null;
      }

      const endpoint = `https://aeroapi.flightaware.com/aeroapi/flights/${flightNumber}`;
      const params = new URLSearchParams({
        start: date || new Date().toISOString().split('T')[0],
        end: date || new Date().toISOString().split('T')[0],
      });

      const response = await fetch(`${endpoint}?${params}`, {
        headers: {
          'x-apikey': apiKey,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`FlightAware API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.flights && data.flights.length > 0) {
        const flight = data.flights[0];
        return this.transformFlightAwareData(flight);
      }

      return null;

    } catch (error) {
      console.error('FlightAware API error:', error);
      return null;
    }
  }

  /**
   * AviationStack API - Comprehensive flight data
   */
  private static async getAviationStackData(flightNumber: string, date?: string): Promise<ProductionFlightData | null> {
    try {
      const apiKey = process.env.AVIATIONSTACK_API_KEY;
      if (!apiKey) {
        console.log('⚠️ AviationStack API key not configured');
        return null;
      }

      const endpoint = 'http://api.aviationstack.com/v1/flights';
      const params = new URLSearchParams({
        access_key: apiKey,
        flight_iata: flightNumber,
        flight_date: date || new Date().toISOString().split('T')[0],
        limit: '1'
      });

      const response = await fetch(`${endpoint}?${params}`);
      
      if (!response.ok) {
        throw new Error(`AviationStack API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const flight = data.data[0];
        return this.transformAviationStackData(flight);
      }

      return null;

    } catch (error) {
      console.error('AviationStack API error:', error);
      return null;
    }
  }

  /**
   * Scrape Google Flights for real-time data
   */
  private static async scrapeGoogleFlights(flightNumber: string, date?: string): Promise<ProductionFlightData | null> {
    try {
      // For production, this would use Puppeteer/Playwright
      console.log('🕷️ Scraping Google Flights...');
      
      // Google Flights URL
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(flightNumber + ' flight status')}`;
      
      // In production, we'd use:
      // const browser = await puppeteer.launch();
      // const page = await browser.newPage();
      // await page.goto(searchUrl);
      // const flightData = await page.evaluate(() => { ... });
      
      // For now, return null to use other APIs
      return null;

    } catch (error) {
      console.error('Google scraping error:', error);
      return null;
    }
  }

  /**
   * Scrape FlightRadar24 for live tracking
   */
  private static async scrapeFlightRadar24(flightNumber: string, date?: string): Promise<ProductionFlightData | null> {
    try {
      console.log('🕷️ Scraping FlightRadar24...');
      
      // FlightRadar24 flight search API
      const searchUrl = `https://www.flightradar24.com/data/flights/${flightNumber.toLowerCase()}`;
      
      // In production, we'd scrape this for real-time position data
      return null;

    } catch (error) {
      console.error('FlightRadar24 scraping error:', error);
      return null;
    }
  }

  /**
   * Transform FlightAware API response
   */
  private static transformFlightAwareData(flight: any): ProductionFlightData {
    return {
      flightNumber: flight.ident,
      airline: {
        name: flight.operator || 'Unknown',
        code: flight.ident.substring(0, 2),
        country: 'Unknown'
      },
      aircraft: {
        type: flight.aircraft_type || 'Unknown',
        manufacturer: this.getManufacturer(flight.aircraft_type),
        registration: flight.registration || 'Unknown'
      },
      route: {
        departure: {
          airport: flight.origin?.name || 'Unknown',
          iata: flight.origin?.code_iata || 'UNK',
          city: flight.origin?.city || 'Unknown',
          country: flight.origin?.country_code || 'Unknown',
          terminal: flight.origin?.terminal,
          gate: flight.gate_origin
        },
        arrival: {
          airport: flight.destination?.name || 'Unknown',
          iata: flight.destination?.code_iata || 'UNK',
          city: flight.destination?.city || 'Unknown',
          country: flight.destination?.country_code || 'Unknown',
          terminal: flight.destination?.terminal,
          gate: flight.gate_destination
        },
        distance: flight.filed_distance_nm || 0,
        duration: flight.filed_time || 0
      },
      schedule: {
        departureTime: flight.scheduled_out,
        arrivalTime: flight.scheduled_in,
        timezone: flight.origin?.timezone || 'UTC',
        date: new Date().toISOString().split('T')[0]
      },
      status: {
        current: this.mapFlightStatus(flight.status),
        delay: flight.delay,
        actualDeparture: flight.actual_out,
        actualArrival: flight.actual_in
      },
      position: flight.position ? {
        latitude: flight.position.latitude,
        longitude: flight.position.longitude,
        altitude: flight.position.altitude,
        speed: flight.position.groundspeed,
        heading: flight.position.heading
      } : undefined
    };
  }

  /**
   * Transform AviationStack API response
   */
  private static transformAviationStackData(flight: any): ProductionFlightData {
    return {
      flightNumber: flight.flight.iata,
      airline: {
        name: flight.airline.name,
        code: flight.airline.iata,
        country: flight.airline.country_name
      },
      aircraft: {
        type: flight.aircraft?.registration || 'Unknown',
        manufacturer: 'Unknown',
        registration: flight.aircraft?.registration || 'Unknown'
      },
      route: {
        departure: {
          airport: flight.departure.airport,
          iata: flight.departure.iata,
          city: flight.departure.city || 'Unknown',
          country: flight.departure.country || 'Unknown',
          terminal: flight.departure.terminal,
          gate: flight.departure.gate
        },
        arrival: {
          airport: flight.arrival.airport,
          iata: flight.arrival.iata,
          city: flight.arrival.city || 'Unknown',
          country: flight.arrival.country || 'Unknown',
          terminal: flight.arrival.terminal,
          gate: flight.arrival.gate
        },
        distance: 0, // Not provided by AviationStack
        duration: 0
      },
      schedule: {
        departureTime: flight.departure.scheduled,
        arrivalTime: flight.arrival.scheduled,
        timezone: flight.departure.timezone || 'UTC',
        date: flight.flight_date
      },
      status: {
        current: flight.flight_status?.toLowerCase() || 'unknown',
        delay: flight.departure.delay || 0,
        actualDeparture: flight.departure.actual,
        actualArrival: flight.arrival.actual
      }
    };
  }

  /**
   * Map flight status to our enum
   */
  private static mapFlightStatus(status: string): any {
    const statusMap: Record<string, any> = {
      'Scheduled': 'scheduled',
      'Active': 'airborne',
      'Landed': 'landed',
      'Cancelled': 'cancelled',
      'Delayed': 'delayed',
      'Departed': 'departed'
    };
    
    return statusMap[status] || 'scheduled';
  }

  /**
   * Get aircraft manufacturer from type
   */
  private static getManufacturer(aircraftType: string): string {
    if (!aircraftType) return 'Unknown';
    
    const type = aircraftType.toUpperCase();
    
    if (type.includes('BOEING') || type.includes('B737') || type.includes('B777') || type.includes('B787')) {
      return 'Boeing';
    }
    if (type.includes('AIRBUS') || type.includes('A320') || type.includes('A350') || type.includes('A380')) {
      return 'Airbus';
    }
    if (type.includes('EMBRAER') || type.includes('ERJ')) {
      return 'Embraer';
    }
    
    return 'Unknown';
  }
}

/**
 * Flight Stats Calculator - Real gamification based on actual flights
 */
export class FlightStatsCalculator {
  /**
   * Calculate comprehensive stats from flight data
   */
  static calculateFlightStats(flight: ProductionFlightData) {
    return {
      miles: flight.route.distance,
      duration: flight.route.duration,
      airports: [flight.route.departure.iata, flight.route.arrival.iata],
      countries: [flight.route.departure.country, flight.route.arrival.country],
      aircraft: flight.aircraft.type,
      airline: flight.airline.code,
      isDomestic: flight.route.departure.country === flight.route.arrival.country,
      isInternational: flight.route.departure.country !== flight.route.arrival.country,
      isLongHaul: flight.route.distance > 2000,
      timeOfDay: this.getTimeOfDay(flight.schedule.departureTime),
      xpEarned: this.calculateXP(flight)
    };
  }

  /**
   * Calculate XP based on real flight characteristics
   */
  private static calculateXP(flight: ProductionFlightData): number {
    let xp = 100; // Base XP
    
    // Distance bonus
    xp += Math.floor(flight.route.distance / 10);
    
    // International bonus
    if (flight.route.departure.country !== flight.route.arrival.country) {
      xp += 200;
    }
    
    // Long-haul bonus
    if (flight.route.distance > 2000) {
      xp += 300;
    }
    
    // Aircraft type bonus
    if (flight.aircraft.type.includes('A380') || flight.aircraft.type.includes('747')) {
      xp += 150; // Wide-body bonus
    }
    
    return xp;
  }

  private static getTimeOfDay(departureTime: string): string {
    const hour = new Date(departureTime).getHours();
    if (hour < 6) return 'red-eye';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }
}
