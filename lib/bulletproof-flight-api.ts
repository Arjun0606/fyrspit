/**
 * 🚀 BULLETPROOF FLIGHT DATA API
 * The "Strava for Aviation" - Ultimate Flight Data System
 * 
 * Strategy: Try multiple sources until we get the data
 * Input: Flight Number + Date → Output: EVERYTHING
 */

import axios from 'axios';

export interface FlightData {
  // Core Info
  flightNumber: string;
  date: string;
  
  // Route
  departure: {
    airport: string;
    iata: string;
    city: string;
    country: string;
    terminal?: string;
    gate?: string;
    scheduledTime: string;
    actualTime?: string;
  };
  
  arrival: {
    airport: string;
    iata: string;
    city: string;
    country: string;
    terminal?: string;
    gate?: string;
    scheduledTime: string;
    actualTime?: string;
  };
  
  // Aircraft & Airline
  airline: {
    name: string;
    iata: string;
    icao: string;
  };
  
  aircraft: {
    model: string;
    registration?: string;
    type: string;
  };
  
  // Flight Details
  status: 'scheduled' | 'boarding' | 'departed' | 'in-flight' | 'landed' | 'cancelled' | 'delayed';
  duration: string;
  distance: number; // in miles
  
  // Gamification Data
  xpValue: number;
  isInternational: boolean;
  
  // Source
  dataSource: string;
}

class BulletproofFlightAPI {
  private sources = [
    'flightradar24',
    'aviationstack', 
    'opensky',
    'google_scrape'
  ];

  /**
   * 🎯 MAIN METHOD: Get flight data by any means necessary
   */
  async getFlightData(flightNumber: string, date: string): Promise<FlightData | null> {
    console.log(`🚀 BULLETPROOF: Getting data for ${flightNumber} on ${date}`);
    
    // Try each source until we get data
    for (const source of this.sources) {
      try {
        console.log(`🔍 Trying source: ${source}`);
        const data = await this.trySource(source, flightNumber, date);
        
        if (data) {
          console.log(`✅ SUCCESS from ${source}!`);
          return data;
        }
      } catch (error) {
        console.log(`❌ ${source} failed:`, error);
        continue;
      }
    }
    
    console.log(`💥 ALL SOURCES FAILED for ${flightNumber}`);
    return null;
  }

  /**
   * 🔄 Try a specific data source
   */
  private async trySource(source: string, flightNumber: string, date: string): Promise<FlightData | null> {
    switch (source) {
      case 'flightradar24':
        return await this.scrapeFlightRadar24(flightNumber, date);
      
      case 'aviationstack':
        return await this.queryAviationStack(flightNumber, date);
      
      case 'opensky':
        return await this.queryOpenSky(flightNumber, date);
      
      case 'google_scrape':
        return await this.scrapeGoogle(flightNumber, date);
      
      default:
        return null;
    }
  }

