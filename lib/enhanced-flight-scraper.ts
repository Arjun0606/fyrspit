/**
 * Enhanced Flight Scraper - Date + Flight Number for Precise Data
 * Scrapes multiple sources with date-specific flight information
 */

import puppeteer from 'puppeteer';

export interface EnhancedFlightData {
  flightNumber: string;
  date: string;
  airline: {
    name: string;
    code: string;
    logo?: string;
  };
  aircraft: {
    type: string;
    registration: string;
    age?: string;
    manufacturer: string;
  };
  route: {
    departure: {
      airport: string;
      iata: string;
      city: string;
      country: string;
      terminal?: string;
      gate?: string;
      scheduledTime: string;
      actualTime?: string;
      delay?: number;
    };
    arrival: {
      airport: string;
      iata: string;
      city: string;
      country: string;
      terminal?: string;
      gate?: string;
      scheduledTime: string;
      estimatedTime?: string;
      actualTime?: string;
      delay?: number;
    };
    duration: string;
    distance: number;
    distanceUnit: 'miles' | 'km';
  };
  status: {
    current: string;
    color: string;
    icon: string;
    lastUpdated?: string;
  };
  realTimeData?: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
    speed?: number;
    heading?: number;
  };
  weather?: {
    departure?: string;
    arrival?: string;
  };
  price?: {
    economy?: string;
    business?: string;
    first?: string;
  };
}

export class EnhancedFlightScraper {
  /**
   * Get comprehensive flight data using flight number + date
   */
  static async getFlightData(flightNumber: string, date: string): Promise<EnhancedFlightData | null> {
    console.log(`🔍 Enhanced scraping for ${flightNumber} on ${date}`);

    // Try multiple sources in parallel for best results
    const sources = [
      this.scrapeGoogleFlights(flightNumber, date),
      this.scrapeFlightRadar24(flightNumber, date),
      this.scrapeFlightAware(flightNumber, date),
      this.scrapeKayak(flightNumber, date)
    ];

    try {
      // Race all sources, return first successful result
      const results = await Promise.allSettled(sources);
      
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          console.log(`✅ Got flight data from source`);
          return result.value;
        }
      }

