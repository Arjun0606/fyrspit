/**
 * Comprehensive Aircraft Database
 * Used for auto-enrichment and aircraft information lookup
 */

export interface AircraftType {
  icaoCode: string;
  iataCode?: string;
  manufacturer: string;
  model: string;
  variant?: string;
  category: 'narrow-body' | 'wide-body' | 'regional' | 'cargo' | 'supersonic';
  engines: {
    count: number;
    type: 'turbofan' | 'turboprop' | 'piston';
    manufacturer?: string;
    model?: string;
  };
  capacity: {
    typical: number;
    max: number;
    cargo?: number; // kg
  };
  range: number; // nautical miles
  cruiseSpeed: number; // knots
  maxSpeed: number; // knots
  serviceYear?: number;
  retired?: boolean;
  commonNames: string[];
}

// Comprehensive aircraft database
export const aircraftDatabase: AircraftType[] = [
  // Airbus Family
  {
    icaoCode: 'A319',
    iataCode: '319',
    manufacturer: 'Airbus',
    model: 'A319',
    category: 'narrow-body',
    engines: { count: 2, type: 'turbofan' },
    capacity: { typical: 134, max: 156 },
    range: 3750,
    cruiseSpeed: 447,
    maxSpeed: 537,
    serviceYear: 1996,
    commonNames: ['A319', 'Airbus A319']
  },
  {
    icaoCode: 'A320',
    iataCode: '320',
    manufacturer: 'Airbus',
    model: 'A320',
    category: 'narrow-body',
    engines: { count: 2, type: 'turbofan' },
    capacity: { typical: 150, max: 180 },
    range: 3300,
    cruiseSpeed: 447,
    maxSpeed: 537,
    serviceYear: 1988,
    commonNames: ['A320', 'Airbus A320']
  },
  {
    icaoCode: 'A321',
    iataCode: '321',
    manufacturer: 'Airbus',
    model: 'A321',
    category: 'narrow-body',
    engines: { count: 2, type: 'turbofan' },
    capacity: { typical: 185, max: 236 },
    range: 3200,
    cruiseSpeed: 447,
    maxSpeed: 537,
    serviceYear: 1994,
    commonNames: ['A321', 'Airbus A321']
  },
  {
    icaoCode: 'A330',
    iataCode: '330',
    manufacturer: 'Airbus',
    model: 'A330',
    category: 'wide-body',
    engines: { count: 2, type: 'turbofan' },
    capacity: { typical: 277, max: 406 },
    range: 7200,
    cruiseSpeed: 460,
    maxSpeed: 560,
    serviceYear: 1994,
    commonNames: ['A330', 'Airbus A330']
  },
  {
    icaoCode: 'A350',
    iataCode: '359',
    manufacturer: 'Airbus',
    model: 'A350',
    category: 'wide-body',
    engines: { count: 2, type: 'turbofan' },
    capacity: { typical: 315, max: 440 },
    range: 8100,
    cruiseSpeed: 488,
    maxSpeed: 561,
    serviceYear: 2015,
    commonNames: ['A350', 'Airbus A350']
  },
  {
    icaoCode: 'A380',
    iataCode: '388',
    manufacturer: 'Airbus',
    model: 'A380',
    category: 'wide-body',
    engines: { count: 4, type: 'turbofan' },
    capacity: { typical: 525, max: 853 },
    range: 8000,
    cruiseSpeed: 488,
    maxSpeed: 561,
    serviceYear: 2007,
    commonNames: ['A380', 'Airbus A380', 'Super Jumbo', 'A380-800', 'Airbus A380-800']
  },

  // Boeing Family
  {
    icaoCode: 'B737',
    iataCode: '737',
    manufacturer: 'Boeing',
    model: '737',
    category: 'narrow-body',
    engines: { count: 2, type: 'turbofan' },
    capacity: { typical: 149, max: 189 },
    range: 3300,
    cruiseSpeed: 447,
    maxSpeed: 544,
    serviceYear: 1967,
    commonNames: ['737', 'Boeing 737', 'B737']
  },
  {
    icaoCode: 'B738',
    iataCode: '738',
    manufacturer: 'Boeing',
    model: '737-800',
    category: 'narrow-body',
    engines: { count: 2, type: 'turbofan' },
    capacity: { typical: 162, max: 189 },
    range: 2935,
    cruiseSpeed: 447,
    maxSpeed: 544,
    serviceYear: 1998,
    commonNames: ['737-800', 'Boeing 737-800', 'B738']
  },
  {
    icaoCode: 'B39M',
    iataCode: '7M8',
    manufacturer: 'Boeing',
    model: '737 MAX 8',
    category: 'narrow-body',
    engines: { count: 2, type: 'turbofan' },
    capacity: { typical: 162, max: 189 },
    range: 3550,
    cruiseSpeed: 447,
    maxSpeed: 544,
    serviceYear: 2017,
    commonNames: ['737 MAX 8', 'Boeing 737 MAX 8', 'B39M']
  },
  {
    icaoCode: 'B752',
    iataCode: '752',
    manufacturer: 'Boeing',
    model: '757-200',
    category: 'narrow-body',
    engines: { count: 2, type: 'turbofan' },
    capacity: { typical: 200, max: 239 },
    range: 3900,
    cruiseSpeed: 459,
    maxSpeed: 544,
    serviceYear: 1983,
    commonNames: ['757', 'Boeing 757', 'B752']
  },
  {
    icaoCode: 'B763',
    iataCode: '763',
    manufacturer: 'Boeing',
    model: '767-300',
    category: 'wide-body',
    engines: { count: 2, type: 'turbofan' },
    capacity: { typical: 269, max: 350 },
    range: 5980,
    cruiseSpeed: 459,
    maxSpeed: 544,
    serviceYear: 1986,
    commonNames: ['767', 'Boeing 767', 'B763']
  },
  {
    icaoCode: 'B772',
    iataCode: '772',
    manufacturer: 'Boeing',
    model: '777-200',
    category: 'wide-body',
    engines: { count: 2, type: 'turbofan' },
    capacity: { typical: 314, max: 440 },
    range: 5240,
    cruiseSpeed: 487,
    maxSpeed: 590,
    serviceYear: 1995,
    commonNames: ['777', 'Boeing 777', 'B772']
  },
  {
    icaoCode: 'B77W',
    iataCode: '77W',
    manufacturer: 'Boeing',
    model: '777-300ER',
    category: 'wide-body',
    engines: { count: 2, type: 'turbofan' },
    capacity: { typical: 396, max: 550 },
    range: 7370,
    cruiseSpeed: 487,
    maxSpeed: 590,
    serviceYear: 2004,
    commonNames: ['777-300ER', 'Boeing 777-300ER', 'B77W', 'Triple Seven']
  },
  {
    icaoCode: 'B788',
    iataCode: '788',
    manufacturer: 'Boeing',
    model: '787-8',
    variant: 'Dreamliner',
    category: 'wide-body',
    engines: { count: 2, type: 'turbofan' },
    capacity: { typical: 242, max: 335 },
    range: 7355,
    cruiseSpeed: 488,
    maxSpeed: 593,
    serviceYear: 2011,
    commonNames: ['787', 'Boeing 787', 'Dreamliner', 'B788']
  },
  {
    icaoCode: 'B789',
    iataCode: '789',
    manufacturer: 'Boeing',
    model: '787-9',
    variant: 'Dreamliner',
    category: 'wide-body',
    engines: { count: 2, type: 'turbofan' },
    capacity: { typical: 290, max: 420 },
    range: 7635,
    cruiseSpeed: 488,
    maxSpeed: 593,
    serviceYear: 2014,
    commonNames: ['787-9', 'Boeing 787-9', 'Dreamliner', 'B789']
  },
  {
    icaoCode: 'B748',
    iataCode: '748',
    manufacturer: 'Boeing',
    model: '747-8',
    category: 'wide-body',
    engines: { count: 4, type: 'turbofan' },
    capacity: { typical: 467, max: 605 },
    range: 8000,
    cruiseSpeed: 490,
    maxSpeed: 614,
    serviceYear: 2012,
    commonNames: ['747-8', 'Boeing 747-8', 'Queen of the Skies', 'B748']
  },

  // Embraer Family
  {
    icaoCode: 'E190',
    iataCode: '190',
    manufacturer: 'Embraer',
    model: 'E190',
    category: 'regional',
    engines: { count: 2, type: 'turbofan' },
    capacity: { typical: 100, max: 114 },
    range: 2450,
    cruiseSpeed: 447,
    maxSpeed: 488,
    serviceYear: 2005,
    commonNames: ['E190', 'Embraer 190', 'E-Jet']
  },

  // Bombardier Family
  {
    icaoCode: 'CRJ9',
    iataCode: 'CR9',
    manufacturer: 'Bombardier',
    model: 'CRJ-900',
    category: 'regional',
    engines: { count: 2, type: 'turbofan' },
    capacity: { typical: 76, max: 90 },
    range: 1553,
    cruiseSpeed: 447,
    maxSpeed: 528,
    serviceYear: 2003,
    commonNames: ['CRJ-900', 'Bombardier CRJ-900', 'CRJ9']
  },

  // ATR Family
  {
    icaoCode: 'AT72',
    iataCode: 'AT7',
    manufacturer: 'ATR',
    model: 'ATR 72',
    category: 'regional',
    engines: { count: 2, type: 'turboprop' },
    capacity: { typical: 68, max: 78 },
    range: 825,
    cruiseSpeed: 276,
    maxSpeed: 322,
    serviceYear: 1989,
    commonNames: ['ATR 72', 'ATR-72', 'AT72']
  },

  // Additional variants for better Indian aviation coverage
  {
    icaoCode: 'B38M',
    iataCode: '7M8',
    manufacturer: 'Boeing',
    model: '737 MAX 8',
    category: 'narrow-body',
    engines: { count: 2, type: 'turbofan' },
    capacity: { typical: 189, max: 210 },
    range: 3550,
    cruiseSpeed: 447,
    maxSpeed: 544,
    serviceYear: 2017,
    commonNames: ['737 MAX 8', 'Boeing 737 MAX 8', 'B38M', '737-8']
  },
];

