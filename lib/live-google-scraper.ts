/**
 * LIVE GOOGLE SCRAPER
 * Actually visits Google and extracts real flight data
 */

import puppeteer from 'puppeteer';

export interface LiveFlightData {
  flightNumber: string;
  airline?: string;
  aircraft?: string;
  route?: string;
  departure?: string;
  arrival?: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  status?: string;
  gate?: string;
  terminal?: string;
  scraped: boolean;
  scrapedAt: string;
  rawData?: any;
}

export class LiveGoogleScraper {
  /**
   * Actually scrape Google for live flight data
   */
  static async scrapeLiveFlightData(flightNumber: string): Promise<LiveFlightData | null> {
    console.log(`🕷️ LIVE SCRAPING: Visiting Google for ${flightNumber}...`);
    
    let browser;
    try {
      // Launch browser
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });

      const page = await browser.newPage();
      
      // Set viewport and user agent
      await page.setViewport({ width: 1280, height: 720 });
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigate to Google with flight search
      const searchQuery = `${flightNumber} flight status`;
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
      
      console.log(`📍 Visiting: ${searchUrl}`);
      
      await page.goto(searchUrl, { 
        waitUntil: 'networkidle0', 
        timeout: 15000 
      });
      
      // Wait for page to fully load
      await page.waitForTimeout(3000);
      
      // Take a screenshot for debugging (optional)
      // await page.screenshot({ path: `/tmp/google-${flightNumber}.png` });
      
      // Extract all text from page to analyze
      const pageData = await page.evaluate((flightNum) => {
        const bodyText = document.body.innerText;
        const allText = document.documentElement.innerText;
        
        // Look for flight-specific selectors
        const flightSelectors = [
          '[data-attrid*="flight"]',
          '[data-attrid*="Flight"]',
          '.flight-info',
          '.flight-card',
          '.flight-status',
          '[class*="flight"]',
          '[id*="flight"]'
        ];
        
        let flightElements = [];
        for (const selector of flightSelectors) {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            if (el.textContent && el.textContent.includes(flightNum)) {
              flightElements.push({
                selector,
                text: el.textContent,
                html: el.innerHTML.substring(0, 500)
              });
            }
          });
        }
        
        // Look for specific patterns in text
        const patterns = {
          airline: bodyText.match(/(Air\s+\w+|Airways?|Airlines?|[A-Z][a-z]+\s+Air\s*\w*|Akasa\s+Air|Emirates|American\s+Airlines|British\s+Airways|Lufthansa)/gi),
          aircraft: bodyText.match(/(Boeing\s*\d+|Airbus\s*A\d+|B\d{3}|A\d{3}|737|777|787|A320|A350|A380|MAX)/gi),
          airports: bodyText.match(/\b[A-Z]{3}\b/g),
          times: bodyText.match(/\d{1,2}:\d{2}\s*(AM|PM|am|pm)?/g),
          duration: bodyText.match(/\d+h\s*\d*m?|\d+\s*hr\s*\d*\s*min/gi),
          status: bodyText.match(/(On\s+time|Delayed|Cancelled|Departed|Arrived|Boarding|Gate)/gi)
        };
        
        // Check if this page actually has flight information
        const hasFlightInfo = bodyText.toLowerCase().includes(flightNum.toLowerCase()) && 
                             (bodyText.toLowerCase().includes('flight') || 
                              bodyText.toLowerCase().includes('departure') || 
                              bodyText.toLowerCase().includes('arrival'));
        
        return {
          flightNumber: flightNum,
          hasFlightInfo,
          patterns,
          flightElements,
          pageTitle: document.title,
          bodyTextSample: bodyText.substring(0, 1000),
          url: window.location.href
        };
      }, flightNumber);
      
      await browser.close();
      
      console.log(`📊 Scraped data for ${flightNumber}:`, {
        hasFlightInfo: pageData.hasFlightInfo,
        patternsFound: Object.keys(pageData.patterns).filter(k => pageData.patterns[k]?.length > 0),
        flightElementsFound: pageData.flightElements.length
      });
      
      if (pageData.hasFlightInfo) {
        return this.parseScrapedData(pageData);
      } else {
        console.log(`⚠️ No flight info found for ${flightNumber} on Google`);
        return null;
      }
      
    } catch (error) {
      console.error(`❌ Scraping failed for ${flightNumber}:`, error.message);
      if (browser) {
        await browser.close();
      }
      return null;
    }
  }
  
  /**
   * Parse scraped data into structured format
   */
  private static parseScrapedData(data: any): LiveFlightData {
    const patterns = data.patterns;
    
    return {
      flightNumber: data.flightNumber,
      airline: patterns.airline?.[0] || null,
      aircraft: patterns.aircraft?.[0] || null,
      departure: patterns.airports?.[0] || null,
      arrival: patterns.airports?.[1] || null,
      departureTime: patterns.times?.[0] || null,
      arrivalTime: patterns.times?.[1] || null,
      duration: patterns.duration?.[0] || null,
      status: patterns.status?.[0] || null,
      scraped: true,
      scrapedAt: new Date().toISOString(),
      rawData: {
        patternsFound: Object.keys(patterns).filter(k => patterns[k]?.length > 0),
        sampleText: data.bodyTextSample,
        url: data.url
      }
    };
  }
  
  /**
   * Convert live scraped data to our GlobalFlightData format
   */
  static convertToGlobalFormat(liveData: LiveFlightData): any {
    if (!liveData.scraped) return null;
    
    return {
      flightNumber: liveData.flightNumber,
      airline: {
        name: liveData.airline || 'Unknown Airline',
        code: liveData.flightNumber.substring(0, 2),
        country: 'Unknown'
      },
      aircraft: {
        type: liveData.aircraft || 'Unknown Aircraft',
        manufacturer: this.guessManufacturer(liveData.aircraft),
        registration: `LIVE-${Date.now()}`
      },
      route: {
        departure: {
          airport: 'Unknown Airport',
          iata: liveData.departure || 'UNK',
          city: 'Unknown',
          country: 'Unknown'
        },
        arrival: {
          airport: 'Unknown Airport',
          iata: liveData.arrival || 'UNK',
          city: 'Unknown',
          country: 'Unknown'
        },
        distance: 0,
        duration: this.parseDuration(liveData.duration) || 0
      },
      status: {
        current: liveData.status || 'unknown',
        departureTime: liveData.departureTime,
        arrivalTime: liveData.arrivalTime
      },
      source: 'live-google-scraping',
      scrapedAt: liveData.scrapedAt
    };
  }
  
  private static guessManufacturer(aircraft?: string): string {
    if (!aircraft) return 'Unknown';
    
    const a = aircraft.toUpperCase();
    if (a.includes('BOEING') || a.includes('B737') || a.includes('B777') || a.includes('737') || a.includes('777') || a.includes('787')) {
      return 'Boeing';
    }
    if (a.includes('AIRBUS') || a.includes('A320') || a.includes('A330') || a.includes('A350') || a.includes('A380')) {
      return 'Airbus';
    }
    return 'Unknown';
  }
  
  private static parseDuration(duration?: string): number {
    if (!duration) return 0;
    
    const hourMatch = duration.match(/(\d+)h/);
    const minMatch = duration.match(/(\d+)m/);
    
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const minutes = minMatch ? parseInt(minMatch[1]) : 0;
    
    return hours * 60 + minutes;
  }
}
