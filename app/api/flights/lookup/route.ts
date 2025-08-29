import { NextRequest, NextResponse } from 'next/server';
import { RealFlightAPI } from '@/lib/real-flight-api';

export async function POST(req: NextRequest) {
  try {
    const { flightNumber } = await req.json();

    if (!flightNumber) {
      return NextResponse.json(
        { error: 'Flight number is required' },
        { status: 400 }
      );
    }

    // Get REAL flight data from multiple APIs
    const flightData = await RealFlightAPI.getFlightData(flightNumber);

    if (!flightData) {
      return NextResponse.json(
        { error: 'Flight not found' },
        { status: 404 }
      );
    }

    // Calculate stats based on the flight data
    const stats = {
      xpEarned: 50, // Base XP for logging a flight
      achievements: [],
      milestones: []
    };

    // Calculate distance if not provided
    if (!flightData.route.distance && flightData.route.departure.iata !== 'UNK' && flightData.route.arrival.iata !== 'UNK') {
      // Use airport coordinates to calculate distance (implement later)
      flightData.route.distance = 500; // Default estimate
    }

    // Add distance-based XP
    if (flightData.route.distance) {
      stats.xpEarned += Math.floor(flightData.route.distance / 100); // 1 XP per 100 miles
    }

    // Add aircraft-based achievements
    if (flightData.aircraft.type.toLowerCase().includes('a380')) {
      stats.achievements.push({
        id: 'superjumbo',
        name: 'Superjumbo Explorer',
        description: 'Flew on an Airbus A380',
        xp: 100
      });
      stats.xpEarned += 100;
    }

    // Boeing 737 achievement
    if (flightData.aircraft.type.toLowerCase().includes('737')) {
      stats.achievements.push({
        id: 'workhorse',
        name: 'Workhorse Rider',
        description: 'Flew on the world\'s most popular aircraft',
        xp: 25
      });
      stats.xpEarned += 25;
    }

    // Add route-based achievements
    if (flightData.route.distance > 3000) {
      stats.achievements.push({
        id: 'long_haul',
        name: 'Long Haul Warrior',
        description: 'Completed a flight over 3,000 miles',
        xp: 150
      });
      stats.xpEarned += 150;
    }

    // International flight achievement
    if (flightData.route.departure.country !== flightData.route.arrival.country) {
      stats.achievements.push({
        id: 'border_crosser',
        name: 'Border Crosser',
        description: 'Completed an international flight',
        xp: 75
      });
      stats.xpEarned += 75;
    }

    return NextResponse.json({
      success: true,
      data: {
        flight: flightData,
        stats
      }
    });

  } catch (error) {
    console.error('Flight lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to lookup flight' },
      { status: 500 }
    );
  }
}