export class AircraftDatabase {
  /**
   * Find aircraft by ICAO code
   */
  static findByIcao(icaoCode: string): AircraftType | null {
    return aircraftDatabase.find(aircraft => 
      aircraft.icaoCode.toLowerCase() === icaoCode.toLowerCase()
    ) || null;
  }

  /**
   * Find aircraft by IATA code
   */
  static findByIata(iataCode: string): AircraftType | null {
    return aircraftDatabase.find(aircraft => 
      aircraft.iataCode?.toLowerCase() === iataCode.toLowerCase()
    ) || null;
  }

  /**
   * Search aircraft by name/model
   */
  static search(query: string): AircraftType[] {
    const lowercaseQuery = query.toLowerCase();
    return aircraftDatabase.filter(aircraft => 
      aircraft.commonNames.some(name => 
        name.toLowerCase().includes(lowercaseQuery)
      ) ||
      aircraft.model.toLowerCase().includes(lowercaseQuery) ||
      aircraft.manufacturer.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Get aircraft suggestions for autocomplete
   */
  static getSuggestions(query: string, limit = 10): string[] {
    if (query.length < 2) return [];
    
    const results = this.search(query);
    return results
      .slice(0, limit)
      .map(aircraft => aircraft.commonNames[0]);
  }

  /**
   * Get aircraft details for enrichment
   */
  static getAircraftDetails(code: string): {
    model: string;
    manufacturer: string;
    category: string;
    capacity: number;
    range: number;
    engines: string;
  } | null {
    const aircraft = this.findByIcao(code) || this.findByIata(code) || this.search(code)[0];
    
    if (!aircraft) return null;
    
    return {
      model: aircraft.model,
      manufacturer: aircraft.manufacturer,
      category: aircraft.category,
      capacity: aircraft.capacity.typical,
      range: aircraft.range,
      engines: `${aircraft.engines.count}x ${aircraft.engines.type}`,
    };
  }

  /**
   * Normalize aircraft code input
   */
  static normalizeCode(input: string): string {
    // Remove spaces and convert to uppercase
    const clean = input.replace(/\s+/g, '').toUpperCase();
    
    // Try to find a match
    const aircraft = this.findByIcao(clean) || this.findByIata(clean);
    return aircraft ? aircraft.icaoCode : clean;
  }

  /**
   * Get all aircraft by category
   */
  static getByCategory(category: AircraftType['category']): AircraftType[] {
    return aircraftDatabase.filter(aircraft => aircraft.category === category);
  }

  /**
   * Get all manufacturers
   */
  static getManufacturers(): string[] {
    const manufacturers = new Set(aircraftDatabase.map(aircraft => aircraft.manufacturer));
    return Array.from(manufacturers).sort();
  }
}
