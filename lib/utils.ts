import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Haversine distance calculation
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): { km: number; mi: number } {
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const km = R * c;
  const mi = km * 0.621371;
  
  return { km: Math.round(km), mi: Math.round(mi) };
}

// Flight hours estimation based on aircraft type
export function estimateFlightHours(distanceKm: number, aircraftCode?: string): number {
  const aircraftSpeeds: Record<string, number> = {
    'A320': 840,
    'A321': 840,
    'A330': 880,
    'A350': 900,
    'A380': 900,
    'B737': 828,
    'B747': 900,
    'B777': 905,
    'B787': 913,
  };
  
  const cruiseSpeed = aircraftCode && aircraftSpeeds[aircraftCode] ? aircraftSpeeds[aircraftCode] : 850;
  return Math.round((distanceKm / cruiseSpeed) * 100) / 100; // Round to 2 decimal places
}

// Time of day calculation from departure time
export function getTimeOfDay(departureTime: string, timezoneOffset: number = 0): 'day' | 'night' {
  const time = new Date(`2000-01-01T${departureTime}`);
  const adjustedHour = (time.getHours() + timezoneOffset) % 24;
  return adjustedHour >= 6 && adjustedHour < 22 ? 'day' : 'night';
}

// XP calculation formula
export function calculateXP(params: {
  distanceKm: number;
  cabinClass: 'economy' | 'premium' | 'business' | 'first';
  photoCount: number;
  reviewLength: number;
  isNewAirport: boolean;
}): number {
  const { distanceKm, cabinClass, photoCount, reviewLength, isNewAirport } = params;
  
  const base = 10;
  const distancePts = Math.floor(distanceKm / 500) * 5;
  
  const classMultipliers = {
    economy: 1.0,
    premium: 1.2,
    business: 2.0,
    first: 3.0,
  };
  
  const adjustedDistancePts = Math.round(distancePts * classMultipliers[cabinClass]);
  const photoBonus = Math.min(4, photoCount) * 5;
  const reviewBonus = Math.min(15, Math.floor(reviewLength / 200) * 3);
  const newAirportBonus = isNewAirport ? 20 : 0;
  
  return base + adjustedDistancePts + photoBonus + reviewBonus + newAirportBonus;
}

// Level calculation from XP
export function calculateLevel(xp: number): number {
  if (xp < 100) return 1;
  if (xp < 300) return 2;
  if (xp < 600) return 3;
  if (xp < 1000) return 4;
  if (xp < 1600) return 5;
  
  // Level 6+: each level requires 600 XP more
  return 5 + Math.floor((xp - 1600) / 600) + 1;
}

// Format duration in hours to human readable
export function formatDuration(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// Format distance with units
export function formatDistance(km: number, unit: 'km' | 'mi' = 'km'): string {
  if (unit === 'mi') {
    const mi = km * 0.621371;
    return `${Math.round(mi).toLocaleString()} mi`;
  }
  return `${Math.round(km).toLocaleString()} km`;
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Check if user is new to airport
export function isNewAirport(userAirports: string[], airportIata: string): boolean {
  return !userAirports.includes(airportIata);
}

// Determine if flight is domestic or international
export function isDomesticFlight(fromCountry: string, toCountry: string): boolean {
  return fromCountry === toCountry;
}

// Get continent from country code
export function getContinent(countryCode: string): string {
  const continentMap: Record<string, string> = {
    // North America
    'US': 'NA', 'CA': 'NA', 'MX': 'NA',
    // Europe
    'GB': 'EU', 'FR': 'EU', 'DE': 'EU', 'IT': 'EU', 'ES': 'EU', 'NL': 'EU', 'CH': 'EU',
    // Asia
    'CN': 'AS', 'JP': 'AS', 'IN': 'AS', 'KR': 'AS', 'SG': 'AS', 'TH': 'AS', 'MY': 'AS',
    // Oceania
    'AU': 'OC', 'NZ': 'OC',
    // South America
    'BR': 'SA', 'AR': 'SA', 'CL': 'SA', 'PE': 'SA', 'CO': 'SA',
    // Africa
    'ZA': 'AF', 'EG': 'AF', 'MA': 'AF', 'KE': 'AF', 'NG': 'AF',
  };
  
  return continentMap[countryCode] || 'XX';
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// Format relative time
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}
