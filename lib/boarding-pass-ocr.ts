/**
 * Boarding Pass OCR - Extract flight data from boarding pass images
 * Verifies flight details and adds gamification elements
 */

export interface BoardingPassData {
  flightNumber: string;
  date: string;
  passengerName: string;
  airline: {
    name: string;
    code: string;
  };
  route: {
    departure: {
      airport: string;
      iata: string;
      city: string;
      gate?: string;
      terminal?: string;
      time: string;
    };
    arrival: {
      airport: string;
      iata: string;
      city: string;
      gate?: string;
      terminal?: string;
      time: string;
    };
  };
  seat: {
    number: string;
    class: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  };
  bookingReference: string;
  frequentFlyerNumber?: string;
  boardingGroup?: string;
  sequenceNumber?: string;
  verification: {
    isValid: boolean;
    confidence: number;
    extractedText: string;
  };
}

export class BoardingPassOCR {
  /**
   * Extract data from boarding pass image using OCR
   */
  static async extractFromImage(imageFile: File): Promise<BoardingPassData | null> {
    try {
      console.log(`🎫 Processing boarding pass: ${imageFile.name}`);

      // Convert image to base64 for processing
      const base64Image = await this.fileToBase64(imageFile);
      
      // Use browser-based OCR (Tesseract.js) or send to OCR service
      const ocrText = await this.performOCR(base64Image);
      
      if (!ocrText) {
        console.log('❌ OCR failed to extract text');
        return null;
      }

      console.log('📄 OCR Text extracted:', ocrText.substring(0, 200));

      // Parse the OCR text to extract flight data
      const boardingPassData = this.parseOCRText(ocrText);
      
      if (boardingPassData) {
        console.log('✅ Successfully extracted boarding pass data');
        return boardingPassData;
      } else {
        console.log('❌ Failed to parse boarding pass data');
        return null;
      }

    } catch (error) {
      console.error('❌ Boarding pass OCR error:', error);
      return null;
    }
  }

  /**
   * Convert file to base64
   */
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/... prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Perform OCR on image (browser-based)
   */
  private static async performOCR(base64Image: string): Promise<string | null> {
    try {
      // For now, we'll simulate OCR with a pattern-based approach
      // In production, you'd use Tesseract.js or a cloud OCR service
      
      // Simulate OCR text from a typical boarding pass
      const simulatedOCRText = `
        BOARDING PASS
        QATAR AIRWAYS
        QR 123
        PASSENGER: JOHN DOE
        FROM: DOHA (DOH) TO: LONDON (LHR)
        DATE: 15 JAN 2024
        DEPARTURE: 14:30 ARRIVAL: 19:45
        SEAT: 12A GATE: A7 TERMINAL: 3
        BOOKING REF: ABC123
        FREQUENT FLYER: 123456789
        BOARDING GROUP: 2
        SEQUENCE: 045
        ECONOMY CLASS
      `;

      return simulatedOCRText;

      // Real OCR implementation would be:
      /*
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      const { data: { text } } = await worker.recognize(`data:image/jpeg;base64,${base64Image}`);
      await worker.terminate();
      
      return text;
      */

    } catch (error) {
      console.error('OCR processing error:', error);
      return null;
    }
  }

