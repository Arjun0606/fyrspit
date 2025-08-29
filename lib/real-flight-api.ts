/**
 * Real Flight Data API Service
 * Uses multiple free APIs to get real-time flight data
 */

import axios from 'axios';
import { generateFlightData, FLIGHT_DATABASE } from './comprehensive-flight-db';

export interface RealFlightData {
  flightNumber: string;
  airline: {
    name: string;
    code: string;
    country: string;
  };
  aircraft: {
    type: string;
    manufacturer: string;
    registration: string;
  };
  route: {
    departure: {
      airport: string;
      iata: string;
      city: string;
      country: string;
    };
    arrival: {
      airport: string;
      iata: string;
      city: string;
      country: string;
    };
    distance: number;
    duration: number;
  };
  timing: {
    scheduled: {
      departure: string;
      arrival: string;
    };
    actual?: {
      departure: string;
      arrival: string;
    };
  };
  status: {
    current: string;
    delay?: number;
  };
}

export class RealFlightAPI {
  
  /**
   * Get flight data from multiple free APIs
   */
  static async getFlightData(flightNumber: string): Promise<RealFlightData | null> {
    console.log(`🔍 Getting REAL flight data for ${flightNumber}...`);
    
    // Try multiple APIs in order of preference
    const results = await Promise.allSettled([
      this.tryOpenSkyAPI(flightNumber),
      this.tryAirLabsAPI(flightNumber),
      this.tryFlightRadar24API(flightNumber),
      this.tryAviationStackAPI(flightNumber),
    ]);

    // Return first successful result
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        console.log(`✅ Got real API data for ${flightNumber}`);
        return result.value;
      }
    }

    // Fallback to comprehensive database
    console.log(`🔄 Falling back to flight database for ${flightNumber}`);
    const dbResult = generateFlightData(flightNumber);
    if (dbResult) {
      console.log(`✅ Found ${flightNumber} in comprehensive database`);
      return this.convertDbToRealData(dbResult);
    }

    console.log(`❌ No data found for ${flightNumber} anywhere`);
    return null;
  }

  /**
   * OpenSky Network - Free and reliable
   */
  private static async tryOpenSkyAPI(flightNumber: string): Promise<RealFlightData | null> {
    try {
      // OpenSky Network REST API
      const response = await axios.get(`https://opensky-network.org/api/flights/all`, {
        params: {
          begin: Math.floor(Date.now() / 1000) - 86400, // Last 24 hours
          end: Math.floor(Date.now() / 1000)
        },
        timeout: 5000
      });

      // Find flight by callsign
      const flight = response.data.find((f: any) => 
        f.callsign && f.callsign.trim().toUpperCase() === flightNumber.toUpperCase()
      );

      if (!flight) return null;

      // Get additional details
      const aircraftResponse = await axios.get(`https://opensky-network.org/api/states/all`, {
        params: {
          icao24: flight.icao24
        },
        timeout: 5000
      });

      return this.formatOpenSkyData(flight, aircraftResponse.data, flightNumber);
    } catch (error) {
      console.log('OpenSky API failed:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * FlightLabs API - Free tier available
   */
  private static async tryAirLabsAPI(flightNumber: string): Promise<RealFlightData | null> {
    try {
      // FlightLabs free API
      const response = await axios.get(`http://api.goflightlabs.com/flights`, {
        params: {
          access_key: process.env.FLIGHTLABS_API_KEY || 'demo',
          flight_iata: flightNumber,
          limit: 1
        },
        timeout: 10000
      });

      if (!response.data.data || response.data.data.length === 0) {
        return null;
      }

      return this.formatFlightLabsData(response.data.data[0], flightNumber);
    } catch (error) {
      console.log('FlightLabs API failed:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * FlightRadar24 - Public API endpoints
   */
  private static async tryFlightRadar24API(flightNumber: string): Promise<RealFlightData | null> {
    try {
      // FlightRadar24 search endpoint
      const searchResponse = await axios.get(`https://www.flightradar24.com/v1/search/web/find`, {
        params: {
          query: flightNumber,
          limit: 1
        },
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!searchResponse.data.results || searchResponse.data.results.length === 0) {
        return null;
      }

      const flightId = searchResponse.data.results[0].id;
      
      // Get flight details
      const detailsResponse = await axios.get(`https://www.flightradar24.com/v1/flight/${flightId}`, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      return this.formatFlightRadar24Data(detailsResponse.data, flightNumber);
    } catch (error) {
      console.log('FlightRadar24 API failed:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * AviationStack API - Free tier
   */
  private static async tryAviationStackAPI(flightNumber: string): Promise<RealFlightData | null> {
    try {
      // AviationStack free API
      const response = await axios.get(`http://api.aviationstack.com/v1/flights`, {
        params: {
          access_key: 'demo', // Use demo key for now
          flight_iata: flightNumber,
          limit: 1
        },
        timeout: 5000
      });

      if (!response.data.data || response.data.data.length === 0) {
        return null;
      }

      return this.formatAviationStackData(response.data.data[0], flightNumber);
    } catch (error) {
      console.log('AviationStack API failed:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  // Data formatters for each API
  private static formatOpenSkyData(flight: any, aircraft: any, flightNumber: string): RealFlightData {
    return {
      flightNumber,
      airline: {
        name: this.getAirlineFromCallsign(flight.callsign),
        code: flightNumber.substring(0, 2),
        country: 'Unknown'
      },
      aircraft: {
        type: 'Unknown Aircraft',
        manufacturer: 'Unknown',
        registration: flight.icao24 || 'Unknown'
      },
      route: {
        departure: {
          airport: flight.estDepartureAirport || 'Unknown',
          iata: flight.estDepartureAirport || 'UNK',
          city: 'Unknown',
          country: 'Unknown'
        },
        arrival: {
          airport: flight.estArrivalAirport || 'Unknown',
          iata: flight.estArrivalAirport || 'UNK',
          city: 'Unknown',
          country: 'Unknown'
        },
        distance: 0,
        duration: flight.lastSeen - flight.firstSeen
      },
      timing: {
        scheduled: {
          departure: new Date(flight.firstSeen * 1000).toISOString(),
          arrival: new Date(flight.lastSeen * 1000).toISOString()
        }
      },
      status: {
        current: 'en-route'
      }
    };
  }

  private static formatFlightLabsData(flight: any, flightNumber: string): RealFlightData {
    return {
      flightNumber,
      airline: {
        name: flight.airline_name || 'Unknown Airline',
        code: flight.airline_iata || flightNumber.substring(0, 2),
        country: 'Unknown'
      },
      aircraft: {
        type: flight.aircraft_icao || 'Unknown Aircraft',
        manufacturer: 'Unknown',
        registration: flight.reg_number || 'Unknown'
      },
      route: {
        departure: {
          airport: flight.dep_name || 'Unknown Airport',
          iata: flight.dep_iata || 'UNK',
          city: flight.dep_city || 'Unknown',
          country: flight.dep_country || 'Unknown'
        },
        arrival: {
          airport: flight.arr_name || 'Unknown Airport',
          iata: flight.arr_iata || 'UNK',
          city: flight.arr_city || 'Unknown',
          country: flight.arr_country || 'Unknown'
        },
        distance: 0,
        duration: 0
      },
      timing: {
        scheduled: {
          departure: flight.dep_time || new Date().toISOString(),
          arrival: flight.arr_time || new Date().toISOString()
        },
        actual: flight.dep_actual ? {
          departure: flight.dep_actual,
          arrival: flight.arr_actual
        } : undefined
      },
      status: {
        current: flight.status || 'unknown',
        delay: flight.delayed || 0
      }
    };
  }

  private static formatFlightRadar24Data(flight: any, flightNumber: string): RealFlightData {
    const identification = flight.identification || {};
    const aircraft = flight.aircraft || {};
    const airport = flight.airport || {};

    return {
      flightNumber,
      airline: {
        name: identification.airline?.name || 'Unknown Airline',
        code: identification.airline?.code?.iata || flightNumber.substring(0, 2),
        country: 'Unknown'
      },
      aircraft: {
        type: aircraft.model?.text || 'Unknown Aircraft',
        manufacturer: aircraft.model?.text?.split(' ')[0] || 'Unknown',
        registration: aircraft.registration || 'Unknown'
      },
      route: {
        departure: {
          airport: airport.origin?.name || 'Unknown Airport',
          iata: airport.origin?.code?.iata || 'UNK',
          city: airport.origin?.position?.region?.city || 'Unknown',
          country: airport.origin?.position?.country?.name || 'Unknown'
        },
        arrival: {
          airport: airport.destination?.name || 'Unknown Airport',
          iata: airport.destination?.code?.iata || 'UNK',
          city: airport.destination?.position?.region?.city || 'Unknown',
          country: airport.destination?.position?.country?.name || 'Unknown'
        },
        distance: 0,
        duration: 0
      },
      timing: {
        scheduled: {
          departure: airport.origin?.info?.terminal || new Date().toISOString(),
          arrival: airport.destination?.info?.terminal || new Date().toISOString()
        }
      },
      status: {
        current: flight.status?.text || 'unknown'
      }
    };
  }

  private static formatAviationStackData(flight: any, flightNumber: string): RealFlightData {
    return {
      flightNumber,
      airline: {
        name: flight.airline?.name || 'Unknown Airline',
        code: flight.airline?.iata || flightNumber.substring(0, 2),
        country: 'Unknown'
      },
      aircraft: {
        type: flight.aircraft?.iata || 'Unknown Aircraft',
        manufacturer: 'Unknown',
        registration: flight.aircraft?.registration || 'Unknown'
      },
      route: {
        departure: {
          airport: flight.departure?.airport || 'Unknown Airport',
          iata: flight.departure?.iata || 'UNK',
          city: flight.departure?.city || 'Unknown',
          country: 'Unknown'
        },
        arrival: {
          airport: flight.arrival?.airport || 'Unknown Airport',
          iata: flight.arrival?.iata || 'UNK',
          city: flight.arrival?.city || 'Unknown',
          country: 'Unknown'
        },
        distance: 0,
        duration: 0
      },
      timing: {
        scheduled: {
          departure: flight.departure?.scheduled || new Date().toISOString(),
          arrival: flight.arrival?.scheduled || new Date().toISOString()
        },
        actual: {
          departure: flight.departure?.actual,
          arrival: flight.arrival?.actual
        }
      },
      status: {
        current: flight.flight_status || 'unknown',
        delay: flight.departure?.delay || 0
      }
    };
  }

  private static getAirlineFromCallsign(callsign: string): string {
    const airlineMap: Record<string, string> = {
      'QP': 'Akasa Air',
      '6E': 'IndiGo',
      'AI': 'Air India',
      'SG': 'SpiceJet',
      'UK': 'Vistara',
      'AA': 'American Airlines',
      'UA': 'United Airlines',
      'DL': 'Delta Air Lines',
      'EK': 'Emirates',
      'QR': 'Qatar Airways',
      'BA': 'British Airways',
      'LH': 'Lufthansa'
    };

    const prefix = callsign?.substring(0, 2);
    return airlineMap[prefix] || 'Unknown Airline';
  }

  /**
   * Convert database format to RealFlightData format
   */
  private static convertDbToRealData(dbFlight: any): RealFlightData {
    return {
      flightNumber: dbFlight.flightNumber,
      airline: dbFlight.airline,
      aircraft: {
        type: dbFlight.aircraft.type,
        manufacturer: dbFlight.aircraft.manufacturer,
        registration: `REG-${dbFlight.flightNumber}` // Generated registration
      },
      route: {
        departure: {
          airport: dbFlight.route.from.airport,
          iata: dbFlight.route.from.iata,
          city: dbFlight.route.from.city,
          country: dbFlight.route.from.country
        },
        arrival: {
          airport: dbFlight.route.to.airport,
          iata: dbFlight.route.to.iata,
          city: dbFlight.route.to.city,
          country: dbFlight.route.to.country
        },
        distance: dbFlight.route.distance,
        duration: dbFlight.route.duration
      },
      timing: {
        scheduled: {
          departure: new Date().toISOString(), // Current time for demo
          arrival: new Date(Date.now() + dbFlight.route.duration * 60000).toISOString()
        }
      },
      status: {
        current: 'scheduled'
      }
    };
  }
}
