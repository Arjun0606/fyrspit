// Comprehensive global airports database
export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  region: string;
  timezone: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const airportsDatabase: Airport[] = [
  // Major US Airports
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States', region: 'North America', timezone: 'America/Los_Angeles', coordinates: { lat: 33.9425, lng: -118.4081 } },
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', region: 'North America', timezone: 'America/New_York', coordinates: { lat: 40.6413, lng: -73.7781 } },
  { code: 'LGA', name: 'LaGuardia Airport', city: 'New York', country: 'United States', region: 'North America', timezone: 'America/New_York', coordinates: { lat: 40.7769, lng: -73.8740 } },
  { code: 'EWR', name: 'Newark Liberty International Airport', city: 'Newark', country: 'United States', region: 'North America', timezone: 'America/New_York', coordinates: { lat: 40.6895, lng: -74.1745 } },
  { code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', region: 'Europe', timezone: 'Europe/London', coordinates: { lat: 51.4700, lng: -0.4543 } },
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', region: 'Middle East', timezone: 'Asia/Dubai', coordinates: { lat: 25.2532, lng: 55.3657 } },
  { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States', region: 'North America', timezone: 'America/Los_Angeles', coordinates: { lat: 37.6213, lng: -122.3790 } },
  { code: 'ORD', name: 'O\'Hare International Airport', city: 'Chicago', country: 'United States', region: 'North America', timezone: 'America/Chicago', coordinates: { lat: 41.9742, lng: -87.9073 } },
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'United States', region: 'North America', timezone: 'America/New_York', coordinates: { lat: 33.6407, lng: -84.4277 } },
  { code: 'DEN', name: 'Denver International Airport', city: 'Denver', country: 'United States', region: 'North America', timezone: 'America/Denver', coordinates: { lat: 39.8561, lng: -104.6737 } },
  
  // Indian Airports
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', region: 'Asia', timezone: 'Asia/Kolkata', coordinates: { lat: 19.0896, lng: 72.8656 } },
  { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India', region: 'Asia', timezone: 'Asia/Kolkata', coordinates: { lat: 28.5665, lng: 77.1031 } },
  { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bangalore', country: 'India', region: 'Asia', timezone: 'Asia/Kolkata', coordinates: { lat: 13.1986, lng: 77.7066 } },
  { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India', region: 'Asia', timezone: 'Asia/Kolkata', coordinates: { lat: 12.9941, lng: 80.1709 } },
  { code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India', region: 'Asia', timezone: 'Asia/Kolkata', coordinates: { lat: 17.2403, lng: 78.4294 } },
  { code: 'CCU', name: 'Netaji Subhas Chandra Bose International Airport', city: 'Kolkata', country: 'India', region: 'Asia', timezone: 'Asia/Kolkata', coordinates: { lat: 22.6546, lng: 88.4467 } },
  { code: 'PNQ', name: 'Pune Airport', city: 'Pune', country: 'India', region: 'Asia', timezone: 'Asia/Kolkata', coordinates: { lat: 18.5822, lng: 73.9197 } },
  { code: 'AMD', name: 'Sardar Vallabhbhai Patel International Airport', city: 'Ahmedabad', country: 'India', region: 'Asia', timezone: 'Asia/Kolkata', coordinates: { lat: 23.0773, lng: 72.6347 } },
  { code: 'GOI', name: 'Goa International Airport', city: 'Goa', country: 'India', region: 'Asia', timezone: 'Asia/Kolkata', coordinates: { lat: 15.3808, lng: 73.8314 } },
  { code: 'COK', name: 'Cochin International Airport', city: 'Kochi', country: 'India', region: 'Asia', timezone: 'Asia/Kolkata', coordinates: { lat: 10.1520, lng: 76.4019 } },
  
  // European Airports
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', region: 'Europe', timezone: 'Europe/Paris', coordinates: { lat: 49.0097, lng: 2.5479 } },
  { code: 'LGW', name: 'London Gatwick Airport', city: 'London', country: 'United Kingdom', region: 'Europe', timezone: 'Europe/London', coordinates: { lat: 51.1537, lng: -0.1821 } },
  { code: 'STN', name: 'London Stansted Airport', city: 'London', country: 'United Kingdom', region: 'Europe', timezone: 'Europe/London', coordinates: { lat: 51.8860, lng: 0.2389 } },
  { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', region: 'Europe', timezone: 'Europe/Amsterdam', coordinates: { lat: 52.3105, lng: 4.7683 } },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', region: 'Europe', timezone: 'Europe/Berlin', coordinates: { lat: 50.0379, lng: 8.5622 } },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', region: 'Europe', timezone: 'Europe/Berlin', coordinates: { lat: 48.3538, lng: 11.7861 } },
  { code: 'FCO', name: 'Leonardo da Vinci International Airport', city: 'Rome', country: 'Italy', region: 'Europe', timezone: 'Europe/Rome', coordinates: { lat: 41.8003, lng: 12.2389 } },
  { code: 'BCN', name: 'Barcelona-El Prat Airport', city: 'Barcelona', country: 'Spain', region: 'Europe', timezone: 'Europe/Madrid', coordinates: { lat: 41.2974, lng: 2.0833 } },
  { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas Airport', city: 'Madrid', country: 'Spain', region: 'Europe', timezone: 'Europe/Madrid', coordinates: { lat: 40.4719, lng: -3.5626 } },
  { code: 'ZUR', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', region: 'Europe', timezone: 'Europe/Zurich', coordinates: { lat: 47.4647, lng: 8.5492 } },
  
  // Asian Airports
  { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', region: 'Asia', timezone: 'Asia/Tokyo', coordinates: { lat: 35.7653, lng: 140.3856 } },
  { code: 'HND', name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan', region: 'Asia', timezone: 'Asia/Tokyo', coordinates: { lat: 35.5494, lng: 139.7798 } },
  { code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', region: 'Asia', timezone: 'Asia/Seoul', coordinates: { lat: 37.4602, lng: 126.4407 } },
  { code: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China', region: 'Asia', timezone: 'Asia/Shanghai', coordinates: { lat: 40.0799, lng: 116.6031 } },
  { code: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China', region: 'Asia', timezone: 'Asia/Shanghai', coordinates: { lat: 31.1443, lng: 121.8083 } },
  { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', region: 'Asia', timezone: 'Asia/Hong_Kong', coordinates: { lat: 22.3080, lng: 113.9185 } },
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', region: 'Asia', timezone: 'Asia/Singapore', coordinates: { lat: 1.3644, lng: 103.9915 } },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', region: 'Asia', timezone: 'Asia/Bangkok', coordinates: { lat: 13.6900, lng: 100.7501 } },
  { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', region: 'Asia', timezone: 'Asia/Kuala_Lumpur', coordinates: { lat: 2.7456, lng: 101.7072 } },
  { code: 'CGK', name: 'Soekarno-Hatta International Airport', city: 'Jakarta', country: 'Indonesia', region: 'Asia', timezone: 'Asia/Jakarta', coordinates: { lat: -6.1275, lng: 106.6537 } },
  
  // Middle East & Africa
  { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', region: 'Middle East', timezone: 'Asia/Qatar', coordinates: { lat: 25.2731, lng: 51.6086 } },
  { code: 'AUH', name: 'Abu Dhabi International Airport', city: 'Abu Dhabi', country: 'United Arab Emirates', region: 'Middle East', timezone: 'Asia/Dubai', coordinates: { lat: 24.4330, lng: 54.6511 } },
  { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt', region: 'Africa', timezone: 'Africa/Cairo', coordinates: { lat: 30.1219, lng: 31.4056 } },
  { code: 'JNB', name: 'O.R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa', region: 'Africa', timezone: 'Africa/Johannesburg', coordinates: { lat: -26.1367, lng: 28.2411 } },
  { code: 'CPT', name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa', region: 'Africa', timezone: 'Africa/Johannesburg', coordinates: { lat: -33.9715, lng: 18.6021 } },
  
  // Australian & Oceania
  { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', region: 'Oceania', timezone: 'Australia/Sydney', coordinates: { lat: -33.9399, lng: 151.1753 } },
  { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', region: 'Oceania', timezone: 'Australia/Melbourne', coordinates: { lat: -37.6690, lng: 144.8410 } },
  { code: 'BNE', name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia', region: 'Oceania', timezone: 'Australia/Brisbane', coordinates: { lat: -27.3942, lng: 153.1218 } },
  { code: 'PER', name: 'Perth Airport', city: 'Perth', country: 'Australia', region: 'Oceania', timezone: 'Australia/Perth', coordinates: { lat: -31.9385, lng: 115.9672 } },
  { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', region: 'Oceania', timezone: 'Pacific/Auckland', coordinates: { lat: -37.0082, lng: 174.7850 } },
  
  // Canadian Airports
  { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada', region: 'North America', timezone: 'America/Toronto', coordinates: { lat: 43.6777, lng: -79.6248 } },
  { code: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada', region: 'North America', timezone: 'America/Vancouver', coordinates: { lat: 49.1967, lng: -123.1815 } },
  { code: 'YUL', name: 'Montreal-Pierre Elliott Trudeau International Airport', city: 'Montreal', country: 'Canada', region: 'North America', timezone: 'America/Toronto', coordinates: { lat: 45.4576, lng: -73.7497 } },
  
  // South American Airports
  { code: 'GIG', name: 'Rio de Janeiro-Galeão International Airport', city: 'Rio de Janeiro', country: 'Brazil', region: 'South America', timezone: 'America/Sao_Paulo', coordinates: { lat: -22.8099, lng: -43.2505 } },
  { code: 'GRU', name: 'São Paulo-Guarulhos International Airport', city: 'São Paulo', country: 'Brazil', region: 'South America', timezone: 'America/Sao_Paulo', coordinates: { lat: -23.4356, lng: -46.4731 } },
  { code: 'EZE', name: 'Ezeiza International Airport', city: 'Buenos Aires', country: 'Argentina', region: 'South America', timezone: 'America/Argentina/Buenos_Aires', coordinates: { lat: -34.8222, lng: -58.5358 } },
  { code: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia', region: 'South America', timezone: 'America/Bogota', coordinates: { lat: 4.7016, lng: -74.1469 } },
  { code: 'LIM', name: 'Jorge Chávez International Airport', city: 'Lima', country: 'Peru', region: 'South America', timezone: 'America/Lima', coordinates: { lat: -12.0219, lng: -77.1143 } },
  
  // More US Airports
  { code: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'United States', region: 'North America', timezone: 'America/New_York', coordinates: { lat: 25.7959, lng: -80.2870 } },
  { code: 'LAS', name: 'McCarran International Airport', city: 'Las Vegas', country: 'United States', region: 'North America', timezone: 'America/Los_Angeles', coordinates: { lat: 36.0840, lng: -115.1537 } },
  { code: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', country: 'United States', region: 'North America', timezone: 'America/Los_Angeles', coordinates: { lat: 47.4502, lng: -122.3088 } },
  { code: 'BOS', name: 'Logan International Airport', city: 'Boston', country: 'United States', region: 'North America', timezone: 'America/New_York', coordinates: { lat: 42.3656, lng: -71.0096 } },
  { code: 'DCA', name: 'Ronald Reagan Washington National Airport', city: 'Washington', country: 'United States', region: 'North America', timezone: 'America/New_York', coordinates: { lat: 38.8512, lng: -77.0402 } },
  { code: 'IAD', name: 'Washington Dulles International Airport', city: 'Washington', country: 'United States', region: 'North America', timezone: 'America/New_York', coordinates: { lat: 38.9531, lng: -77.4565 } },
  { code: 'BWI', name: 'Baltimore-Washington International Airport', city: 'Baltimore', country: 'United States', region: 'North America', timezone: 'America/New_York', coordinates: { lat: 39.1774, lng: -76.6684 } },
  { code: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', country: 'United States', region: 'North America', timezone: 'America/Phoenix', coordinates: { lat: 33.4342, lng: -112.0116 } },
  { code: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston', country: 'United States', region: 'North America', timezone: 'America/Chicago', coordinates: { lat: 29.9902, lng: -95.3368 } },
  { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'United States', region: 'North America', timezone: 'America/Chicago', coordinates: { lat: 32.8969, lng: -97.0380 } },
];

// Helper functions for airport operations
export function searchAirports(query: string): Airport[] {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return airportsDatabase.slice(0, 50); // Return first 50 if no query
  
  return airportsDatabase.filter(airport => 
    airport.code.toLowerCase().includes(searchTerm) ||
    airport.name.toLowerCase().includes(searchTerm) ||
    airport.city.toLowerCase().includes(searchTerm) ||
    airport.country.toLowerCase().includes(searchTerm)
  ).slice(0, 100); // Limit to 100 results
}

export function getAirportsByCity(city: string): Airport[] {
  return airportsDatabase.filter(airport => 
    airport.city.toLowerCase() === city.toLowerCase()
  );
}

export function getAirportByCode(code: string): Airport | undefined {
  return airportsDatabase.find(airport => 
    airport.code.toLowerCase() === code.toLowerCase()
  );
}

export function getPopularAirports(): Airport[] {
  return [
    getAirportByCode('LAX')!,
    getAirportByCode('JFK')!,
    getAirportByCode('LHR')!,
    getAirportByCode('DXB')!,
    getAirportByCode('BOM')!,
    getAirportByCode('DEL')!,
    getAirportByCode('BLR')!,
    getAirportByCode('SIN')!,
  ];
}
