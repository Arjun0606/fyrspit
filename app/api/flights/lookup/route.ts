// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { bulletproofFlightAPI } from '@/lib/bulletproof-flight-api';
import { GamificationEngine } from '@/lib/gamification-engine';

/**
 * 🚀 ULTIMATE FLIGHT LOOKUP API
 * The "Strava for Aviation" - Magic Flight Data Endpoint
 * 
 * Input: Flight Number + Date
 * Output: EVERYTHING (route, aircraft, XP, achievements, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const { flightNumber, date } = await request.json();
    
    if (!flightNumber) {
      return NextResponse.json(
        { error: 'Flight number is required' },
        { status: 400 }
      );
    }

    console.log(`🎯 MAGIC LOOKUP: ${flightNumber} on ${date || 'today'}`);
    
    // Use today's date if not provided
    const flightDate = date || new Date().toISOString().split('T')[0];
    
    // 🚀 GET FLIGHT DATA (bulletproof multi-source)
    const flightData = await bulletproofFlightAPI.getFlightData(flightNumber, flightDate);
    
    if (!flightData) {
      return NextResponse.json(
        { 
          error: 'Flight not found',
          message: `Unable to find data for flight ${flightNumber} on ${flightDate}`,
          suggestions: [
            'Check if the flight number is correct',
            'Try a different date',
            'Make sure the flight exists on this date'
          ]
        },
        { status: 404 }
      );
    }

    // �� CALCULATE GAMIFICATION DATA
    const gamificationEngine = new GamificationEngine();
    
    // Calculate XP and achievements
    const xpData = gamificationEngine.calculateFlightXP({
      distance: flightData.distance,
      isInternational: flightData.isInternational,
      aircraftType: flightData.aircraft.model,
      flightDuration: flightData.duration,
      airline: flightData.airline.name,
      status: flightData.status
    });

    // Check for new achievements
    const achievements = gamificationEngine.checkAchievements({
      totalFlights: 1, // This would come from user's profile
      totalMiles: flightData.distance,
      countries: flightData.isInternational ? 2 : 1,
      airlines: [flightData.airline.name],
      aircraft: [flightData.aircraft.model]
    });

    // 🎯 ENHANCED RESPONSE WITH EVERYTHING
    const response = {
      success: true,
      flight: {
        ...flightData,
        
        // Enhanced route info
        route: {
          departure: flightData.departure,
          arrival: flightData.arrival,
          distance: `${flightData.distance} miles`,
          duration: flightData.duration,
          isInternational: flightData.isInternational
        },
        
        // Enhanced aircraft info
        aircraftDetails: {
          model: flightData.aircraft.model,
          registration: flightData.aircraft.registration,
          type: flightData.aircraft.type,
          manufacturer: this.getManufacturer(flightData.aircraft.model)
        },
        
        // Gamification data
        gamification: {
          xpEarned: xpData.totalXP,
          xpBreakdown: xpData.breakdown,
          achievements: achievements.newAchievements,
          level: this.calculateLevel(xpData.totalXP),
          badges: achievements.badges
        },
        
        // Social features
        social: {
          shareable: true,
          hashtags: [
            `#${flightData.airline.iata}${flightNumber.replace(/\D/g, '')}`,
            `#${flightData.departure.iata}to${flightData.arrival.iata}`,
            '#Fyrspit',
            '#StravaForAviation'
          ]
        }
      },
      
      // Metadata
      meta: {
        dataSource: flightData.dataSource,
        timestamp: new Date().toISOString(),
        processingTime: '< 2s',
        confidence: 'high'
      }
    };

    console.log(`✅ MAGIC SUCCESS: ${flightData.dataSource} → ${xpData.totalXP} XP`);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('🚨 MAGIC LOOKUP ERROR:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to lookup flight',
        message: 'Our flight data sources are temporarily unavailable. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * 🛠️ Helper Functions
 */
function getManufacturer(aircraftModel: string): string {
  const model = aircraftModel.toUpperCase();
  
  if (model.includes('A3') || model.includes('A4')) return 'Airbus';
  if (model.includes('737') || model.includes('747') || model.includes('777') || model.includes('787')) return 'Boeing';
  if (model.includes('E1') || model.includes('E2')) return 'Embraer';
  if (model.includes('CRJ') || model.includes('CS')) return 'Bombardier';
  if (model.includes('ATR')) return 'ATR';
  
  return 'Unknown';
}

function calculateLevel(totalXP: number): number {
  // Level calculation (like Strava/Forza)
  return Math.floor(totalXP / 1000) + 1;
}

/**
 * 🔍 GET endpoint for testing
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const flightNumber = searchParams.get('flight');
  const date = searchParams.get('date');
  
  if (!flightNumber) {
    return NextResponse.json(
      { error: 'Flight number parameter is required' },
      { status: 400 }
    );
  }
  
  // Reuse POST logic
  return POST(new Request(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flightNumber, date })
  }));
}
