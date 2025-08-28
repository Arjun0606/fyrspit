/**
 * Comprehensive Airport Database
 * Used for auto-enrichment and distance calculations
 */

export interface Airport {
  iata: string;
  icao: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation: number; // feet
  timezone: string;
  continent: string;
  type: 'large_airport' | 'medium_airport' | 'small_airport' | 'heliport' | 'seaplane_base';
}

// Major airports database focusing on popular routes
export const airportDatabase: Airport[] = [
  // Indian Airports
  {
    iata: 'BOM',
    icao: 'VABB',
    name: 'Chhatrapati Shivaji Maharaj International Airport',
    city: 'Mumbai',
    country: 'India',
    latitude: 19.0896,
    longitude: 72.8656,
    elevation: 39,
    timezone: 'Asia/Kolkata',
    continent: 'Asia',
    type: 'large_airport'
  },
  {
    iata: 'BLR',
    icao: 'VOBL',
    name: 'Kempegowda International Airport',
    city: 'Bengaluru',
    country: 'India',
    latitude: 13.1989,
    longitude: 77.7068,
    elevation: 3000,
    timezone: 'Asia/Kolkata',
    continent: 'Asia',
    type: 'large_airport'
  },
  {
    iata: 'DEL',
    icao: 'VIDP',
    name: 'Indira Gandhi International Airport',
    city: 'New Delhi',
    country: 'India',
    latitude: 28.5665,
    longitude: 77.1031,
    elevation: 777,
    timezone: 'Asia/Kolkata',
    continent: 'Asia',
    type: 'large_airport'
  },
  {
    iata: 'CCU',
    icao: 'VECC',
    name: 'Netaji Subhas Chandra Bose International Airport',
    city: 'Kolkata',
    country: 'India',
    latitude: 22.6547,
    longitude: 88.4467,
    elevation: 16,
    timezone: 'Asia/Kolkata',
    continent: 'Asia',
    type: 'large_airport'
  },
  {
    iata: 'HYD',
    icao: 'VOHS',
    name: 'Rajiv Gandhi International Airport',
    city: 'Hyderabad',
    country: 'India',
    latitude: 17.2313,
    longitude: 78.4298,
    elevation: 1742,
    timezone: 'Asia/Kolkata',
    continent: 'Asia',
    type: 'large_airport'
  },
  {
    iata: 'MAA',
    icao: 'VOMM',
    name: 'Chennai International Airport',
    city: 'Chennai',
    country: 'India',
    latitude: 12.9941,
    longitude: 80.1709,
    elevation: 52,
    timezone: 'Asia/Kolkata',
    continent: 'Asia',
    type: 'large_airport'
  },
  {
    iata: 'COK',
    icao: 'VOCI',
    name: 'Cochin International Airport',
    city: 'Kochi',
    country: 'India',
    latitude: 10.1520,
    longitude: 76.4019,
    elevation: 30,
    timezone: 'Asia/Kolkata',
    continent: 'Asia',
    type: 'large_airport'
  },
  {
    iata: 'GOI',
    icao: 'VOGO',
    name: 'Goa International Airport',
    city: 'Goa',
    country: 'India',
    latitude: 15.3808,
    longitude: 73.8314,
    elevation: 150,
    timezone: 'Asia/Kolkata',
    continent: 'Asia',
    type: 'medium_airport'
  },
  {
    iata: 'PNQ',
    icao: 'VAPO',
    name: 'Pune Airport',
    city: 'Pune',
    country: 'India',
    latitude: 18.5822,
    longitude: 73.9197,
    elevation: 1942,
    timezone: 'Asia/Kolkata',
    continent: 'Asia',
    type: 'medium_airport'
  },

  // US Major Airports
  {
    iata: 'JFK',
    icao: 'KJFK',
    name: 'John F. Kennedy International Airport',
    city: 'New York',
    country: 'United States',
    latitude: 40.6413,
    longitude: -73.7781,
    elevation: 13,
    timezone: 'America/New_York',
    continent: 'North America',
    type: 'large_airport'
  },
  {
    iata: 'LAX',
    icao: 'KLAX',
    name: 'Los Angeles International Airport',
    city: 'Los Angeles',
    country: 'United States',
    latitude: 33.9425,
    longitude: -118.4081,
    elevation: 125,
    timezone: 'America/Los_Angeles',
    continent: 'North America',
    type: 'large_airport'
  },
  {
    iata: 'ORD',
    icao: 'KORD',
    name: "O'Hare International Airport",
    city: 'Chicago',
    country: 'United States',
    latitude: 41.9742,
    longitude: -87.9073,
    elevation: 672,
    timezone: 'America/Chicago',
    continent: 'North America',
    type: 'large_airport'
  },
  {
    iata: 'ATL',
    icao: 'KATL',
    name: 'Hartsfield-Jackson Atlanta International Airport',
    city: 'Atlanta',
    country: 'United States',
    latitude: 33.6407,
    longitude: -84.4277,
    elevation: 1026,
    timezone: 'America/New_York',
    continent: 'North America',
    type: 'large_airport'
  },

  // European Major Airports
  {
    iata: 'LHR',
    icao: 'EGLL',
    name: 'Heathrow Airport',
    city: 'London',
    country: 'United Kingdom',
    latitude: 51.4700,
    longitude: -0.4543,
    elevation: 83,
    timezone: 'Europe/London',
    continent: 'Europe',
    type: 'large_airport'
  },
  {
    iata: 'CDG',
    icao: 'LFPG',
    name: 'Charles de Gaulle Airport',
    city: 'Paris',
    country: 'France',
    latitude: 49.0097,
    longitude: 2.5479,
    elevation: 392,
    timezone: 'Europe/Paris',
    continent: 'Europe',
    type: 'large_airport'
  },
  {
    iata: 'FRA',
    icao: 'EDDF',
    name: 'Frankfurt am Main Airport',
    city: 'Frankfurt',
    country: 'Germany',
    latitude: 50.0264,
    longitude: 8.5431,
    elevation: 364,
    timezone: 'Europe/Berlin',
    continent: 'Europe',
    type: 'large_airport'
  },
  {
    iata: 'AMS',
    icao: 'EHAM',
    name: 'Amsterdam Airport Schiphol',
    city: 'Amsterdam',
    country: 'Netherlands',
    latitude: 52.3105,
    longitude: 4.7683,
    elevation: -11,
    timezone: 'Europe/Amsterdam',
    continent: 'Europe',
    type: 'large_airport'
  },

  // Middle East
  {
    iata: 'DXB',
    icao: 'OMDB',
    name: 'Dubai International Airport',
    city: 'Dubai',
    country: 'United Arab Emirates',
    latitude: 25.2532,
    longitude: 55.3657,
    elevation: 62,
    timezone: 'Asia/Dubai',
    continent: 'Asia',
    type: 'large_airport'
  },
  {
    iata: 'DOH',
    icao: 'OTHH',
    name: 'Hamad International Airport',
    city: 'Doha',
    country: 'Qatar',
    latitude: 25.2731,
    longitude: 51.6080,
    elevation: 13,
    timezone: 'Asia/Qatar',
    continent: 'Asia',
    type: 'large_airport'
  },

  // Asia-Pacific
  {
    iata: 'SIN',
    icao: 'WSSS',
    name: 'Singapore Changi Airport',
    city: 'Singapore',
    country: 'Singapore',
    latitude: 1.3644,
    longitude: 103.9915,
    elevation: 22,
    timezone: 'Asia/Singapore',
    continent: 'Asia',
    type: 'large_airport'
  },
  {
    iata: 'NRT',
    icao: 'RJAA',
    name: 'Narita International Airport',
    city: 'Tokyo',
    country: 'Japan',
    latitude: 35.7647,
    longitude: 140.3864,
    elevation: 141,
    timezone: 'Asia/Tokyo',
    continent: 'Asia',
    type: 'large_airport'
  },
  {
    iata: 'ICN',
    icao: 'RKSI',
    name: 'Incheon International Airport',
    city: 'Seoul',
    country: 'South Korea',
    latitude: 37.4602,
    longitude: 126.4407,
    elevation: 23,
    timezone: 'Asia/Seoul',
    continent: 'Asia',
    type: 'large_airport'
  },
  {
    iata: 'SYD',
    icao: 'YSSY',
    name: 'Sydney Kingsford Smith Airport',
    city: 'Sydney',
    country: 'Australia',
    latitude: -33.9399,
    longitude: 151.1753,
    elevation: 21,
    timezone: 'Australia/Sydney',
    continent: 'Oceania',
    type: 'large_airport'
  }
];

