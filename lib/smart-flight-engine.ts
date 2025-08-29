/**
 * Smart Flight Engine - AI-like Flight Data Generation
 * Uses patterns, airline routes, and intelligent algorithms to generate realistic flight data
 */

export interface FlightData {
  flightNumber: string;
  airline: { name: string; code: string; country: string };
  aircraft: { type: string; manufacturer: string };
  route: {
    from: { iata: string; city: string; country: string; airport: string };
    to: { iata: string; city: string; country: string; airport: string };
    distance: number;
    duration: number;
  };
  timing: {
    scheduled: { departure: string; arrival: string };
  };
  status: { current: string };
}

// Global airline database with real route patterns
const AIRLINE_DATA = {
  'QR': {
    name: 'Qatar Airways',
    country: 'Qatar',
    hubs: ['DOH'],
    fleet: ['Boeing 787-8', 'Airbus A350-900', 'Boeing 777-300ER', 'Airbus A380-800'],
    routes: [
      { from: 'DOH', to: 'DXB', distance: 378, frequency: 'high' },
      { from: 'DOH', to: 'LHR', distance: 3253, frequency: 'high' },
      { from: 'DOH', to: 'JFK', distance: 6711, frequency: 'medium' },
      { from: 'DOH', to: 'BOM', distance: 1533, frequency: 'high' },
      { from: 'DOH', to: 'DEL', distance: 1863, frequency: 'high' },
      { from: 'DOH', to: 'BLR', distance: 2082, frequency: 'medium' },
      { from: 'DOH', to: 'SIN', distance: 4336, frequency: 'high' },
      { from: 'DOH', to: 'CDG', distance: 3167, frequency: 'medium' },
      { from: 'DOH', to: 'FRA', distance: 2980, frequency: 'medium' },
      { from: 'DOH', to: 'LAX', distance: 8306, frequency: 'low' }
    ]
  },
  'EK': {
    name: 'Emirates',
    country: 'UAE',
    hubs: ['DXB'],
    fleet: ['Airbus A380-800', 'Boeing 777-300ER', 'Boeing 777-200LR'],
    routes: [
      { from: 'DXB', to: 'LHR', distance: 3414, frequency: 'high' },
      { from: 'DXB', to: 'JFK', distance: 6838, frequency: 'medium' },
      { from: 'DXB', to: 'BOM', distance: 1197, frequency: 'high' },
      { from: 'DXB', to: 'DEL', distance: 1508, frequency: 'high' },
      { from: 'DXB', to: 'SIN', distance: 3846, frequency: 'high' },
      { from: 'DXB', to: 'CDG', distance: 3256, frequency: 'medium' }
    ]
  },
  'AA': {
    name: 'American Airlines',
    country: 'USA',
    hubs: ['DFW', 'ORD', 'JFK', 'LAX'],
    fleet: ['Boeing 737-800', 'Boeing 777-300ER', 'Airbus A321', 'Boeing 787-8'],
    routes: [
      { from: 'LAX', to: 'JFK', distance: 2475, frequency: 'high' },
      { from: 'DFW', to: 'LAX', distance: 1235, frequency: 'high' },
      { from: 'JFK', to: 'LHR', distance: 3459, frequency: 'high' },
      { from: 'ORD', to: 'DFW', distance: 925, frequency: 'high' }
    ]
  },
  '6E': {
    name: 'IndiGo',
    country: 'India',
    hubs: ['DEL', 'BOM', 'BLR'],
    fleet: ['Airbus A320neo', 'Airbus A321neo'],
    routes: [
      { from: 'DEL', to: 'BOM', distance: 1144, frequency: 'high' },
      { from: 'BOM', to: 'BLR', distance: 537, frequency: 'high' },
      { from: 'DEL', to: 'BLR', distance: 1740, frequency: 'high' },
      { from: 'DEL', to: 'MAA', distance: 1765, frequency: 'medium' }
    ]
  },
  'AI': {
    name: 'Air India',
    country: 'India',
    hubs: ['DEL', 'BOM'],
    fleet: ['Boeing 787-8', 'Boeing 777-300ER', 'Airbus A320neo'],
    routes: [
      { from: 'DEL', to: 'LHR', distance: 4180, frequency: 'medium' },
      { from: 'BOM', to: 'LHR', distance: 4478, frequency: 'medium' },
      { from: 'DEL', to: 'JFK', distance: 7318, frequency: 'low' }
    ]
  }
};

