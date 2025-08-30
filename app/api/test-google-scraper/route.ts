// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleFlightScraper } from '@/lib/google-flight-scraper';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const flightNumber = searchParams.get('flight') || 'QR123';

  console.log(`🧪 Testing Google scraper for flight: ${flightNumber}`);

  try {
    const startTime = Date.now();
    
    const flightData = await GoogleFlightScraper.scrapeFlightData(flightNumber);
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    if (flightData) {
      return NextResponse.json({
        success: true,
        message: `✅ Successfully scraped flight data in ${duration}ms`,
        flight: flightNumber,
        data: flightData,
        scrapingTime: `${duration}ms`,
        source: 'Google Search Results'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `❌ No flight data found for ${flightNumber}`,
        flight: flightNumber,
        scrapingTime: `${duration}ms`,
        source: 'Google Search Results'
      }, { status: 404 });
    }

  } catch (error) {
    console.error('Google scraper test error:', error);
    return NextResponse.json({
      success: false,
      message: `❌ Scraping failed: ${error}`,
      flight: flightNumber,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