export class AirportDatabase {
  /**
   * Find airport by IATA code
   */
  static findByIata(iata: string): Airport | null {
    return airportDatabase.find(airport => 
      airport.iata.toLowerCase() === iata.toLowerCase()
    ) || null;
  }

  /**
   * Find airport by ICAO code
   */
  static findByIcao(icao: string): Airport | null {
    return airportDatabase.find(airport => 
      airport.icao.toLowerCase() === icao.toLowerCase()
    ) || null;
  }

  /**
   * Search airports by name or city
   */
  static search(query: string): Airport[] {
    const lowercaseQuery = query.toLowerCase();
    return airportDatabase.filter(airport => 
      airport.name.toLowerCase().includes(lowercaseQuery) ||
      airport.city.toLowerCase().includes(lowercaseQuery) ||
      airport.iata.toLowerCase().includes(lowercaseQuery) ||
      airport.icao.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Get airport suggestions for autocomplete
   */
  static getSuggestions(query: string, limit = 10): Array<{
    iata: string;
    name: string;
    city: string;
    country: string;
  }> {
    if (query.length < 2) return [];
    
    const results = this.search(query);
    return results
      .slice(0, limit)
      .map(airport => ({
        iata: airport.iata,
        name: airport.name,
        city: airport.city,
        country: airport.country
      }));
  }

  /**
   * Calculate distance between two airports using Haversine formula
   */
  static calculateDistance(fromIata: string, toIata: string): number | null {
    const fromAirport = this.findByIata(fromIata);
    const toAirport = this.findByIata(toIata);
    
    if (!fromAirport || !toAirport) return null;
    
    return this.haversineDistance(
      fromAirport.latitude, fromAirport.longitude,
      toAirport.latitude, toAirport.longitude
    );
  }

  /**
   * Haversine formula to calculate distance between two points on Earth
   */
  private static haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3440.07; // Earth's radius in nautical miles
    
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distance in nautical miles
  }

  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Estimate flight duration based on distance
   */
  static estimateFlightDuration(distanceNM: number): number {
    // Average commercial flight speed: 460 knots
    // Add 30 minutes for taxi, takeoff, and landing
    const avgSpeed = 460; // knots
    const flightTime = distanceNM / avgSpeed; // hours
    const totalTime = flightTime + 0.5; // add 30 minutes for ground operations
    
    return Math.round(totalTime * 60); // return minutes
  }

  /**
   * Get route information
   */
  static getRouteInfo(fromIata: string, toIata: string): {
    distance: number;
    duration: number;
    fromAirport: Airport;
    toAirport: Airport;
  } | null {
    const fromAirport = this.findByIata(fromIata);
    const toAirport = this.findByIata(toIata);
    
    if (!fromAirport || !toAirport) return null;
    
    const distance = this.calculateDistance(fromIata, toIata);
    if (distance === null) return null;
    
    const duration = this.estimateFlightDuration(distance);
    
    return {
      distance,
      duration,
      fromAirport,
      toAirport
    };
  }

  /**
   * Get all airports by country
   */
  static getByCountry(country: string): Airport[] {
    return airportDatabase.filter(airport => 
      airport.country.toLowerCase() === country.toLowerCase()
    );
  }

  /**
   * Get all airports by continent
   */
  static getByContinent(continent: string): Airport[] {
    return airportDatabase.filter(airport => 
      airport.continent.toLowerCase() === continent.toLowerCase()
    );
  }
}