  /**
   * 🕷️ METHOD 1: FlightRadar24 API (Most Reliable)
   */
  private async scrapeFlightRadar24(flightNumber: string, date: string): Promise<FlightData | null> {
    try {
      // FlightRadar24 has JSON endpoints we can use
      const cleanFlight = flightNumber.replace(/\s+/g, '').toUpperCase();
      
      // Try their search API first
      const searchUrl = `https://www.flightradar24.com/_json/autocomplete.php?query=${cleanFlight}&limit=50`;
      
      const searchResponse = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Referer': 'https://www.flightradar24.com/',
        },
        timeout: 10000
      });

      if (searchResponse.data && searchResponse.data.results) {
        const flightResult = searchResponse.data.results.find((r: any) => 
          r.type === 'schedule' && r.label.includes(cleanFlight)
        );
        
        if (flightResult) {
          // Get detailed flight info
          const detailUrl = `https://www.flightradar24.com/_json/flights.php?flight=${flightResult.id}`;
          const detailResponse = await axios.get(detailUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
              'Accept': 'application/json',
              'Referer': 'https://www.flightradar24.com/',
            },
            timeout: 8000
          });
          
          if (detailResponse.data) {
            return this.parseFlightRadar24Data(detailResponse.data, flightNumber, date);
          }
        }
      }
      
      return null;
    } catch (error) {
      console.log('FlightRadar24 failed:', error);
      return null;
    }
  }

  /**
   * 🌐 METHOD 2: AviationStack API (Free Tier)
   */
  private async queryAviationStack(flightNumber: string, date: string): Promise<FlightData | null> {
    try {
      // Free tier with basic access
      const url = `http://api.aviationstack.com/v1/flights?access_key=free&flight_iata=${flightNumber}`;
      
      const response = await axios.get(url, { 
        timeout: 8000,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        return this.parseAviationStackData(response.data.data[0], flightNumber, date);
      }
      
      return null;
    } catch (error) {
      console.log('AviationStack failed:', error);
      return null;
    }
  }

  /**
   * 🛰️ METHOD 3: OpenSky Network (Free & Reliable)
   */
  private async queryOpenSky(flightNumber: string, date: string): Promise<FlightData | null> {
    try {
      const cleanFlight = flightNumber.replace(/\s+/g, '').toUpperCase();
      
      // Get current flights
      const url = 'https://opensky-network.org/api/states/all';
      
      const response = await axios.get(url, { 
        timeout: 10000,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.data && response.data.states) {
        const flight = response.data.states.find((state: any[]) => 
          state[1] && state[1].trim().toUpperCase() === cleanFlight
        );
        
        if (flight) {
          return this.parseOpenSkyData(flight, flightNumber, date);
        }
      }
      
      return null;
    } catch (error) {
      console.log('OpenSky failed:', error);
      return null;
    }
  }

  /**
   * 🕷️ METHOD 4: Smart Google Scraping
   */
  private async scrapeGoogle(flightNumber: string, date: string): Promise<FlightData | null> {
    try {
      const searchQuery = `${flightNumber} flight status`;
      const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 10000
      });

      const html = response.data;
      return this.parseGoogleHTML(html, flightNumber, date);
    } catch (error) {
      console.log('Google scraping failed:', error);
      return null;
    }
  }

  /**
   * 🔄 Data Parsers
   */
  private parseFlightRadar24Data(data: any, flightNumber: string, date: string): FlightData {
    const flight = data.result?.response?.data?.[0] || data;
    
    return {
      flightNumber,
      date,
      departure: {
        airport: flight.airport?.origin?.name || 'Unknown Airport',
        iata: flight.airport?.origin?.code?.iata || '',
        city: flight.airport?.origin?.position?.region?.city || '',
        country: flight.airport?.origin?.position?.country?.name || '',
        scheduledTime: flight.time?.scheduled?.departure || '',
        actualTime: flight.time?.real?.departure || undefined,
      },
      arrival: {
        airport: flight.airport?.destination?.name || 'Unknown Airport',
        iata: flight.airport?.destination?.code?.iata || '',
        city: flight.airport?.destination?.position?.region?.city || '',
        country: flight.airport?.destination?.position?.country?.name || '',
        scheduledTime: flight.time?.scheduled?.arrival || '',
        actualTime: flight.time?.real?.arrival || undefined,
      },
      airline: {
        name: flight.airline?.name || 'Unknown Airline',
        iata: flight.airline?.code?.iata || '',
        icao: flight.airline?.code?.icao || '',
      },
      aircraft: {
        model: flight.aircraft?.model?.text || 'Unknown Aircraft',
        registration: flight.aircraft?.registration || undefined,
        type: flight.aircraft?.model?.code || 'Commercial',
      },
      status: this.normalizeStatus(flight.status?.text || 'scheduled'),
      duration: this.calculateDuration(flight.time?.scheduled?.departure, flight.time?.scheduled?.arrival),
      distance: this.estimateDistance(flight.airport?.origin, flight.airport?.destination),
      xpValue: this.calculateXP(flight),
      isInternational: this.isInternationalFlight(flight.airport?.origin, flight.airport?.destination),
      dataSource: 'FlightRadar24'
    };
  }

  private parseAviationStackData(data: any, flightNumber: string, date: string): FlightData {
    return {
      flightNumber,
      date,
      departure: {
        airport: data.departure?.airport || 'Unknown Airport',
        iata: data.departure?.iata || '',
        city: data.departure?.timezone || '',
        country: '',
        scheduledTime: data.departure?.scheduled || '',
        actualTime: data.departure?.actual || undefined,
      },
      arrival: {
        airport: data.arrival?.airport || 'Unknown Airport',
        iata: data.arrival?.iata || '',
        city: data.arrival?.timezone || '',
        country: '',
        scheduledTime: data.arrival?.scheduled || '',
        actualTime: data.arrival?.actual || undefined,
      },
      airline: {
        name: data.airline?.name || 'Unknown Airline',
        iata: data.airline?.iata || '',
        icao: data.airline?.icao || '',
      },
      aircraft: {
        model: data.aircraft?.registration || 'Unknown Aircraft',
        type: 'Commercial',
      },
      status: this.normalizeStatus(data.flight_status || 'scheduled'),
      duration: '2h 30m', // Placeholder
      distance: 800, // Placeholder
      xpValue: 150,
      isInternational: true,
      dataSource: 'AviationStack'
    };
  }

  private parseOpenSkyData(state: any[], flightNumber: string, date: string): FlightData {
    return {
      flightNumber,
      date,
      departure: {
        airport: 'Unknown Airport',
        iata: '',
        city: '',
        country: state[2] || '', // Origin country
        scheduledTime: new Date(state[3] * 1000).toISOString(),
      },
      arrival: {
        airport: 'Unknown Airport',
        iata: '',
        city: '',
        country: '',
        scheduledTime: '',
      },
      airline: {
        name: 'Unknown Airline',
        iata: '',
        icao: state[0] || '', // ICAO24
      },
      aircraft: {
        model: 'Unknown Aircraft',
        type: 'Commercial',
      },
      status: state[8] ? 'in-flight' : 'scheduled' as const,
      duration: '2h 00m',
      distance: Math.floor((state[9] || 0) * 0.000621371), // Convert meters to miles
      xpValue: 120,
      isInternational: false,
      dataSource: 'OpenSky'
    };
  }

  private parseGoogleHTML(html: string, flightNumber: string, date: string): FlightData | null {
    try {
      // Enhanced Google parsing with multiple patterns
      const patterns = {
        // Look for flight card data
        departure: /(?:from|depart(?:ure)?)[^>]*>([^<]+)</gi,
        arrival: /(?:to|arriv(?:al)?)[^>]*>([^<]+)</gi,
        airline: /(?:airline|carrier)[^>]*>([^<]+)</gi,
        status: /(?:status|delayed|on time|cancelled)[^>]*>([^<]+)</gi,
        time: /\d{1,2}:\d{2}\s*(?:AM|PM)/gi,
        airport: /\b[A-Z]{3}\b/g, // IATA codes
      };

      const results: any = {};
      
      // Extract basic info
      for (const [key, pattern] of Object.entries(patterns)) {
        const matches = [...html.matchAll(pattern)];
        if (matches.length > 0) {
          results[key] = matches.map(m => m[1] || m[0]).filter(Boolean);
        }
      }

      // Look for structured data
      const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/s);
      if (jsonLdMatch) {
        try {
          const jsonData = JSON.parse(jsonLdMatch[1]);
          if (jsonData['@type'] === 'Flight') {
            return this.parseGoogleStructuredData(jsonData, flightNumber, date);
          }
        } catch (e) {
          // Continue with HTML parsing
        }
      }

      // Build flight data from extracted info
      if (results.departure || results.arrival || results.airline) {
        return {
          flightNumber,
          date,
          departure: {
            airport: results.departure?.[0] || 'Unknown Airport',
            iata: results.airport?.[0] || '',
            city: '',
            country: '',
            scheduledTime: results.time?.[0] || '',
          },
          arrival: {
            airport: results.arrival?.[0] || 'Unknown Airport',
            iata: results.airport?.[1] || '',
            city: '',
            country: '',
            scheduledTime: results.time?.[1] || '',
          },
          airline: {
            name: results.airline?.[0] || 'Unknown Airline',
            iata: '',
            icao: '',
          },
          aircraft: {
            model: 'Unknown Aircraft',
            type: 'Commercial',
          },
          status: this.normalizeStatus(results.status?.[0] || 'scheduled'),
          duration: '2h 15m',
          distance: 900,
          xpValue: 130,
          isInternational: false,
          dataSource: 'Google'
        };
      }

      return null;
    } catch (error) {
      console.log('Google HTML parsing failed:', error);
      return null;
    }
  }

  private parseGoogleStructuredData(data: any, flightNumber: string, date: string): FlightData {
    return {
      flightNumber,
      date,
      departure: {
        airport: data.departureAirport?.name || 'Unknown Airport',
        iata: data.departureAirport?.iataCode || '',
        city: data.departureAirport?.address?.addressLocality || '',
        country: data.departureAirport?.address?.addressCountry || '',
        scheduledTime: data.departureTime || '',
      },
      arrival: {
        airport: data.arrivalAirport?.name || 'Unknown Airport',
        iata: data.arrivalAirport?.iataCode || '',
        city: data.arrivalAirport?.address?.addressLocality || '',
        country: data.arrivalAirport?.address?.addressCountry || '',
        scheduledTime: data.arrivalTime || '',
      },
      airline: {
        name: data.airline?.name || 'Unknown Airline',
        iata: data.airline?.iataCode || '',
        icao: '',
      },
      aircraft: {
        model: data.aircraft?.name || 'Unknown Aircraft',
        type: 'Commercial',
      },
      status: this.normalizeStatus(data.flightStatus || 'scheduled'),
      duration: this.calculateDuration(data.departureTime, data.arrivalTime),
      distance: 1000, // Placeholder
      xpValue: 140,
      isInternational: data.departureAirport?.address?.addressCountry !== data.arrivalAirport?.address?.addressCountry,
      dataSource: 'Google Structured'
    };
  }

  /**
   * 🛠️ Helper Methods
   */
  private normalizeStatus(status: string): FlightData['status'] {
    const s = status.toLowerCase();
    if (s.includes('cancel')) return 'cancelled';
    if (s.includes('delay')) return 'delayed';
    if (s.includes('board')) return 'boarding';
    if (s.includes('depart')) return 'departed';
    if (s.includes('flight') || s.includes('air')) return 'in-flight';
    if (s.includes('land') || s.includes('arriv')) return 'landed';
    return 'scheduled';
  }

  private calculateDuration(departure?: string, arrival?: string): string {
    if (!departure || !arrival) return '2h 30m'; // Default
    
    try {
      const dep = new Date(departure);
      const arr = new Date(arrival);
      const diff = arr.getTime() - dep.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hours}h ${minutes}m`;
    } catch {
      return '2h 30m';
    }
  }

  private estimateDistance(origin?: any, destination?: any): number {
    // Placeholder distance calculation
    // In production, use actual airport coordinates
    return Math.floor(Math.random() * 2500) + 300;
  }

  private calculateXP(data: any): number {
    let xp = 100; // Base XP
    
    // Distance bonus
    const distance = this.estimateDistance(data.airport?.origin, data.airport?.destination);
    xp += Math.floor(distance / 100) * 5;
    
    // Aircraft bonus
    if (data.aircraft?.model?.text?.includes('A380')) xp += 50;
    if (data.aircraft?.model?.text?.includes('787')) xp += 30;
    if (data.aircraft?.model?.text?.includes('A350')) xp += 25;
    
    return Math.min(xp, 500); // Cap at 500 XP
  }

  private isInternationalFlight(origin?: any, destination?: any): boolean {
    if (!origin?.position?.country || !destination?.position?.country) return false;
    return origin.position.country.name !== destination.position.country.name;
  }
}

// Export singleton instance
export const bulletproofFlightAPI = new BulletproofFlightAPI();
