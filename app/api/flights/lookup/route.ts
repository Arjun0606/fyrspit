import { NextRequest, NextResponse } from 'next/server';
import LiveFlightAPI from '@/lib/live-flight-api';
import { AircraftAchievementEngine } from '@/lib/aircraft-achievements';

export async function POST(req: NextRequest) {
  try {
    const { flightNumber } = await req.json();

    if (!flightNumber) {
      return NextResponse.json(
        { error: 'Flight number is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Looking up flight: ${flightNumber}`);

    // Get REAL-TIME flight data from live APIs
    const flightData = await LiveFlightAPI.getRealtimeFlightData(flightNumber);

    if (!flightData) {
      return NextResponse.json(
        { error: 'Flight not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Found flight data for ${flightNumber}`);

    // Calculate stats based on the flight data
    const stats = {
      xpEarned: 50, // Base XP for logging a flight
      achievements: [],
      milestones: []
    };

    // Add distance-based XP
    if (flightData.route.distance) {
      stats.xpEarned += Math.floor(flightData.route.distance / 100); // 1 XP per 100 miles
    }

    // Add comprehensive aircraft-based achievements
    const aircraftAchievement = AircraftAchievementEngine.getAircraftAchievement(flightData.aircraft.type);
    if (aircraftAchievement) {
      stats.achievements.push({
        id: aircraftAchievement.id,
        name: aircraftAchievement.name,
        description: aircraftAchievement.description,
        xp: aircraftAchievement.xp
      });
      stats.xpEarned += aircraftAchievement.xp;
    }

    // Add route-based achievements
    if (flightData.route.distance && flightData.route.distance > 3000) {
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

    // Return the smart engine data directly with stats
    const responseData = {
      ...flightData,
      stats
    };

    return NextResponse.json({
      success: true,
      ...responseData
    });

  } catch (error) {
    console.error('Flight lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to lookup flight' },
      { status: 500 }
    );
  }
}
