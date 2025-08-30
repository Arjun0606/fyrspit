/**
 * 🚀 BULLETPROOF FLIGHT DATA API
 * The "Strava for Aviation" - Ultimate Flight Data System
 * 
 * Strategy: Try multiple sources until we get the data
 * Input: Flight Number + Date → Output: EVERYTHING
 */

import axios from 'axios';
import { getAirportByCode, getAirportsByCity } from './airports-database';

// Track SERP usage across invocations (best-effort in serverless)
declare global {
  // eslint-disable-next-line no-var
  var __serp_usage: { day: string; count: number } | undefined;
}

export interface FlightData {
  // Core Info
  flightNumber: string;
  date: string;
  
  // Route
  departure: {
    airport: string;
    iata: string;
    city: string;
    country: string;
    terminal?: string;
    gate?: string;
    scheduledTime: string;
    actualTime?: string;
  };
  
  arrival: {
    airport: string;
    iata: string;
    city: string;
    country: string;
    terminal?: string;
    gate?: string;
    scheduledTime: string;
    actualTime?: string;
  };
  
  // Aircraft & Airline
  airline: {
    name: string;
    iata: string;
    icao: string;
  };
  
  aircraft: {
    model: string;
    registration?: string;
    type: string;
  };
  
  // Flight Details
  status: 'scheduled' | 'boarding' | 'departed' | 'in-flight' | 'landed' | 'cancelled' | 'delayed';
  duration: string;
  distance: number; // in miles
  
  // Gamification Data
  xpValue: number;
  isInternational: boolean;
  
  // Source
  dataSource: string;
}

class BulletproofFlightAPI {
  private sources = [
    'serp',
    'bing_scrape',
    'duck_scrape',
    'flightradar24',
    'opensky',
    'google_scrape',
    'trip_scrape',
    'aviationstack'
  ];