// Global airport database
const AIRPORTS = {
  'DOH': { city: 'Doha', country: 'Qatar', airport: 'Hamad International', region: 'Middle East' },
  'DXB': { city: 'Dubai', country: 'UAE', airport: 'Dubai International', region: 'Middle East' },
  'LHR': { city: 'London', country: 'UK', airport: 'Heathrow', region: 'Europe' },
  'CDG': { city: 'Paris', country: 'France', airport: 'Charles de Gaulle', region: 'Europe' },
  'FRA': { city: 'Frankfurt', country: 'Germany', airport: 'Frankfurt am Main', region: 'Europe' },
  'JFK': { city: 'New York', country: 'USA', airport: 'John F Kennedy International', region: 'North America' },
  'LAX': { city: 'Los Angeles', country: 'USA', airport: 'Los Angeles International', region: 'North America' },
  'ORD': { city: 'Chicago', country: 'USA', airport: 'O\'Hare International', region: 'North America' },
  'DFW': { city: 'Dallas', country: 'USA', airport: 'Dallas/Fort Worth International', region: 'North America' },
  'DEL': { city: 'New Delhi', country: 'India', airport: 'Indira Gandhi International', region: 'Asia' },
  'BOM': { city: 'Mumbai', country: 'India', airport: 'Chhatrapati Shivaji International', region: 'Asia' },
  'BLR': { city: 'Bengaluru', country: 'India', airport: 'Kempegowda International', region: 'Asia' },
  'MAA': { city: 'Chennai', country: 'India', airport: 'Chennai International', region: 'Asia' },
  'SIN': { city: 'Singapore', country: 'Singapore', airport: 'Changi', region: 'Asia' },
  'NRT': { city: 'Tokyo', country: 'Japan', airport: 'Narita International', region: 'Asia' }
};

export class SmartFlightEngine {
  static generateFlightData(flightNumber: string): FlightData | null {
    console.log(`🤖 AI Flight Engine processing: ${flightNumber}`);
    
    // Parse flight number
    const match = flightNumber.match(/^([A-Z0-9]{2})(\d+)$/);
    if (!match) {
      console.log(`❌ Invalid flight number format: ${flightNumber}`);
      return null;
    }

    const [, airlineCode, flightNum] = match;
    const airline = AIRLINE_DATA[airlineCode as keyof typeof AIRLINE_DATA];
    
    if (!airline) {
      console.log(`❌ Unknown airline: ${airlineCode}`);
      return this.generateGenericFlight(flightNumber, airlineCode);
    }

    console.log(`✅ Found airline: ${airline.name}`);

    // Use flight number to deterministically select route and aircraft
    const routeIndex = parseInt(flightNum) % airline.routes.length;
    const aircraftIndex = parseInt(flightNum) % airline.fleet.length;
    
    const route = airline.routes[routeIndex];
    const aircraft = airline.fleet[aircraftIndex];
    
    const fromAirport = AIRPORTS[route.from as keyof typeof AIRPORTS];
    const toAirport = AIRPORTS[route.to as keyof typeof AIRPORTS];

    if (!fromAirport || !toAirport) {
      console.log(`❌ Airport data missing for route: ${route.from} -> ${route.to}`);
      return null;
    }

    // Generate realistic timing
    const now = new Date();
    const departureTime = new Date(now.getTime() + Math.random() * 24 * 60 * 60 * 1000); // Within 24 hours
    const arrivalTime = new Date(departureTime.getTime() + route.duration * 60 * 1000);

    const flightData: FlightData = {
      flightNumber,
      airline: {
        name: airline.name,
        code: airlineCode,
        country: airline.country
      },
      aircraft: {
        type: aircraft,
        manufacturer: aircraft.includes('Boeing') ? 'Boeing' : 'Airbus'
      },
      route: {
        from: {
          iata: route.from,
          city: fromAirport.city,
          country: fromAirport.country,
          airport: fromAirport.airport
        },
        to: {
          iata: route.to,
          city: toAirport.city,
          country: toAirport.country,
          airport: toAirport.airport
        },
        distance: route.distance,
        duration: this.calculateDuration(route.distance)
      },
      timing: {
        scheduled: {
          departure: departureTime.toISOString(),
          arrival: arrivalTime.toISOString()
        }
      },
      status: {
        current: Math.random() > 0.1 ? 'On Time' : 'Delayed'
      }
    };

    console.log(`🎯 Generated flight: ${fromAirport.city} -> ${toAirport.city} (${route.distance}mi)`);
    return flightData;
  }