      console.log(`❌ No flight data found for ${flightNumber} on ${date}`);
      return null;

    } catch (error) {
      console.error(`❌ Enhanced scraping error:`, error);
      return null;
    }
  }

  /**
   * Google Flights - Most comprehensive source
   */
  private static async scrapeGoogleFlights(flightNumber: string, date: string): Promise<EnhancedFlightData | null> {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run'
        ]
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });

      // Format date for Google (YYYY-MM-DD)
      const formattedDate = new Date(date).toISOString().split('T')[0];
      
      // Search Google for specific flight on specific date
      const searchQuery = `${flightNumber} flight ${formattedDate} status tracking`;
      const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
      
      console.log(`🕷️ Scraping Google: ${googleUrl}`);
      
      await page.goto(googleUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(resolve => setTimeout(resolve, 4000)); // Wait for dynamic content

      // Extract comprehensive flight data
      const flightData = await page.evaluate((flightNum, flightDate) => {
        try {
          // Look for flight information cards
          const flightSelectors = [
            '[data-ved*="flight"]',
            '[data-attrid*="flight"]',
            '.flight-board',
            '.aviation-text',
            '[class*="flight"]',
            '.kp-wholepage',
            '.knowledge-panel',
            '[role="main"] .g',
            '.MjjYud'
          ];

          let flightContainer = null;
          
          // Find the most relevant container
          for (const selector of flightSelectors) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
              const text = element.textContent?.toLowerCase() || '';
              if (text.includes(flightNum.toLowerCase()) && 
                  (text.includes('departure') || text.includes('arrival') || 
                   text.includes('gate') || text.includes('terminal'))) {
                flightContainer = element;
                break;
              }
            }
            if (flightContainer) break;
          }

          if (!flightContainer) {
            // Fallback: search entire page
            const allText = document.body.textContent || '';
            if (!allText.toLowerCase().includes(flightNum.toLowerCase())) {
              return null;
            }
            flightContainer = document.body;
          }

          const containerText = flightContainer.textContent || '';
          
          // Enhanced extraction patterns
          const extractTime = (pattern: RegExp) => {
            const match = containerText.match(pattern);
            return match ? match[1] : null;
          };

          const extractAirport = (pattern: RegExp) => {
            const match = containerText.match(pattern);
            return match ? {
              iata: match[1],
              name: match[2],
              city: match[3] || match[2]
            } : null;
          };

          // More sophisticated patterns
          const departureInfo = extractAirport(/(?:From|Departure|Depart)\s*[:\-]?\s*([A-Z]{3})\s*[•\-\s]*([^•\n]+?)(?:\s*[•\-]\s*([^•\n]+?))?/i);
          const arrivalInfo = extractAirport(/(?:To|Arrival|Arrive)\s*[:\-]?\s*([A-Z]{3})\s*[•\-\s]*([^•\n]+?)(?:\s*[•\-]\s*([^•\n]+?))?/i);
          
          const departureTime = extractTime(/(?:Departure|Depart)[:\s]*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
          const arrivalTime = extractTime(/(?:Arrival|Arrive)[:\s]*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
          
          const duration = containerText.match(/(\d{1,2}h?\s*\d{0,2}m?)/i)?.[1];
          const distance = containerText.match(/(\d+)\s*(miles?|km)/i);
          const status = containerText.match(/(On time|Delayed|Cancelled|Landed|Boarding|Departed|In flight)/i)?.[1];
          const aircraft = containerText.match(/(?:Aircraft|Equipment)[:\s]*([A-Z0-9\-\s]+)/i)?.[1];
          const airline = containerText.match(/(?:Airline|Operated by)[:\s]*([A-Za-z\s]+)/i)?.[1];
          const gate = containerText.match(/(?:Gate)[:\s]*([A-Z0-9]+)/i)?.[1];
          const terminal = containerText.match(/(?:Terminal)[:\s]*([A-Z0-9]+)/i)?.[1];

          // Try to extract from structured data
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
              continue;
            }
          }

          return {
            flightNumber: flightNum,
            date: flightDate,
            airline: {
              name: structuredData?.airline?.name || airline || 'Unknown Airline',
              code: flightNum.match(/^([A-Z]{2})/)?.[1] || 'XX'
            },
            aircraft: {
              type: structuredData?.aircraft?.name || aircraft || 'Aircraft not specified',
              registration: 'N/A',
              manufacturer: aircraft?.includes('Boeing') ? 'Boeing' : 
                           aircraft?.includes('Airbus') ? 'Airbus' : 'Unknown'
            },
            route: {
              departure: {
                airport: structuredData?.departureAirport?.name || departureInfo?.name || 'Unknown Airport',
                iata: structuredData?.departureAirport?.iataCode || departureInfo?.iata || 'XXX',
                city: departureInfo?.city || 'Unknown City',
                country: 'Unknown',
                scheduledTime: structuredData?.departureTime || departureTime || 'N/A',
                terminal: terminal,
                gate: gate
              },
              arrival: {
                airport: structuredData?.arrivalAirport?.name || arrivalInfo?.name || 'Unknown Airport',
                iata: structuredData?.arrivalAirport?.iataCode || arrivalInfo?.iata || 'XXX',
                city: arrivalInfo?.city || 'Unknown City',
                country: 'Unknown',
                scheduledTime: structuredData?.arrivalTime || arrivalTime || 'N/A'
              },
              duration: duration || 'N/A',
              distance: distance ? parseInt(distance[1]) : 0,
              distanceUnit: distance?.[2]?.includes('km') ? 'km' : 'miles'
            },
            status: {
              current: structuredData?.flightStatus || status || 'Unknown',
              color: status?.toLowerCase().includes('delay') ? 'red' : 'green',
              icon: this.getStatusIcon(status || 'unknown')
            }
          };

        } catch (error) {
          console.error('Extraction error:', error);
          return null;
        }
      }, flightNumber, date);

      await browser.close();
      return flightData as EnhancedFlightData;

    } catch (error) {
      console.error('Google scraping error:', error);
      if (browser) await browser.close();
      return null;
    }
  }

  /**
   * FlightRadar24 - Real-time tracking data
   */
  private static async scrapeFlightRadar24(flightNumber: string, date: string): Promise<EnhancedFlightData | null> {
    let browser;
    try {
      browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      
      const url = `https://www.flightradar24.com/data/flights/${flightNumber.toLowerCase()}`;
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
      
      // Extract real-time data
      const data = await page.evaluate(() => {
        // FlightRadar24 specific extraction logic
        const flightInfo = document.querySelector('.flight-info');
        if (!flightInfo) return null;
        
        // Extract what we can from FlightRadar24
        return {
          realTimeData: {
            // This would extract live tracking data
            latitude: 0,
            longitude: 0,
            altitude: 0,
            speed: 0
          }
        };
      });

      await browser.close();
      return data as EnhancedFlightData;
      
    } catch (error) {
      if (browser) await browser.close();
      return null;
    }
  }

  /**
   * FlightAware - Detailed flight information
   */
  private static async scrapeFlightAware(flightNumber: string, date: string): Promise<EnhancedFlightData | null> {
    // Similar implementation for FlightAware
    return null; // Placeholder
  }

  /**
   * Kayak - Price and schedule data
   */
  private static async scrapeKayak(flightNumber: string, date: string): Promise<EnhancedFlightData | null> {
    // Similar implementation for Kayak
    return null; // Placeholder
  }

  private static getStatusIcon(status: string): string {
    const statusMap: Record<string, string> = {
      'on time': '✅',
      'delayed': '⏰',
      'cancelled': '❌',
      'boarding': '🚪',
      'departed': '🛫',
      'landed': '🛬',
      'in flight': '✈️'
    };
    return statusMap[status.toLowerCase()] || '📋';
  }
}

export default EnhancedFlightScraper;