  /**
   * 🎯 MAIN METHOD: Get flight data by any means necessary
   */
  async getFlightData(flightNumber: string, date: string): Promise<FlightData | null> {
    console.log(`🚀 BULLETPROOF: Getting data for ${flightNumber} on ${date}`);
    
    // Run all sources in parallel with a 10s cap; return the first complete result
    const withTimeout = <T,>(p: Promise<T>, ms: number) => new Promise<T>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('timeout')), ms);
      p.then((v) => { clearTimeout(t); resolve(v); }).catch((e) => { clearTimeout(t); reject(e); });
    });

    const attempts = this.sources.map((source) => (async () => {
      try {
        console.log(`🔍 Trying source (parallel): ${source}`);
        const data = await this.trySource(source, flightNumber, date);
        if (data && data.departure?.iata && data.arrival?.iata) {
          console.log(`✅ SUCCESS from ${source}!`);
          return data;
        }
        throw new Error(`${source} incomplete`);
      } catch (e) {
        throw e;
      }
    })());

    try {
      // Prefer the fastest successful one
      const result = await withTimeout(Promise.any(attempts), 10000);
      return result as FlightData;
    } catch {
      console.log('Parallel attempts did not yield a complete result. Falling back to sequential.');
      for (const source of this.sources) {
        try {
          const data = await this.trySource(source, flightNumber, date);
          if (data) return data;
        } catch {}
      }
      console.log(`💥 ALL SOURCES FAILED for ${flightNumber}`);
      return null;
    }
  }

  /**
   * 🔄 Try a specific data source
   */
  private async trySource(source: string, flightNumber: string, date: string): Promise<FlightData | null> {
    const clean = flightNumber.toUpperCase().replace(/\s|-/g, '');
    switch (source) {
      case 'serp':
        return await this.querySerp(clean, date);
      case 'bing_scrape':
        return await this.scrapeBing(clean, date);
      case 'duck_scrape':
        return await this.scrapeDuckDuckGo(clean, date);
      case 'flightradar24':
        return await this.scrapeFlightRadar24(clean, date);
      
      case 'opensky':
        return await this.queryOpenSky(clean, date);
      
      case 'google_scrape':
        return await this.scrapeGoogle(clean, date);
      
      case 'trip_scrape':
        return await this.scrapeTripDotCom(clean, date);
      
      case 'aviationstack':
        return await this.queryAviationStack(clean, date);
      
      default:
        return null;
    }
  }

  /**
   * 🧠 METHOD 0: SERP provider (Serper.dev or SerpAPI) to get Google results in JSON
   */
  private async querySerp(flightNumber: string, date: string): Promise<FlightData | null> {
    if (!this.canUseSerp()) {
      console.log('SERP daily cap reached; skipping SERP and using fallbacks.');
      return null;
    }
    this.recordSerpAttempt();
    const query = `${flightNumber} ${date} flight status`;
    const serperKey = process.env.SERPER_API_KEY;
    const serpapiKey = process.env.SERPAPI_API_KEY;

    // Try Serper.dev first (lower cost)
    if (serperKey) {
      try {
        const resp = await axios.post(
          'https://google.serper.dev/search',
          { q: query, gl: 'in', hl: 'en', num: 5 },
          { headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' }, timeout: 12000 }
        );
        const data = resp.data || {};
        const parsed = this.parseSerpGeneric(data, flightNumber, date);
        if (parsed) return { ...parsed, dataSource: 'Serper' };
      } catch (e) {
        console.log('Serper failed:', e);
      }
    }

    // Fallback to SerpAPI
    if (serpapiKey) {
      try {
        const url = `https://serpapi.com/search.json?engine=google&hl=en&gl=in&num=5&q=${encodeURIComponent(query)}&api_key=${encodeURIComponent(serpapiKey)}`;
        const resp = await axios.get(url, { timeout: 12000, headers: { 'Accept': 'application/json' } });
        const data = resp.data || {};
        const parsed = this.parseSerpGeneric(data, flightNumber, date);
        if (parsed) return { ...parsed, dataSource: 'SerpAPI' };
      } catch (e) {
        console.log('SerpAPI failed:', e);
      }
    }

    return null;
  }

  /**
   * Parse SERP JSON (Serper/SerpAPI) generically for flight card signals.
   */
  private parseSerpGeneric(data: any, flightNumber: string, date: string): FlightData | null {
    try {
      const buckets: string[] = [];

      // Serper fields
      if (Array.isArray(data.organic)) {
        for (const item of data.organic) {
          if (item?.title) buckets.push(String(item.title));
          if (item?.snippet) buckets.push(String(item.snippet));
        }
      }
      if (data.answerBox) {
        const ab = data.answerBox;
        if (ab.title) buckets.push(String(ab.title));
        if (ab.answer) buckets.push(String(ab.answer));
        if (ab.snippet) buckets.push(String(ab.snippet));
      }
      if (data.knowledgeGraph) {
        const kg = data.knowledgeGraph;
        if (kg.title) buckets.push(String(kg.title));
        if (kg.description) buckets.push(String(kg.description));
      }

      // SerpAPI fields
      if (Array.isArray(data.organic_results)) {
        for (const item of data.organic_results) {
          if (item?.title) buckets.push(String(item.title));
          if (item?.snippet) buckets.push(String(item.snippet));
        }
      }
      if (data.answer_box) {
        const ab = data.answer_box;
        if (ab.title) buckets.push(String(ab.title));
        if (ab.answer) buckets.push(String(ab.answer));
        if (ab.snippet) buckets.push(String(ab.snippet));
      }
      if (data.knowledge_graph) {
        const kg = data.knowledge_graph;
        if (kg.title) buckets.push(String(kg.title));
        if (kg.description) buckets.push(String(kg.description));
      }

      const text = buckets.join(' \n ');
      if (!text) return null;

      // Extract IATA codes and times
      const rawIatas = text.match(/\b[A-Z]{3}\b/g) || [];
      const iataMatches = rawIatas.filter((code: string) => {
        const blacklist = new Set(['XML','RSS','PNG','JPG','SVG','CSS','HTML','JS','WWW','COM']);
        if (blacklist.has(code)) return false;
        return !!getAirportByCode(code);
      });
      const timeMatches = text.match(/\b\d{1,2}:\d{2}\s*(?:AM|PM)?\b/gi) || [];
      const airlineMatch = text.match(/(IndiGo|Qatar Airways|Emirates|Etihad|Air India|Vistara|Akasa|SpiceJet|United|Delta|American|British Airways|Lufthansa|KLM|Air France|Singapore Airlines|Cathay Pacific|Qantas|Ryanair|easyJet)/i);

      let depIata = iataMatches[0] || '';
      let arrIata = iataMatches[1] || '';

      // Fallback: try to extract cities and map to IATA
      if (!depIata || !arrIata) {
        // Normalize separators
        const normalized = text.replace(/&rarr;|→|\u2192/g, '->').replace(/\s+/g, ' ');
        const arrowMatch = normalized.match(/([A-Za-z][A-Za-z .()'\-]{2,})\s*(?:->| to )\s*([A-Za-z][A-Za-z .()'\-]{2,})/i);
        if (arrowMatch) {
          const depCity = arrowMatch[1].trim().replace(/\([^)]*\)/g, '').trim();
          const arrCity = arrowMatch[2].trim().replace(/\([^)]*\)/g, '').trim();
          const depCandidates = getAirportsByCity(depCity);
          const arrCandidates = getAirportsByCity(arrCity);
          if (depCandidates && depCandidates.length > 0) depIata = depCandidates[0].code;
          if (arrCandidates && arrCandidates.length > 0) arrIata = arrCandidates[0].code;
        }
      }

      if (!depIata || !arrIata) return null;

      const depTime = timeMatches[0] || '';
      const arrTime = timeMatches[1] || '';
      const duration = this.calculateDurationFromStrings(date, depTime, arrTime);
      const distance = this.computeDistanceMiles(depIata, arrIata);

      return {
        flightNumber,
        date,
        departure: {
          airport: depIata,
          iata: depIata,
          city: '',
          country: '',
          scheduledTime: this.combineDateTime(date, depTime),
        },
        arrival: {
          airport: arrIata,
          iata: arrIata,
          city: '',
          country: '',
          scheduledTime: this.combineDateTime(date, arrTime),
        },
        airline: {
          name: airlineMatch ? airlineMatch[1] : this.inferAirlineFromPrefix(flightNumber),
          iata: flightNumber.slice(0, 2),
          icao: '',
        },
        aircraft: {
          model: 'Unknown Aircraft',
          type: 'Commercial',
        },
        status: 'scheduled',
        duration,
        distance,
        xpValue: this.calculateXPFromValues(distance, duration, depIata, arrIata),
        isInternational: this.isInternationalByIata(depIata, arrIata),
        dataSource: 'SERP'
      };
    } catch {
      return null;
    }
  }

  /**
   * Soft cap for SERP calls. Set SERP_MAX_PER_DAY to override (default 150/day).
   */
  private canUseSerp(): boolean {
    const maxPerDay = Number(process.env.SERP_MAX_PER_DAY || 150);
    const today = new Date().toISOString().slice(0, 10);
    const state = global.__serp_usage;
    if (!state || state.day !== today) {
      return true;
    }
    return state.count < maxPerDay;
  }

  private recordSerpAttempt(): void {
    const today = new Date().toISOString().slice(0, 10);
    if (!global.__serp_usage || global.__serp_usage.day !== today) {
      global.__serp_usage = { day: today, count: 1 };
      return;
    }
    global.__serp_usage.count += 1;
  }

  /**
   * 🕷️ METHOD 1: FlightRadar24 API (Most Reliable)
   */
  private async scrapeFlightRadar24(flightNumber: string, date: string): Promise<FlightData | null> {
    try {
      // FlightRadar24 has JSON endpoints we can use
      const cleanFlight = flightNumber.replace(/\s+/g, '').toUpperCase();
      
      // Try their search API first
      const searchUrl = `https://www.flightradar24.com/_json/autocomplete.php?query=${cleanFlight}&limit=50`;
      
      const searchResponse = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Referer': 'https://www.flightradar24.com/',
        },
        timeout: 10000
      });

      if (searchResponse.data && searchResponse.data.results) {
        const flightResult = searchResponse.data.results.find((r: any) => 
          r.type === 'schedule' && r.label.includes(cleanFlight)
        );
        
        if (flightResult) {
          // Get detailed flight info
          const detailUrl = `https://www.flightradar24.com/_json/flights.php?flight=${flightResult.id}`;
          const detailResponse = await axios.get(detailUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
              'Accept': 'application/json',
              'Referer': 'https://www.flightradar24.com/',
            },
            timeout: 8000
          });
          
          if (detailResponse.data) {
            return this.parseFlightRadar24Data(detailResponse.data, flightNumber, date);
          }
        }
      }
      
      return null;
    } catch (error) {
      console.log('FlightRadar24 failed:', error);
      return null;
    }
  }

  /**
   * 🌐 METHOD 2: AviationStack API (Free Tier)
   */
  private async queryAviationStack(flightNumber: string, date: string): Promise<FlightData | null> {
    try {
      // Free tier with basic access
      const url = `http://api.aviationstack.com/v1/flights?access_key=free&flight_iata=${flightNumber}`;
      
      const response = await axios.get(url, { 
        timeout: 8000,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        return this.parseAviationStackData(response.data.data[0], flightNumber, date);
      }
      
      return null;
    } catch (error) {
      console.log('AviationStack failed:', error);
      return null;
    }
  }

  /**
   * 🛰️ METHOD 3: OpenSky Network (Free & Reliable)
   */
  private async queryOpenSky(flightNumber: string, date: string): Promise<FlightData | null> {
    try {
      const cleanFlight = flightNumber.replace(/\s+/g, '').toUpperCase();
      
      // Get current flights
      const url = 'https://opensky-network.org/api/states/all';
      
      const response = await axios.get(url, { 
        timeout: 10000,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.data && response.data.states) {
        const flight = response.data.states.find((state: any[]) => 
          state[1] && state[1].trim().toUpperCase() === cleanFlight
        );
        
        if (flight) {
          return this.parseOpenSkyData(flight, flightNumber, date);
        }
      }
      
      return null;
    } catch (error) {
      console.log('OpenSky failed:', error);
      return null;
    }
  }

  /**
   * 🕷️ METHOD 4: Smart Google Scraping
   */
  private async scrapeGoogle(flightNumber: string, date: string): Promise<FlightData | null> {
    try {
      // Include date to get the correct instance
      const searchQuery = `${flightNumber} ${date} flight status`;
      const url = `https://www.google.com/search?hl=en&gl=in&num=1&q=${encodeURIComponent(searchQuery)}`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 10000
      });

      const html = response.data;
      return this.parseGenericHTML(html, flightNumber, date, 'Google');
    } catch (error) {
      console.log('Google scraping failed:', error);
      return null;
    }
  }

  private async scrapeBing(flightNumber: string, date: string): Promise<FlightData | null> {
    try {
      const searchQuery = `${flightNumber} ${date} flight status`;
      const url = `https://www.bing.com/search?q=${encodeURIComponent(searchQuery)}&cc=IN&setlang=en`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        },
        timeout: 10000
      });
      const html = response.data;
      return this.parseGenericHTML(html, flightNumber, date, 'Bing');
    } catch (error) {
      console.log('Bing scraping failed:', error);
      return null;
    }
  }

  private async scrapeDuckDuckGo(flightNumber: string, date: string): Promise<FlightData | null> {
    try {
      const searchQuery = `${flightNumber} ${date} flight status`;
      const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}&kl=wt-wt&ia=web`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        },
        timeout: 10000
      });
      const html = response.data;
      return this.parseGenericHTML(html, flightNumber, date, 'DuckDuckGo');
    } catch (error) {
      console.log('DuckDuckGo scraping failed:', error);
      return null;
    }
  }

  /**
   * 🔄 Data Parsers
   */
  private parseFlightRadar24Data(data: any, flightNumber: string, date: string): FlightData {
    const flight = data.result?.response?.data?.[0] || data;
    
    return {
      flightNumber,
      date,
      departure: {
        airport: flight.airport?.origin?.name || 'Unknown Airport',
        iata: flight.airport?.origin?.code?.iata || '',
        city: flight.airport?.origin?.position?.region?.city || '',
        country: flight.airport?.origin?.position?.country?.name || '',
        scheduledTime: flight.time?.scheduled?.departure || '',
        actualTime: flight.time?.real?.departure || undefined,
      },
      arrival: {
        airport: flight.airport?.destination?.name || 'Unknown Airport',
        iata: flight.airport?.destination?.code?.iata || '',
        city: flight.airport?.destination?.position?.region?.city || '',
        country: flight.airport?.destination?.position?.country?.name || '',
        scheduledTime: flight.time?.scheduled?.arrival || '',
        actualTime: flight.time?.real?.arrival || undefined,
      },
      airline: {
        name: flight.airline?.name || 'Unknown Airline',
        iata: flight.airline?.code?.iata || '',
        icao: flight.airline?.code?.icao || '',
      },
      aircraft: {
        model: flight.aircraft?.model?.text || 'Unknown Aircraft',
        registration: flight.aircraft?.registration || undefined,
        type: flight.aircraft?.model?.code || 'Commercial',
      },
      status: this.normalizeStatus(flight.status?.text || 'scheduled'),
      duration: this.calculateDuration(flight.time?.scheduled?.departure, flight.time?.scheduled?.arrival),
      distance: this.estimateDistance(flight.airport?.origin, flight.airport?.destination),
      xpValue: this.calculateXP(flight),
      isInternational: this.isInternationalFlight(flight.airport?.origin, flight.airport?.destination),
      dataSource: 'FlightRadar24'
    };
  }

  private parseAviationStackData(data: any, flightNumber: string, date: string): FlightData {
    return {
      flightNumber,
      date,
      departure: {
        airport: data.departure?.airport || 'Unknown Airport',
        iata: data.departure?.iata || '',
        city: data.departure?.timezone || '',
        country: '',
        scheduledTime: data.departure?.scheduled || '',
        actualTime: data.departure?.actual || undefined,
      },
      arrival: {
        airport: data.arrival?.airport || 'Unknown Airport',
        iata: data.arrival?.iata || '',
        city: data.arrival?.timezone || '',
        country: '',
        scheduledTime: data.arrival?.scheduled || '',
        actualTime: data.arrival?.actual || undefined,
      },
      airline: {
        name: data.airline?.name || 'Unknown Airline',
        iata: data.airline?.iata || '',
        icao: data.airline?.icao || '',
      },
      aircraft: {
        model: data.aircraft?.registration || 'Unknown Aircraft',
        type: 'Commercial',
      },
      status: this.normalizeStatus(data.flight_status || 'scheduled'),
      duration: '2h 30m', // Placeholder
      distance: 800, // Placeholder
      xpValue: 150,
      isInternational: true,
      dataSource: 'AviationStack'
    };
  }

  private parseOpenSkyData(state: any[], flightNumber: string, date: string): FlightData {
    return {
      flightNumber,
      date,
      departure: {
        airport: 'Unknown Airport',
        iata: '',
        city: '',
        country: state[2] || '', // Origin country
        scheduledTime: new Date(state[3] * 1000).toISOString(),
      },
      arrival: {
        airport: 'Unknown Airport',
        iata: '',
        city: '',
        country: '',
        scheduledTime: '',
      },
      airline: {
        name: 'Unknown Airline',
        iata: '',
        icao: state[0] || '', // ICAO24
      },
      aircraft: {
        model: 'Unknown Aircraft',
        type: 'Commercial',
      },
      status: state[8] ? 'in-flight' : 'scheduled' as const,
      duration: '2h 00m',
      distance: Math.floor((state[9] || 0) * 0.000621371), // Convert meters to miles
      xpValue: 120,
      isInternational: false,
      dataSource: 'OpenSky'
    };
  }

  private parseGenericHTML(html: string, flightNumber: string, date: string, sourceLabel: string): FlightData | null {
    try {
      // Enhanced Google parsing with multiple patterns
      const patterns = {
        // Look for flight card data
        departure: /\bfrom\b[^<]*<[^>]*>([^<]{3,})</gi,
        arrival: /\bto\b[^<]*<[^>]*>([^<]{3,})</gi,
        airline: /(IndiGo|Qatar Airways|Emirates|Etihad|Air India|Vistara|Akasa|SpiceJet|United|Delta|American|British Airways)/gi,
        status: /(arrived|departed|on time|delayed|cancelled)/gi,
        time: /\b\d{1,2}:\d{2}\s*(?:AM|PM)\b/gi,
        airport: /\b[A-Z]{3}\b/g, // IATA codes
      };

      const results: any = {};
      
      // Extract basic info
      for (const [key, pattern] of Object.entries(patterns)) {
        const matches = [...html.matchAll(pattern)];
        if (matches.length > 0) {
          results[key] = matches.map(m => m[1] || m[0]).filter(Boolean);
        }
      }

      // Look for structured data
      const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/s);
      if (jsonLdMatch) {
        try {
          const jsonData = JSON.parse(jsonLdMatch[1]);
          if (jsonData['@type'] === 'Flight') {
            return this.parseGoogleStructuredData(jsonData, flightNumber, date);
          }
        } catch (e) {
          // Continue with HTML parsing
        }
      }

      // Build flight data from extracted info (fallback tolerant)
      if ((results.airport && results.airport.length >= 2) || results.departure || results.arrival) {
        // Derive candidate IATA codes
        const rawCandidates: string[] = [];
        if (Array.isArray(results.airport)) rawCandidates.push(...results.airport);
        const depMatchFromText = results.departure?.[0]?.match(/\b[A-Z]{3}\b/)?.[0];
        const arrMatchFromText = results.arrival?.[0]?.match(/\b[A-Z]{3}\b/)?.[0];
        if (depMatchFromText) rawCandidates.push(depMatchFromText);
        if (arrMatchFromText) rawCandidates.push(arrMatchFromText);

        const validCandidates = rawCandidates.filter((c) => !!getAirportByCode(c));
        let depIata = validCandidates[0] || '';
        let arrIata = validCandidates[1] || '';

        // If still missing, try city → IATA mapping
        if (!depIata || !arrIata) {
          const plain = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
          const arrow = plain.match(/([A-Za-z][A-Za-z .()'\-]{2,})\s*(?:->| to |–|—| - )\s*([A-Za-z][A-Za-z .()'\-]{2,})/i);
          if (arrow) {
            const depCity = arrow[1].trim();
            const arrCity = arrow[2].trim();
            const depList = getAirportsByCity(depCity);
            const arrList = getAirportsByCity(arrCity);
            if (!depIata && depList.length > 0) depIata = depList[0].code;
            if (!arrIata && arrList.length > 0) arrIata = arrList[0].code;
          }
        }

        if (!depIata || !arrIata) return null;

        // Attempt to compute duration from first two times
        const depTime = results.time?.[0] || '';
        const arrTime = results.time?.[1] || '';
        const duration = this.calculateDurationFromStrings(date, depTime, arrTime);

        // Compute distance from airport coordinates if available
        const distance = this.computeDistanceMiles(depIata, arrIata);

        return {
          flightNumber,
          date,
          departure: {
            airport: getAirportByCode(depIata)?.name || 'Unknown Airport',
            iata: depIata,
            city: getAirportByCode(depIata)?.city || '',
            country: getAirportByCode(depIata)?.country || '',
            scheduledTime: this.combineDateTime(date, depTime),
          },
          arrival: {
            airport: getAirportByCode(arrIata)?.name || 'Unknown Airport',
            iata: arrIata,
            city: getAirportByCode(arrIata)?.city || '',
            country: getAirportByCode(arrIata)?.country || '',
            scheduledTime: this.combineDateTime(date, arrTime),
          },
          airline: {
            name: results.airline?.[0] || 'Unknown Airline',
            iata: '',
            icao: '',
          },
          aircraft: {
            model: 'Unknown Aircraft',
            type: 'Commercial',
          },
          status: this.normalizeStatus(results.status?.[0] || 'scheduled'),
          duration,
          distance,
          xpValue: this.calculateXPFromValues(distance, duration, depIata, arrIata),
          isInternational: this.isInternationalByIata(depIata, arrIata),
          dataSource: sourceLabel
        };
      }

      return null;
    } catch (error) {
      console.log(`${sourceLabel} HTML parsing failed:`, error);
      return null;
    }
  }

  private async scrapeTripDotCom(flightNumber: string, date: string): Promise<FlightData | null> {
    try {
      // Try Trip.com flight status path; if structure differs, we still parse generically
      const url = `https://www.trip.com/flights/status-${encodeURIComponent(flightNumber)}/?date=${encodeURIComponent(date)}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        },
        timeout: 12000
      });
      const html = response.data;
      return this.parseGenericHTML(html, flightNumber, date, 'Trip.com');
    } catch (error) {
      console.log('Trip.com scraping failed:', error);
      return null;
    }
  }

  private parseGoogleStructuredData(data: any, flightNumber: string, date: string): FlightData {
    const depIata = data.departureAirport?.iataCode || '';
    const arrIata = data.arrivalAirport?.iataCode || '';
    const duration = this.calculateDuration(data.departureTime, data.arrivalTime);
    const distance = this.computeDistanceMiles(depIata, arrIata);
    return {
      flightNumber,
      date,
      departure: {
        airport: data.departureAirport?.name || 'Unknown Airport',
        iata: depIata,
        city: data.departureAirport?.address?.addressLocality || '',
        country: data.departureAirport?.address?.addressCountry || '',
        scheduledTime: data.departureTime || '',
      },
      arrival: {
        airport: data.arrivalAirport?.name || 'Unknown Airport',
        iata: arrIata,
        city: data.arrivalAirport?.address?.addressLocality || '',
        country: data.arrivalAirport?.address?.addressCountry || '',
        scheduledTime: data.arrivalTime || '',
      },
      airline: {
        name: data.airline?.name || 'Unknown Airline',
        iata: data.airline?.iataCode || '',
        icao: '',
      },
      aircraft: {
        model: data.aircraft?.name || 'Unknown Aircraft',
        type: 'Commercial',
      },
      status: this.normalizeStatus(data.flightStatus || 'scheduled'),
      duration,
      distance,
      xpValue: this.calculateXPFromValues(distance, duration, depIata, arrIata),
      isInternational: this.isInternationalByIata(depIata, arrIata),
      dataSource: 'Google Structured'
    };
  }

  /**
   * 🛠️ Helper Methods
   */
  private normalizeStatus(status: string): FlightData['status'] {
    const s = status.toLowerCase();
    if (s.includes('cancel')) return 'cancelled';
    if (s.includes('delay')) return 'delayed';
    if (s.includes('board')) return 'boarding';
    if (s.includes('depart')) return 'departed';
    if (s.includes('flight') || s.includes('air')) return 'in-flight';
    if (s.includes('land') || s.includes('arriv')) return 'landed';
    return 'scheduled';
  }

  private calculateDuration(departure?: string, arrival?: string): string {
    if (!departure || !arrival) return '2h 30m'; // Default
    
    try {
      const dep = new Date(departure);
      const arr = new Date(arrival);
      const diff = arr.getTime() - dep.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hours}h ${minutes}m`;
    } catch {
      return '2h 30m';
    }
  }

  private estimateDistance(origin?: any, destination?: any): number {
    return 0;
  }

  private calculateXP(data: any): number { return 100; }

  private calculateDurationFromStrings(date: string, depTime?: string, arrTime?: string): string {
    if (!depTime || !arrTime) return '0h 0m';
    const toDate = (t: string) => new Date(`${date} ${t}`);
    try {
      const dep = toDate(depTime);
      let arr = toDate(arrTime);
      if (arr < dep) { arr = new Date(arr.getTime() + 24 * 60 * 60 * 1000); }
      const diff = arr.getTime() - dep.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    } catch { return '0h 0m'; }
  }

  private computeDistanceMiles(depIata?: string, arrIata?: string): number {
    if (!depIata || !arrIata) return 0;
    const dep = getAirportByCode(depIata);
    const arr = getAirportByCode(arrIata);
    if (!dep || !arr) return 0;
    const R = 3958.7613; // miles
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(arr.coordinates.lat - dep.coordinates.lat);
    const dLon = toRad(arr.coordinates.lng - dep.coordinates.lng);
    const lat1 = toRad(dep.coordinates.lat);
    const lat2 = toRad(arr.coordinates.lat);
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  }

  private isInternationalByIata(depIata?: string, arrIata?: string): boolean {
    if (!depIata || !arrIata) return false;
    const dep = getAirportByCode(depIata);
    const arr = getAirportByCode(arrIata);
    if (!dep || !arr) return false;
    return dep.country !== arr.country;
  }

  private combineDateTime(date: string, time?: string): string {
    if (!date || !time) return '';
    // Normalize spacing and AM/PM formatting
    const normalized = time.replace(/\s+/g, ' ').trim().toUpperCase();
    return `${date} ${normalized}`;
  }

  private inferAirlineFromPrefix(flightNumber: string): string {
    const prefix = flightNumber.slice(0, 2).toUpperCase();
    const map: Record<string, string> = {
      '6E': 'IndiGo',
      'AI': 'Air India',
      'UK': 'Vistara',
      'QP': 'Akasa Air',
      'SG': 'SpiceJet',
      'G8': 'Go First',
      'EK': 'Emirates',
      'QR': 'Qatar Airways',
      'EY': 'Etihad Airways',
      'BA': 'British Airways',
      'LH': 'Lufthansa',
      'AF': 'Air France',
      'KL': 'KLM',
      'SQ': 'Singapore Airlines',
      'CX': 'Cathay Pacific',
      'QF': 'Qantas',
      'UA': 'United Airlines',
      'DL': 'Delta Air Lines',
      'AA': 'American Airlines'
    };
    return map[prefix] || 'Unknown Airline';
  }

  private calculateXPFromValues(distance: number, durationStr: string, depIata?: string, arrIata?: string): number {
    let xp = 100;
    xp += Math.floor(distance / 50); // 1 XP per 50 miles
    const isIntl = this.isInternationalByIata(depIata, arrIata);
    if (isIntl) xp += 150;
    const minutes = (() => { const m = /([0-9]+)h\s+([0-9]+)m/.exec(durationStr); return m ? (parseInt(m[1]) * 60 + parseInt(m[2])) : 0; })();
    if (minutes > 360) xp += 200; // long haul
    return Math.max(50, Math.min(800, xp));
  }

  private isInternationalFlight(origin?: any, destination?: any): boolean {
    if (!origin?.position?.country || !destination?.position?.country) return false;
    return origin.position.country.name !== destination.position.country.name;
  }
}

// Export singleton instance
export const bulletproofFlightAPI = new BulletproofFlightAPI();