  private static generateGenericFlight(flightNumber: string, airlineCode: string): FlightData | null {
    console.log(`🔄 Generating generic flight for ${airlineCode}`);
    
    // Common airline patterns
    const genericAirlines: Record<string, any> = {
      'UA': { name: 'United Airlines', country: 'USA', fleet: ['Boeing 737-800', 'Boeing 787-9'] },
      'DL': { name: 'Delta Air Lines', country: 'USA', fleet: ['Boeing 737-900', 'Airbus A330'] },
      'BA': { name: 'British Airways', country: 'UK', fleet: ['Boeing 777-300ER', 'Airbus A380'] },
      'LH': { name: 'Lufthansa', country: 'Germany', fleet: ['Airbus A320neo', 'Boeing 747-8'] },
      'AF': { name: 'Air France', country: 'France', fleet: ['Airbus A350-900', 'Boeing 777-300ER'] },
      'SQ': { name: 'Singapore Airlines', country: 'Singapore', fleet: ['Airbus A350-900', 'Boeing 777-300ER'] }
    };

    const airline = genericAirlines[airlineCode] || {
      name: `${airlineCode} Airlines`,
      country: 'Unknown',
      fleet: ['Boeing 737-800', 'Airbus A320']
    };

    // Generate a common route
    const commonRoutes = [
      { from: 'JFK', to: 'LHR', distance: 3459 },
      { from: 'LAX', to: 'NRT', distance: 5433 },
      { from: 'DEL', to: 'BOM', distance: 1144 },
      { from: 'DXB', to: 'LHR', distance: 3414 }
    ];

    const flightNum = flightNumber.replace(/[A-Z]/g, '');
    const routeIndex = parseInt(flightNum || '0') % commonRoutes.length;
    const route = commonRoutes[routeIndex];

    const fromAirport = AIRPORTS[route.from as keyof typeof AIRPORTS];
    const toAirport = AIRPORTS[route.to as keyof typeof AIRPORTS];

    if (!fromAirport || !toAirport) return null;

    return {
      flightNumber,
      airline: {
        name: airline.name,
        code: airlineCode,
        country: airline.country
      },
      aircraft: {
        type: airline.fleet[0],
        manufacturer: airline.fleet[0].includes('Boeing') ? 'Boeing' : 'Airbus'
      },
      route: {
        from: {
          iata: route.from,
          city: fromAirport.city,
          country: fromAirport.country,
          airport: fromAirport.airport
        },
        to: {
          iata: route.to,
          city: toAirport.city,
          country: toAirport.country,
          airport: toAirport.airport
        },
        distance: route.distance,
        duration: this.calculateDuration(route.distance)
      },
      timing: {
        scheduled: {
          departure: new Date().toISOString(),
          arrival: new Date(Date.now() + this.calculateDuration(route.distance) * 60000).toISOString()
        }
      },
      status: { current: 'Scheduled' }
    };
  }

  private static calculateDuration(distance: number): number {
    // More realistic duration calculation
    if (distance < 500) return Math.round(distance / 7); // Short haul: ~7 miles/minute
    if (distance < 2000) return Math.round(distance / 8); // Medium haul: ~8 miles/minute  
    return Math.round(distance / 9); // Long haul: ~9 miles/minute (including taxi time)
  }
}
