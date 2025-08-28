'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { CreateFlightData, Flight } from '@/types';
import { calculateDistance, estimateFlightHours, getTimeOfDay, calculateXP, generateId, getContinent } from '@/lib/utils';
import { uploadImage } from '@/lib/cloudinary';

// Mock airport data - in production this would come from a real database
const mockAirports = {
  'JFK': { lat: 40.6413, lon: -73.7781, city: 'New York', country: 'United States', countryCode: 'US' },
  'LAX': { lat: 34.0522, lon: -118.2437, city: 'Los Angeles', country: 'United States', countryCode: 'US' },
  'LHR': { lat: 51.4700, lon: -0.4543, city: 'London', country: 'United Kingdom', countryCode: 'GB' },
  'CDG': { lat: 49.0097, lon: 2.5479, city: 'Paris', country: 'France', countryCode: 'FR' },
  'NRT': { lat: 35.7647, lon: 140.3864, city: 'Tokyo', country: 'Japan', countryCode: 'JP' },
  'SIN': { lat: 1.3644, lon: 103.9915, city: 'Singapore', country: 'Singapore', countryCode: 'SG' },
  'DXB': { lat: 25.2532, lon: 55.3657, city: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE' },
};

export async function createFlight(data: CreateFlightData, authToken: string) {
  try {
    // Verify the user is authenticated
    const decodedToken = await adminAuth.verifyIdToken(authToken);
    const userId = decodedToken.uid;

    // Get airport data for distance calculation
    const fromAirport = mockAirports[data.fromIata as keyof typeof mockAirports];
    const toAirport = mockAirports[data.toIata as keyof typeof mockAirports];

    if (!fromAirport || !toAirport) {
      throw new Error('Invalid airport codes');
    }

    // Calculate flight data
    const distance = calculateDistance(fromAirport.lat, fromAirport.lon, toAirport.lat, toAirport.lon);
    const hoursEstimate = estimateFlightHours(distance.km, data.aircraftCode);
    const timeOfDay = data.departureTime ? getTimeOfDay(data.departureTime) : undefined;
    
    // Get user's current stats to check for new airports
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const userAirports = userData?.statsCache?.lifetime?.airports || [];
    const isNewFromAirport = !userAirports.includes(data.fromIata);
    const isNewToAirport = !userAirports.includes(data.toIata);
    const isNewAirport = isNewFromAirport || isNewToAirport;

    // Calculate XP
    const xpAwarded = calculateXP({
      distanceKm: distance.km,
      cabinClass: data.cabinClass,
      photoCount: data.photos?.length || 0,
      reviewLength: (data.reviewShort?.length || 0) + (data.reviewLong?.length || 0),
      isNewAirport,
    });

    // Create flight document
    const flightId = generateId();
    const now = new Date();
    
    const flightData: Omit<Flight, 'id'> = {
      userId,
      visibility: data.visibility,
      createdAt: now,
      fromIata: data.fromIata,
      toIata: data.toIata,
      airlineCode: data.airlineCode,
      flightNumber: data.flightNumber,
      date: data.date,
      departureTime: data.departureTime,
      arrivalTime: data.arrivalTime,
      aircraftCode: data.aircraftCode,
      seat: data.seat,
      cabinClass: data.cabinClass,
      ratings: data.ratings || {},
      reviewShort: data.reviewShort,
      reviewLong: data.reviewLong,
      photos: data.photos || [],
      tags: data.tags || [],
      milesKm: distance.km,
      milesMi: distance.mi,
      hoursEstimate,
      timeOfDay,
      xpAwarded,
    };

    // Save flight to Firestore
    await adminDb.collection('flights').doc(flightId).set(flightData);

    // Update user stats
    await updateUserStats(userId, flightData, fromAirport, toAirport);

    // Revalidate relevant pages
    revalidatePath('/feed');
    revalidatePath(`/profile/${userId}`);
    
    return { success: true, flightId };
  } catch (error) {
    console.error('Error creating flight:', error);
    throw new Error('Failed to create flight');
  }
}

async function updateUserStats(userId: string, flight: Omit<Flight, 'id'>, fromAirport: any, toAirport: any) {
  const userRef = adminDb.collection('users').doc(userId);
  
  await adminDb.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    const userData = userDoc.data();
    
    if (!userData) {
      throw new Error('User not found');
    }

    const currentStats = userData.statsCache?.lifetime || {
      flights: 0,
      milesKm: 0,
      milesMi: 0,
      hours: 0,
      airports: [],
      airlines: [],
      aircraft: [],
      countries: [],
      continents: [],
      longest: { km: 0, mi: 0 },
      shortest: { km: 999999, mi: 999999 },
      topRoute: { count: 0 },
      topAirline: { count: 0 },
      topAirport: { count: 0 },
      seatClassBreakdown: { economy: 0, premium: 0, business: 0, first: 0 },
      dayNightRatio: { day: 0, night: 0 },
      weekdayWeekend: { weekday: 0, weekend: 0 },
      domesticInternational: { domestic: 0, international: 0 },
    };

    // Update basic counters
    const newStats = {
      ...currentStats,
      flights: currentStats.flights + 1,
      milesKm: currentStats.milesKm + flight.milesKm,
      milesMi: currentStats.milesMi + flight.milesMi,
      hours: currentStats.hours + flight.hoursEstimate,
      airports: Array.from(new Set([...currentStats.airports, flight.fromIata, flight.toIata])),
      airlines: Array.from(new Set([...currentStats.airlines, flight.airlineCode])),
      aircraft: flight.aircraftCode ? Array.from(new Set([...currentStats.aircraft, flight.aircraftCode])) : currentStats.aircraft,
      countries: Array.from(new Set([...currentStats.countries, fromAirport.countryCode, toAirport.countryCode])),
      continents: Array.from(new Set([...currentStats.continents, getContinent(fromAirport.countryCode), getContinent(toAirport.countryCode)])),
    };

    // Update records
    if (flight.milesKm > currentStats.longest.km) {
      newStats.longest = { flightId: 'temp', km: flight.milesKm, mi: flight.milesMi };
    }
    if (flight.milesKm < currentStats.shortest.km && flight.milesKm > 0) {
      newStats.shortest = { flightId: 'temp', km: flight.milesKm, mi: flight.milesMi };
    }

    // Update seat class breakdown
    newStats.seatClassBreakdown = {
      ...currentStats.seatClassBreakdown,
      [flight.cabinClass]: currentStats.seatClassBreakdown[flight.cabinClass] + 1,
    };

    // Update day/night ratio
    if (flight.timeOfDay) {
      newStats.dayNightRatio = {
        ...currentStats.dayNightRatio,
        [flight.timeOfDay]: currentStats.dayNightRatio[flight.timeOfDay] + 1,
      };
    }

    // Update domestic/international
    const isDomestic = fromAirport.countryCode === toAirport.countryCode;
    newStats.domesticInternational = {
      ...currentStats.domesticInternational,
      [isDomestic ? 'domestic' : 'international']: currentStats.domesticInternational[isDomestic ? 'domestic' : 'international'] + 1,
    };

    // Update user XP and level
    const newXP = userData.xp + flight.xpAwarded;
    const newLevel = calculateLevel(newXP);

    // Update the user document
    transaction.update(userRef, {
      xp: newXP,
      level: newLevel,
      'statsCache.lifetime': newStats,
      [`statsCache.perYear.${new Date().getFullYear()}`]: newStats, // Simplified - should merge with existing year stats
    });
  });
}

