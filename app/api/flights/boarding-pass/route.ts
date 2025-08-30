import { NextRequest, NextResponse } from 'next/server';
import BoardingPassOCR from '@/lib/boarding-pass-ocr';
import EnhancedFlightScraper from '@/lib/enhanced-flight-scraper';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('boardingPass') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Boarding pass image is required' },
        { status: 400 }
      );
    }

    console.log(`🎫 Processing boarding pass upload: ${file.name}`);

    // Extract data from boarding pass image
    const boardingPassData = await BoardingPassOCR.extractFromImage(file);

    if (!boardingPassData) {
      return NextResponse.json(
        { error: 'Failed to extract data from boarding pass' },
        { status: 400 }
      );
    }

    console.log(`✅ Extracted boarding pass data for flight ${boardingPassData.flightNumber}`);

    // Get comprehensive flight data using extracted flight number and date
    const scrapedFlightData = await EnhancedFlightScraper.getFlightData(
      boardingPassData.flightNumber,
      boardingPassData.date
    );

    // Verify boarding pass data against scraped data
    let verification = { isValid: true, discrepancies: [], confidence: 1.0 };
    
    if (scrapedFlightData) {
      verification = BoardingPassOCR.verifyFlightData(boardingPassData, scrapedFlightData);
      console.log(`🔍 Verification result: ${verification.confidence * 100}% match`);
    }

    // Calculate bonus XP for boarding pass upload
    const bonusXP = {
      boardingPassUpload: 100, // Bonus for uploading boarding pass
      verification: verification.isValid ? 50 : 0, // Bonus for verified flight
      seatClass: getSeatClassBonus(boardingPassData.seat.class),
      completeness: getCompletenessBonus(boardingPassData)
    };

    const totalBonusXP = Object.values(bonusXP).reduce((sum, xp) => sum + xp, 0);

    // Combine boarding pass data with scraped data
    const enhancedFlightData = {
      // Primary data from boarding pass (most accurate)
      flightNumber: boardingPassData.flightNumber,
      date: boardingPassData.date,
      passengerName: boardingPassData.passengerName,
      
      // Enhanced data from scraping
      airline: scrapedFlightData?.airline || boardingPassData.airline,
      aircraft: scrapedFlightData?.aircraft || { type: 'Unknown', registration: 'N/A', manufacturer: 'Unknown' },
      
      // Route data (boarding pass + scraped)
      route: {
        departure: {
          ...boardingPassData.route.departure,
          country: scrapedFlightData?.route?.departure?.country || 'Unknown'
        },
        arrival: {
          ...boardingPassData.route.arrival,
          country: scrapedFlightData?.route?.arrival?.country || 'Unknown'
        },
        duration: scrapedFlightData?.route?.duration || 'N/A',
        distance: scrapedFlightData?.route?.distance || 0,
        distanceUnit: scrapedFlightData?.route?.distanceUnit || 'miles'
      },

      // Boarding pass specific data
      seat: boardingPassData.seat,
      bookingReference: boardingPassData.bookingReference,
      frequentFlyerNumber: boardingPassData.frequentFlyerNumber,
      
      // Status and real-time data from scraping
      status: scrapedFlightData?.status || { current: 'Completed', color: 'green', icon: '✅' },
      realTimeData: scrapedFlightData?.realTimeData,
      
      // Verification and gamification
      verification,
      bonusXP,
      totalBonusXP,
      
      // Achievements for boarding pass upload
      achievements: [
        {
          id: 'boarding_pass_upload',
          name: 'Documentation Master',
          description: 'Uploaded boarding pass for flight verification',
          xp: 100,
          icon: '🎫'
        },
        ...(verification.isValid ? [{
          id: 'verified_flight',
          name: 'Verified Traveler',
          description: 'Flight details verified against boarding pass',
          xp: 50,
          icon: '✅'
        }] : []),
        ...(boardingPassData.seat.class !== 'Economy' ? [{
          id: 'premium_traveler',
          name: 'Premium Experience',
          description: `Traveled in ${boardingPassData.seat.class} class`,
          xp: getSeatClassBonus(boardingPassData.seat.class),
          icon: '🥇'
        }] : [])
      ]
    };

    return NextResponse.json({
      success: true,
      message: 'Boarding pass processed successfully',
      data: enhancedFlightData,
      verification,
      extractedText: boardingPassData.verification.extractedText.substring(0, 200)
    });

  } catch (error) {
    console.error('Boarding pass processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process boarding pass' },
      { status: 500 }
    );
  }

}

// Helper functions
function getSeatClassBonus(seatClass: string): number {
  const bonuses = {
    'Economy': 0,
    'Premium Economy': 25,
    'Business': 75,
    'First': 150
  };
  return bonuses[seatClass as keyof typeof bonuses] || 0;
}

function getCompletenessBonus(data: any): number {
  let bonus = 0;
  if (data.seat?.number) bonus += 10;
  if (data.bookingReference) bonus += 10;
  if (data.frequentFlyerNumber) bonus += 15;
  if (data.route?.departure?.gate) bonus += 5;
  if (data.route?.departure?.terminal) bonus += 5;
  return bonus;
}
