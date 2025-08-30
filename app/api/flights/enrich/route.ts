// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { flightEnricher } from '@/lib/opensky';

/**
 * POST /api/flights/enrich
 * Auto-enrich flight data using OpenSky Network
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
    
    // Normalize flight number
    const normalizedFlightNumber = flightEnricher.normalizeFlightNumber(flightNumber);
    if (!normalizedFlightNumber) {
      return NextResponse.json(
        { error: 'Invalid flight number format' },
        { status: 400 }
      );
    }
    
    // Enrich flight data
    const enrichedData = await flightEnricher.enrichFlightData(
      normalizedFlightNumber,
      date ? new Date(date) : undefined
    );
    
    return NextResponse.json({
      success: true,
      flightNumber: normalizedFlightNumber,
      data: enrichedData,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Flight enrichment API error:', error);
    return NextResponse.json(
      { error: 'Failed to enrich flight data' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/flights/enrich?flight=AA123&date=2024-01-15
 * Auto-enrich flight data using query parameters
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
    
    // Normalize flight number
    const normalizedFlightNumber = flightEnricher.normalizeFlightNumber(flightNumber);
    if (!normalizedFlightNumber) {
      return NextResponse.json(
        { error: 'Invalid flight number format' },
        { status: 400 }
      );
    }
    
    // Enrich flight data
    const enrichedData = await flightEnricher.enrichFlightData(
      normalizedFlightNumber,
      date ? new Date(date) : undefined
    );
    
    return NextResponse.json({
      success: true,
      flightNumber: normalizedFlightNumber,
      data: enrichedData,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Flight enrichment API error:', error);
    return NextResponse.json(
      { error: 'Failed to enrich flight data' },
      { status: 500 }
    );
  }
}