function calculateLevel(xp: number): number {
  if (xp < 100) return 1;
  if (xp < 300) return 2;
  if (xp < 600) return 3;
  if (xp < 1000) return 4;
  if (xp < 1600) return 5;
  return 5 + Math.floor((xp - 1600) / 600) + 1;
}

export async function updateFlight(flightId: string, data: Partial<CreateFlightData>, authToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(authToken);
    const userId = decodedToken.uid;

    // Verify user owns the flight
    const flightDoc = await adminDb.collection('flights').doc(flightId).get();
    if (!flightDoc.exists || flightDoc.data()?.userId !== userId) {
      throw new Error('Flight not found or access denied');
    }

    // Update the flight
    await adminDb.collection('flights').doc(flightId).update({
      ...data,
      editedAt: new Date(),
    });

    revalidatePath(`/flights/${flightId}`);
    revalidatePath('/feed');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating flight:', error);
    throw new Error('Failed to update flight');
  }
}

export async function deleteFlight(flightId: string, authToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(authToken);
    const userId = decodedToken.uid;

    // Verify user owns the flight
    const flightDoc = await adminDb.collection('flights').doc(flightId).get();
    if (!flightDoc.exists || flightDoc.data()?.userId !== userId) {
      throw new Error('Flight not found or access denied');
    }

    // Delete the flight
    await adminDb.collection('flights').doc(flightId).delete();

    // TODO: Update user stats (subtract this flight's contribution)
    
    revalidatePath('/feed');
    revalidatePath(`/profile/${userId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting flight:', error);
    throw new Error('Failed to delete flight');
  }
}
