import { NextRequest, NextResponse } from 'next/server';
import { GoogleFlightScraper } from '@/lib/google-flight-scraper';
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

    // PRIMARY: Scrape Google search results (most reliable!)
    let flightData = await GoogleFlightScraper.scrapeFlightData(flightNumber);

    // FALLBACK: Try live APIs if Google scraping fails
    if (!flightData) {
      console.log(`🔄 Google scraping failed, trying live APIs...`);
      const liveData = await LiveFlightAPI.getRealtimeFlightData(flightNumber);
      
      if (liveData) {
        // Convert live API data to our format
        flightData = {
          flightNumber: liveData.flightNumber,
          airline: {
            name: liveData.airline.name,
            code: liveData.airline.code
          },
          aircraft: {
            type: liveData.aircraft.type,
            model: liveData.aircraft.registration
          },
          route: {
            departure: {
              airport: liveData.route.departure.airport,
              iata: liveData.route.departure.iata,
              city: liveData.route.departure.city,
              time: new Date(liveData.route.departure.scheduled).toLocaleTimeString()
            },
            arrival: {
              airport: liveData.route.arrival.airport,
              iata: liveData.route.arrival.iata,
              city: liveData.route.arrival.city,
              time: new Date(liveData.route.arrival.scheduled).toLocaleTimeString()
            },
            duration: liveData.route.duration ? `${Math.floor(liveData.route.duration / 60)}h ${liveData.route.duration % 60}m` : 'Unknown',
            distance: liveData.route.distance ? `${liveData.route.distance} miles` : undefined
          },
          status: {
            text: liveData.status.text,
            color: liveData.status.text.toLowerCase().includes('delay') ? 'red' : 'green'
          },
          date: new Date().toISOString().split('T')[0]
        };
      }
    }

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

    // Add distance-based XP (extract number from distance string)
    const distanceMatch = flightData.route.distance?.match(/(\d+)/);
    const distanceNum = distanceMatch ? parseInt(distanceMatch[1]) : 0;
    if (distanceNum > 0) {
      stats.xpEarned += Math.floor(distanceNum / 100); // 1 XP per 100 miles
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
    if (distanceNum > 3000) {
      stats.achievements.push({
        id: 'long_haul',
        name: 'Long Haul Warrior',
        description: 'Completed a flight over 3,000 miles',
        xp: 150
      });
      stats.xpEarned += 150;
    }

    // International flight achievement (basic check if cities are different)
    if (flightData.route.departure.city !== flightData.route.arrival.city) {
      stats.achievements.push({
        id: 'border_crosser',
        name: 'Border Crosser',
        description: 'Completed a flight to different city',
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