  /**
   * Parse OCR text to extract structured boarding pass data
   */
  private static parseOCRText(ocrText: string): BoardingPassData | null {
    try {
      const text = ocrText.toUpperCase();
      
      // Extract flight number
      const flightMatch = text.match(/([A-Z]{2}\s*\d{2,4})/);
      const flightNumber = flightMatch ? flightMatch[1].replace(/\s+/g, '') : '';

      // Extract passenger name
      const passengerMatch = text.match(/PASSENGER[:\s]*([A-Z\s]+)/);
      const passengerName = passengerMatch ? passengerMatch[1].trim() : '';

      // Extract airports
      const routeMatch = text.match(/FROM[:\s]*([A-Z\s]+)\s*\(([A-Z]{3})\)\s*TO[:\s]*([A-Z\s]+)\s*\(([A-Z]{3})\)/);
      
      // Extract date
      const dateMatch = text.match(/DATE[:\s]*(\d{1,2}\s*[A-Z]{3}\s*\d{4})/);
      const date = dateMatch ? this.parseDate(dateMatch[1]) : '';

      // Extract times
      const departureTimeMatch = text.match(/DEPARTURE[:\s]*(\d{1,2}:\d{2})/);
      const arrivalTimeMatch = text.match(/ARRIVAL[:\s]*(\d{1,2}:\d{2})/);

      // Extract seat
      const seatMatch = text.match(/SEAT[:\s]*([A-Z0-9]+)/);
      const seat = seatMatch ? seatMatch[1] : '';

      // Extract gate and terminal
      const gateMatch = text.match(/GATE[:\s]*([A-Z0-9]+)/);
      const terminalMatch = text.match(/TERMINAL[:\s]*([A-Z0-9]+)/);

      // Extract booking reference
      const bookingMatch = text.match(/(?:BOOKING REF|PNR)[:\s]*([A-Z0-9]+)/);
      const bookingRef = bookingMatch ? bookingMatch[1] : '';

      // Extract class
      const classMatch = text.match(/(ECONOMY|BUSINESS|FIRST|PREMIUM)/);
      const seatClass = classMatch ? classMatch[1] : 'ECONOMY';

      // Extract airline
      const airlineMatch = text.match(/(QATAR AIRWAYS|EMIRATES|AMERICAN AIRLINES|BRITISH AIRWAYS|AIR INDIA|INDIGO)/);
      const airlineName = airlineMatch ? airlineMatch[1] : '';

      if (!flightNumber || !routeMatch) {
        console.log('❌ Missing essential flight data in OCR text');
        return null;
      }

      const boardingPassData: BoardingPassData = {
        flightNumber,
        date,
        passengerName,
        airline: {
          name: airlineName || 'Unknown Airline',
          code: flightNumber.match(/^([A-Z]{2})/)?.[1] || 'XX'
        },
        route: {
          departure: {
            airport: routeMatch[1].trim(),
            iata: routeMatch[2],
            city: routeMatch[1].trim(),
            gate: gateMatch?.[1],
            terminal: terminalMatch?.[1],
            time: departureTimeMatch?.[1] || ''
          },
          arrival: {
            airport: routeMatch[3].trim(),
            iata: routeMatch[4],
            city: routeMatch[3].trim(),
            time: arrivalTimeMatch?.[1] || ''
          }
        },
        seat: {
          number: seat,
          class: this.mapSeatClass(seatClass)
        },
        bookingReference: bookingRef,
        verification: {
          isValid: true,
          confidence: 0.85, // Simulated confidence score
          extractedText: ocrText.substring(0, 500)
        }
      };

      return boardingPassData;

    } catch (error) {
      console.error('OCR parsing error:', error);
      return null;
    }
  }

  /**
   * Parse date from various formats
   */
  private static parseDate(dateStr: string): string {
    try {
      // Handle formats like "15 JAN 2024"
      const months: Record<string, string> = {
        'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
        'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
        'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
      };

      const parts = dateStr.trim().split(/\s+/);
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = months[parts[1]] || '01';
        const year = parts[2];
        return `${year}-${month}-${day}`;
      }

      return new Date().toISOString().split('T')[0]; // Fallback to today
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  /**
   * Map seat class from OCR text
   */
  private static mapSeatClass(classText: string): 'Economy' | 'Premium Economy' | 'Business' | 'First' {
    const upperClass = classText.toUpperCase();
    if (upperClass.includes('FIRST')) return 'First';
    if (upperClass.includes('BUSINESS')) return 'Business';
    if (upperClass.includes('PREMIUM')) return 'Premium Economy';
    return 'Economy';
  }

  /**
   * Verify boarding pass data against scraped flight data
   */
  static verifyFlightData(boardingPassData: BoardingPassData, scrapedData: any): {
    isValid: boolean;
    discrepancies: string[];
    confidence: number;
  } {
    const discrepancies: string[] = [];
    let matches = 0;
    let total = 0;

    // Check flight number
    total++;
    if (boardingPassData.flightNumber === scrapedData.flightNumber) {
      matches++;
    } else {
      discrepancies.push(`Flight number mismatch: ${boardingPassData.flightNumber} vs ${scrapedData.flightNumber}`);
    }

    // Check route
    total++;
    if (boardingPassData.route.departure.iata === scrapedData.route?.departure?.iata) {
      matches++;
    } else {
      discrepancies.push(`Departure airport mismatch`);
    }

    total++;
    if (boardingPassData.route.arrival.iata === scrapedData.route?.arrival?.iata) {
      matches++;
    } else {
      discrepancies.push(`Arrival airport mismatch`);
    }

    // Check airline
    total++;
    if (boardingPassData.airline.code === scrapedData.airline?.code) {
      matches++;
    } else {
      discrepancies.push(`Airline mismatch`);
    }

    const confidence = matches / total;
    const isValid = confidence >= 0.75; // 75% match required

    return {
      isValid,
      discrepancies,
      confidence
    };
  }
}

export default BoardingPassOCR;
