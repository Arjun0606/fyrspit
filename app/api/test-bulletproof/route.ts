// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { bulletproofFlightAPI } from '@/lib/bulletproof-flight-api';

/**
 * 🧪 TEST BULLETPROOF FLIGHT API
 * Test endpoint to verify our multi-source flight data system
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const flight = searchParams.get('flight') || 'QR5943';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  
  console.log(`�� TESTING BULLETPROOF API: ${flight} on ${date}`);
  
  try {
    const startTime = Date.now();
    
    // Test the bulletproof system
    const flightData = await bulletproofFlightAPI.getFlightData(flight, date);
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    if (flightData) {
      return NextResponse.json({
        success: true,
        message: `✅ BULLETPROOF SUCCESS! Got data from ${flightData.dataSource}`,
        flight: flightData,
        performance: {
          processingTime: `${processingTime}ms`,
          dataSource: flightData.dataSource,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `❌ ALL SOURCES FAILED for ${flight}`,
        flight: null,
        performance: {
          processingTime: `${processingTime}ms`,
          timestamp: new Date().toISOString()
        }
      }, { status: 404 });
    }
    
  } catch (error) {
    console.error('🚨 BULLETPROOF TEST ERROR:', error);
    
    return NextResponse.json({
      success: false,
      message: '🚨 Test failed with error',
      error: error instanceof Error ? error.message : 'Unknown error',
      flight: null
    }, { status: 500 });
  }
}
