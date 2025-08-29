import { NextRequest, NextResponse } from 'next/server';
import { GoogleFlightsScraper } from '@/lib/google-flights-scraper';

export async function POST(req: NextRequest) {
  try {
    const { flightNumber } = await req.json();

    if (!flightNumber) {
      return NextResponse.json(
        { error: 'Flight number is required' },
        { status: 400 }
      );
    }

    // Get real-time flight data from Google
    const flightData = await GoogleFlightsScraper.scrapeFlightData(flightNumber);

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

    // Add distance-based XP
    if (flightData.route.distance) {
      stats.xpEarned += Math.floor(flightData.route.distance / 100); // 1 XP per 100 miles
    }

    // Add aircraft-based achievements
    if (flightData.aircraft.type.includes('A380')) {
      stats.achievements.push({
        id: 'superjumbo',
        name: 'Superjumbo Explorer',
        description: 'Flew on an Airbus A380',
        xp: 100
      });
      stats.xpEarned += 100;
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
