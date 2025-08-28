const fs = require('fs');

console.log('🌍 Processing global airport database...');

// Read the raw airport data
const rawData = JSON.parse(fs.readFileSync('airports-raw.json', 'utf8'));

const processedAirports = [];
let validAirportsCount = 0;
let totalAirportsCount = 0;

// Process each airport
for (const [icao, airport] of Object.entries(rawData)) {
  totalAirportsCount++;
  
  // Filter criteria:
  // 1. Must have a valid IATA code (3 letters) OR be a major airport by name
  // 2. Must have name, city, country
  // 3. Must have coordinates
  // 4. Skip small private airfields and heliports
  
  const hasValidIata = airport.iata && airport.iata.length === 3 && airport.iata.match(/^[A-Z]{3}$/);
  const hasMajorIndicators = airport.name && (
    airport.name.includes('International') ||
    airport.name.includes('Airport') ||
    airport.name.includes('Regional') ||
    airport.name.includes('Municipal') ||
    airport.name.includes('Metropolitan')
  );
  
  // Skip if no basic info
  if (!airport.name || !airport.city || !airport.country || !airport.lat || !airport.lon) {
    continue;
  }
  
  // Skip small airfields, heliports, seaplane bases
  if (airport.name.includes('Heliport') || 
      airport.name.includes('Helipad') ||
      airport.name.includes('Seaplane') ||
      airport.name.includes('Strip') ||
      airport.name.includes('Private') ||
      airport.name.includes('Ranch') ||
      airport.name.includes('Farm')) {
    continue;
  }
  
  // Include if it has IATA code OR seems like a major airport
  if (hasValidIata || hasMajorIndicators) {
    const processedAirport = {
      code: airport.iata || icao, // Prefer IATA, fallback to ICAO
      icao: icao,
      iata: airport.iata || '',
      name: airport.name,
      city: airport.city,
      state: airport.state || '',
      country: airport.country,
      region: getRegion(airport.country),
      timezone: airport.tz || '',
      elevation: airport.elevation || 0,
      coordinates: {
        lat: parseFloat(airport.lat),
        lng: parseFloat(airport.lon)
      }
    };
    
    processedAirports.push(processedAirport);
    validAirportsCount++;
  }
}

// Sort airports by importance (IATA codes first, then by name)
processedAirports.sort((a, b) => {
  // IATA codes first
  if (a.iata && !b.iata) return -1;
  if (!a.iata && b.iata) return 1;
  
  // Then by name
  return a.name.localeCompare(b.name);
});

console.log(`📊 Processed ${totalAirportsCount} total airports`);
console.log(`✅ Selected ${validAirportsCount} airports for the database`);
console.log(`📈 Filtered out ${totalAirportsCount - validAirportsCount} small/private airfields`);

// Write the processed data
const outputData = {
  airports: processedAirports,
  metadata: {
    totalCount: validAirportsCount,
    generatedAt: new Date().toISOString(),
    source: 'https://github.com/mwgg/Airports'
  }
};

fs.writeFileSync('lib/global-airports-data.json', JSON.stringify(outputData, null, 2));
console.log('💾 Saved to lib/global-airports-data.json');

// Generate TypeScript file
const tsContent = `// Auto-generated global airports database
// Source: https://github.com/mwgg/Airports
// Generated: ${new Date().toISOString()}
// Total airports: ${validAirportsCount}

export interface Airport {
  code: string; // IATA code (preferred) or ICAO
  icao: string; // ICAO code
  iata: string; // IATA code (3 letters) or empty
  name: string;
  city: string;
  state?: string; // For US/Canada/Australia
  country: string;
  region: string;
  timezone: string;
  elevation: number; // in feet
  coordinates: {
    lat: number;
    lng: number;
  };
}

const airportsData = ${JSON.stringify(processedAirports, null, 2)};

export const globalAirports: Airport[] = airportsData;

// Helper functions
export function searchAirports(query: string, limit: number = 100): Airport[] {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return globalAirports.slice(0, 50); // Return first 50 if no query
  
  return globalAirports.filter(airport => 
    airport.code.toLowerCase().includes(searchTerm) ||
    airport.name.toLowerCase().includes(searchTerm) ||
    airport.city.toLowerCase().includes(searchTerm) ||
    airport.country.toLowerCase().includes(searchTerm) ||
    (airport.iata && airport.iata.toLowerCase().includes(searchTerm)) ||
    airport.icao.toLowerCase().includes(searchTerm)
  ).slice(0, limit);
}

export function getAirportsByCountry(country: string): Airport[] {
  return globalAirports.filter(airport => 
    airport.country.toLowerCase() === country.toLowerCase()
  );
}

export function getAirportsByRegion(region: string): Airport[] {
  return globalAirports.filter(airport => 
    airport.region.toLowerCase() === region.toLowerCase()
  );
}

export function getAirportByCode(code: string): Airport | undefined {
  return globalAirports.find(airport => 
    airport.code.toLowerCase() === code.toLowerCase() ||
    airport.iata.toLowerCase() === code.toLowerCase() ||
    airport.icao.toLowerCase() === code.toLowerCase()
  );
}

export function getPopularAirports(): Airport[] {
  // Return airports with IATA codes that are likely major airports
  return globalAirports
    .filter(airport => airport.iata && airport.iata.length === 3)
    .slice(0, 50); // Top 50 by our sorting
}

export function getAirportsByCity(city: string): Airport[] {
  return globalAirports.filter(airport => 
    airport.city.toLowerCase() === city.toLowerCase()
  );
}
`;

