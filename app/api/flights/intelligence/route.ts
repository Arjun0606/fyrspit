import { NextRequest, NextResponse } from 'next/server';
import { flightIntelligence } from '@/lib/flight-intelligence';

/**
 * POST /api/flights/intelligence
 * Get EVERYTHING about a flight from just the flight number
 * This is the ultimate "magic" endpoint
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
    
    // Get comprehensive flight intelligence
    const flightData = await flightIntelligence.getComprehensiveFlightData(flightNumber, date);
    
    if (!flightData) {
      return NextResponse.json(
        { 
          error: 'Flight not found',
          message: 'Unable to find comprehensive data for this flight number',
          suggestions: [
            'Check if the flight number is correct',
            'Try with a different date',
            'This might be a regional flight not in our database'
          ]
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      flightNumber,
      data: flightData,
      timestamp: new Date().toISOString(),
      message: 'Complete flight intelligence loaded! ✈️'
    });
    
  } catch (error) {
    console.error('Flight intelligence API error:', error);
    return NextResponse.json(
      { error: 'Failed to get flight intelligence' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/flights/intelligence?flight=QP1457&date=2024-08-27
 * Alternative endpoint using query parameters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flightNumber = searchParams.get('flight');
    const date = searchParams.get('date');
    
    if (!flightNumber) {
      return NextResponse.json(
        { error: 'Flight number is required' },
        { status: 400 }
      );
    }
    
    const flightData = await flightIntelligence.getComprehensiveFlightData(flightNumber, date || undefined);
    
    if (!flightData) {
      return NextResponse.json(
        { 
          error: 'Flight not found',
          message: 'Unable to find comprehensive data for this flight number'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      flightNumber,
      data: flightData,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Flight intelligence API error:', error);
    return NextResponse.json(
      { error: 'Failed to get flight intelligence' },
      { status: 500 }
    );
  }
}
