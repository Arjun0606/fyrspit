import { NextRequest, NextResponse } from 'next/server';
import { RealFlightAPI } from '@/lib/real-flight-api';
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

    // Add manufacturer bonus
    const manufacturerBonus = AircraftAchievementEngine.getManufacturerBonus(flightData.aircraft.manufacturer);
    stats.xpEarned += manufacturerBonus;

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