fs.writeFileSync('lib/global-airports.ts', tsContent);
console.log('🚀 Generated TypeScript file: lib/global-airports.ts');

function getRegion(country) {
  const regions = {
    'US': 'North America',
    'CA': 'North America',
    'MX': 'North America',
    'GT': 'Central America',
    'BZ': 'Central America',
    'SV': 'Central America',
    'HN': 'Central America',
    'NI': 'Central America',
    'CR': 'Central America',
    'PA': 'Central America',
    'AR': 'South America',
    'BO': 'South America',
    'BR': 'South America',
    'CL': 'South America',
    'CO': 'South America',
    'EC': 'South America',
    'GY': 'South America',
    'PY': 'South America',
    'PE': 'South America',
    'SR': 'South America',
    'UY': 'South America',
    'VE': 'South America',
    'AD': 'Europe',
    'AL': 'Europe',
    'AT': 'Europe',
    'BY': 'Europe',
    'BE': 'Europe',
    'BA': 'Europe',
    'BG': 'Europe',
    'HR': 'Europe',
    'CY': 'Europe',
    'CZ': 'Europe',
    'DK': 'Europe',
    'EE': 'Europe',
    'FI': 'Europe',
    'FR': 'Europe',
    'DE': 'Europe',
    'GR': 'Europe',
    'HU': 'Europe',
    'IS': 'Europe',
    'IE': 'Europe',
    'IT': 'Europe',
    'LV': 'Europe',
    'LI': 'Europe',
    'LT': 'Europe',
    'LU': 'Europe',
    'MK': 'Europe',
    'MT': 'Europe',
    'MD': 'Europe',
    'MC': 'Europe',
    'ME': 'Europe',
    'NL': 'Europe',
    'NO': 'Europe',
    'PL': 'Europe',
    'PT': 'Europe',
    'RO': 'Europe',
    'RU': 'Europe',
    'SM': 'Europe',
    'RS': 'Europe',
    'SK': 'Europe',
    'SI': 'Europe',
    'ES': 'Europe',
    'SE': 'Europe',
    'CH': 'Europe',
    'UA': 'Europe',
    'GB': 'Europe',
    'VA': 'Europe',
    'CN': 'Asia',
    'IN': 'Asia',
    'JP': 'Asia',
    'KR': 'Asia',
    'TH': 'Asia',
    'SG': 'Asia',
    'MY': 'Asia',
    'ID': 'Asia',
    'PH': 'Asia',
    'VN': 'Asia',
    'HK': 'Asia',
    'TW': 'Asia',
    'MO': 'Asia',
    'KH': 'Asia',
    'LA': 'Asia',
    'MM': 'Asia',
    'BN': 'Asia',
    'MN': 'Asia',
    'KZ': 'Asia',
    'KG': 'Asia',
    'TJ': 'Asia',
    'TM': 'Asia',
    'UZ': 'Asia',
    'AF': 'Asia',
    'BD': 'Asia',
    'BT': 'Asia',
    'LK': 'Asia',
    'MV': 'Asia',
    'NP': 'Asia',
    'PK': 'Asia',
    'AE': 'Middle East',
    'BH': 'Middle East',
    'CY': 'Middle East',
    'EG': 'Middle East',
    'IR': 'Middle East',
    'IQ': 'Middle East',
    'IL': 'Middle East',
    'JO': 'Middle East',
    'KW': 'Middle East',
    'LB': 'Middle East',
    'OM': 'Middle East',
    'PS': 'Middle East',
    'QA': 'Middle East',
    'SA': 'Middle East',
    'SY': 'Middle East',
    'TR': 'Middle East',
    'YE': 'Middle East',
    'AU': 'Oceania',
    'NZ': 'Oceania',
    'FJ': 'Oceania',
    'PG': 'Oceania',
    'SB': 'Oceania',
    'VU': 'Oceania',
    'WS': 'Oceania',
    'TO': 'Oceania',
    'TV': 'Oceania',
    'NR': 'Oceania',
    'KI': 'Oceania',
    'MH': 'Oceania',
    'FM': 'Oceania',
    'PW': 'Oceania'
  };
  
  // Default to Africa for African countries, or International for others
  if (regions[country]) {
    return regions[country];
  }
  
  // African countries
  const africanCountries = ['DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CM', 'CV', 'CF', 'TD', 'KM', 'CG', 'CD', 'CI', 'DJ', 'EG', 'GQ', 'ER', 'ET', 'GA', 'GM', 'GH', 'GN', 'GW', 'KE', 'LS', 'LR', 'LY', 'MG', 'MW', 'ML', 'MR', 'MU', 'MA', 'MZ', 'NA', 'NE', 'NG', 'RW', 'ST', 'SN', 'SC', 'SL', 'SO', 'ZA', 'SS', 'SD', 'SZ', 'TZ', 'TG', 'TN', 'UG', 'ZM', 'ZW'];
  
  if (africanCountries.includes(country)) {
    return 'Africa';
  }
  
  return 'International';
}

console.log('✅ Done! Ready to use in your app.');
