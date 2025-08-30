// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { bulletproofFlightAPI } from '@/lib/bulletproof-flight-api';
// Gamification optional; keep response lightweight and real-time

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

    // 🎯 RESPONSE (no mocks; only real data). Keep structure stable for UI.
    const response = {
      success: true,
      flight: {
        ...flightData,
        route: {
          departure: flightData.departure,
          arrival: flightData.arrival,
          distance: flightData.distance,
          duration: flightData.duration,
          isInternational: flightData.isInternational
        }
      },
      meta: {
        dataSource: flightData.dataSource,
        timestamp: new Date().toISOString()
      }
    };

    console.log(`✅ LOOKUP SUCCESS: ${flightData.dataSource}`);
    
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
