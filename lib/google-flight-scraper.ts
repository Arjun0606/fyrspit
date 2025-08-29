/**
 * Google Flight Scraper - Extract flight data from Google search results
 * Just like AI agents do - scrape the flight card that appears in Google search
 */

import puppeteer from 'puppeteer';

export interface GoogleFlightData {
  flightNumber: string;
  airline: {
    name: string;
    code: string;
  };
  aircraft: {
    type: string;
    model: string;
  };
  route: {
    departure: {
      airport: string;
      iata: string;
      city: string;
      time: string;
      terminal?: string;
      gate?: string;
    };
    arrival: {
      airport: string;
      iata: string;
      city: string;
      time: string;
      terminal?: string;
      gate?: string;
    };
    duration: string;
    distance?: string;
  };
  status: {
    text: string;
    delay?: string;
    color: string;
  };
  date: string;
}

export class GoogleFlightScraper {
  /**
   * Scrape flight data from Google search results
   * Works exactly like when you type "QR123 flight" in Google
   */
  static async scrapeFlightData(flightNumber: string): Promise<GoogleFlightData | null> {
    console.log(`🕷️ Scraping Google for flight: ${flightNumber}`);

    let browser;
    try {
      // Launch browser in headless mode
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-default-browser-check',
          '--disable-default-apps'
        ]
      });

      const page = await browser.newPage();
      
      // Set user agent to look like a real browser
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 });

      // Search for the flight on Google
      const searchQuery = `${flightNumber} flight status`;
      const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
      
      console.log(`🔍 Searching: ${googleUrl}`);
      
      // Navigate to Google search
      await page.goto(googleUrl, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });

      // Wait for potential flight card to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Take a screenshot for debugging (optional)
      // await page.screenshot({ path: 'google-search.png', fullPage: true });

      // Extract flight data from the page
      const flightData = await page.evaluate((flightNum) => {
        try {
          console.log('🔍 Looking for flight data in DOM...');

          // Helper function to clean text
          const cleanText = (text: string) => text?.trim().replace(/\s+/g, ' ') || '';

          // Try multiple selectors for flight cards
          const flightSelectors = [
            '[data-ved*="flight"]',
            '[data-attrid*="flight"]', 
            '.flight-board',
            '.aviation-text',
            '[class*="flight"]',
            '[id*="flight"]',
            '.g[data-hveid] .MjjYud', // Standard Google result container
            '.kp-wholepage', // Knowledge panel
            '.knowledge-panel'
          ];

          let flightContainer = null;
          
          // Find the flight data container
          for (const selector of flightSelectors) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
              const text = element.textContent?.toLowerCase() || '';
              if (text.includes(flightNum.toLowerCase()) || 
                  text.includes('departure') || 
                  text.includes('arrival') ||
                  text.includes('aircraft') ||
                  text.includes('airline')) {
                flightContainer = element;
                console.log(`✅ Found flight container with selector: ${selector}`);
                break;
              }
            }
            if (flightContainer) break;
          }

          if (!flightContainer) {
            // Try extracting from any element containing flight info
            const allElements = document.querySelectorAll('*');
            for (const element of allElements) {
              const text = element.textContent?.toLowerCase() || '';
              if (text.includes(flightNum.toLowerCase()) && 
                  (text.includes('departure') || text.includes('arrival'))) {
                flightContainer = element;
                console.log('✅ Found flight data in generic element');
                break;
              }
            }
          }

          if (!flightContainer) {
            console.log('❌ No flight container found');
            return null;
          }

          const containerText = flightContainer.textContent || '';
          console.log('📄 Container text:', containerText.substring(0, 500));

          // Extract data using text patterns
          const extractPattern = (pattern: RegExp, text: string) => {
            const match = text.match(pattern);
            return match ? cleanText(match[1] || match[0]) : null;
          };

          // Common patterns in Google flight results
          const departureAirportMatch = containerText.match(/(?:From|Departure|Depart)\s*[:\-]?\s*([A-Z]{3})\s*[•\-\s]*([^•\n]+)/i);
          const arrivalAirportMatch = containerText.match(/(?:To|Arrival|Arrive)\s*[:\-]?\s*([A-Z]{3})\s*[•\-\s]*([^•\n]+)/i);
          
          const timePattern = /(\d{1,2}:\d{2}\s*(?:AM|PM)?)/gi;
          const times = containerText.match(timePattern) || [];
          
          const durationMatch = containerText.match(/(\d{1,2}h?\s*\d{0,2}m?|\d{1,2}\s*hours?\s*\d{0,2}\s*minutes?)/i);
          const statusMatch = containerText.match(/(On time|Delayed|Cancelled|Landed|Boarding|Departed)/i);
          const aircraftMatch = containerText.match(/(?:Aircraft|Plane|Equipment)[:\s]*([A-Z0-9\-\s]+)/i);
          const airlineMatch = containerText.match(/(?:Airline|Operated by)[:\s]*([A-Za-z\s]+)/i);

          // Try to extract structured data from any JSON-LD or data attributes
          const scripts = document.querySelectorAll('script[type="application/ld+json"]');
          let structuredData = null;
          
          for (const script of scripts) {
            try {
              const data = JSON.parse(script.textContent || '');
              if (data['@type'] === 'Flight' || 
                  (data.mainEntity && data.mainEntity['@type'] === 'Flight')) {
                structuredData = data.mainEntity || data;
                break;
              }
            } catch (e) {
              // Continue searching
            }
          }

          // Build the result
          const result = {
            flightNumber: flightNum,
            airline: {
              name: structuredData?.airline?.name || 
                    airlineMatch?.[1] || 
                    extractPattern(/([A-Za-z\s]+)\s*Airlines?/i, containerText) ||
                    'Unknown Airline',
              code: flightNum.match(/^([A-Z]{2})/)?.[1] || 'XX'
            },
            aircraft: {
              type: structuredData?.aircraft?.name ||
                    aircraftMatch?.[1] ||
                    'Aircraft info not available',
              model: aircraftMatch?.[1] || 'Unknown'
            },
            route: {
              departure: {
                airport: structuredData?.departureAirport?.name ||
                        departureAirportMatch?.[2] ||
                        'Departure airport',
                iata: structuredData?.departureAirport?.iataCode ||
                      departureAirportMatch?.[1] ||
                      'XXX',
                city: departureAirportMatch?.[2]?.split(',')[0] || 'Unknown City',
                time: structuredData?.departureTime ||
                      times[0] ||
                      'Time not available'
              },
              arrival: {
                airport: structuredData?.arrivalAirport?.name ||
                        arrivalAirportMatch?.[2] ||
                        'Arrival airport',
                iata: structuredData?.arrivalAirport?.iataCode ||
                      arrivalAirportMatch?.[1] ||
                      'XXX',
                city: arrivalAirportMatch?.[2]?.split(',')[0] || 'Unknown City',
                time: structuredData?.arrivalTime ||
                      times[1] ||
                      times[0] ||
                      'Time not available'
              },
              duration: durationMatch?.[1] || 'Duration not available',
              distance: extractPattern(/(\d+\s*(?:miles?|km|kilometers?))/i, containerText)
            },
            status: {
              text: structuredData?.flightStatus ||
                    statusMatch?.[1] ||
                    'Status unknown',
              color: statusMatch?.[1]?.toLowerCase().includes('delay') ? 'red' : 'green'
            },
            date: new Date().toISOString().split('T')[0]
          };

          console.log('✅ Extracted flight data:', result);
          return result;

        } catch (error) {
          console.error('❌ Error extracting flight data:', error);
          return null;
        }
      }, flightNumber);

      await browser.close();

      if (flightData) {
        console.log(`✅ Successfully scraped flight data for ${flightNumber}`);
        return flightData as GoogleFlightData;
      } else {
        console.log(`❌ No flight data found for ${flightNumber}`);
        return null;
      }

    } catch (error) {
      console.error(`❌ Google scraping error for ${flightNumber}:`, error);
      if (browser) {
        await browser.close();
      }
      return null;
    }
  }

  /**
   * Alternative method: Scrape multiple search engines
   */
  static async scrapeMultipleSources(flightNumber: string): Promise<GoogleFlightData | null> {
    const sources = [
      `https://www.google.com/search?q=${flightNumber}+flight+status`,
      `https://www.google.com/flights?q=${flightNumber}`,
      `https://www.bing.com/search?q=${flightNumber}+flight`,
    ];

    for (const url of sources) {
      try {
        const result = await this.scrapeFromUrl(url, flightNumber);
        if (result) return result;
      } catch (error) {
        console.log(`Failed to scrape ${url}, trying next...`);
        continue;
      }
    }

    return null;
  }

  private static async scrapeFromUrl(url: string, flightNumber: string): Promise<GoogleFlightData | null> {
    // Implementation similar to scrapeFlightData but for specific URL
    // This would be used by scrapeMultipleSources
    return null; // Placeholder
  }
}

export default GoogleFlightScraper;
