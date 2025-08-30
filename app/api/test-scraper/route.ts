// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const flightNumber = searchParams.get('flight') || 'QP1457';

  try {
    // Import puppeteer
    const puppeteer = await import('puppeteer');
    
    console.log(`🔍 Testing real scraper for ${flightNumber}...`);
    
    // Launch browser
    const browser = await puppeteer.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate to Google
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(flightNumber + ' flight status')}`;
    console.log(`📍 Navigating to: ${searchUrl}`);
    
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 15000 });
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get page content for debugging
    const pageTitle = await page.title();
    const pageContent = await page.content();
    
    // Look for flight-related text
    const hasFlightInfo = pageContent.includes('flight') || pageContent.includes('Flight');
    const hasStatus = pageContent.includes('status') || pageContent.includes('Status');
    
    // Extract some flight data
    const extractedData = await page.evaluate((flightNum) => {
      const body = document.body.innerText.toLowerCase();
      
      // Look for common flight patterns
      const airlineMatch = body.match(/(airways?|airlines?|air\s+\w+)/i);
      const aircraftMatch = body.match(/(boeing|airbus|a\d{3}|b\d{3}|737|777|787|a320|a350|a380)/i);
      const routeMatch = body.match(/([a-z]{3})\s*[-→]\s*([a-z]{3})/i);
      const timeMatch = body.match(/(\d{1,2}:\d{2})/g);
      
      return {
        hasFlightKeyword: body.includes('flight'),
        hasStatusKeyword: body.includes('status'),
        foundAirline: airlineMatch ? airlineMatch[0] : null,
        foundAircraft: aircraftMatch ? aircraftMatch[0] : null,
        foundRoute: routeMatch ? `${routeMatch[1]} → ${routeMatch[2]}` : null,
        foundTimes: timeMatch ? timeMatch.slice(0, 3) : [],
        bodyPreview: body.substring(0, 500) // First 500 chars
      };
    }, flightNumber);
    
    await browser.close();
    
    return NextResponse.json({
      success: true,
      realScraping: true,
      flightNumber,
      searchUrl,
      pageTitle,
      hasFlightInfo,
      hasStatus,
      extractedData,
      message: hasFlightInfo ? "✅ Real scraping working!" : "⚠️ No flight data found on Google"
    });

  } catch (error) {
    console.error('Scraper test failed:', error);
    
    return NextResponse.json({
      success: false,
      realScraping: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      fallbackMessage: "Using simulated data because scraping failed"
    });
  }
}
