// Force dynamic rendering
export const dynamic = 'force-dynamic';
/**
 * LIVE GOOGLE SCRAPING TEST ENDPOINT
 * Actually visits Google and scrapes real flight data
 */

import { NextRequest, NextResponse } from 'next/server';
import { LiveGoogleScraper } from '@/lib/live-google-scraper';

export async function POST(request: NextRequest) {
  try {
    const { flightNumber } = await request.json();
    
    if (!flightNumber) {
      return NextResponse.json(
        { error: 'Flight number is required' },
        { status: 400 }
      );
    }

    console.log(`🕷️ LIVE SCRAPING API: Starting scrape for ${flightNumber}...`);
    
    // Actually scrape Google
    const liveData = await LiveGoogleScraper.scrapeLiveFlightData(flightNumber);
    
    if (!liveData) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No flight data found on Google',
          message: `Could not find live data for ${flightNumber}` 
        },
        { status: 404 }
      );
    }

    // Convert to our format
    const convertedData = LiveGoogleScraper.convertToGlobalFormat(liveData);
    
    console.log(`✅ LIVE SCRAPING: Successfully scraped ${flightNumber}`);
    
    return NextResponse.json({
      success: true,
      data: {
        flight: convertedData,
        rawScrape: liveData,
        source: 'live-google-scraping',
        scrapedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Live scraping API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Scraping failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Also support GET requests
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const flightNumber = searchParams.get('flight');

  if (!flightNumber) {
    return NextResponse.json(
      { error: 'Flight number parameter is required' },
      { status: 400 }
    );
  }

  // Redirect to POST with JSON body
  return POST(new Request(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flightNumber })
  }));
}
