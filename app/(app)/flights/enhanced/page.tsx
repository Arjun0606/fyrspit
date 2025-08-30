'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { ArrowLeft, Plane, Calendar, Upload, Zap, Loader2, Camera, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EnhancedFlightPage() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'manual' | 'boarding-pass'>('manual');
  
  // Manual entry state
  const [flightNumber, setFlightNumber] = useState('');
  const [flightDate, setFlightDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [flightData, setFlightData] = useState<any>(null);
  
  // Boarding pass state
  const [boardingPassFile, setBoardingPassFile] = useState<File | null>(null);
  const [isProcessingBoardingPass, setIsProcessingBoardingPass] = useState(false);
  const [boardingPassPreview, setBoardingPassPreview] = useState<string | null>(null);

  const handleFlightLookup = async () => {
    if (!flightNumber.trim()) {
      toast.error('Please enter a flight number');
      return;
    }

    if (!user) {
      toast.error('Please sign in to log flights');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log(`🔍 Looking up ${flightNumber} on ${flightDate}`);
      
      const response = await fetch('/api/flights/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          flightNumber: flightNumber.trim().toUpperCase(),
          date: flightDate
        }),
      });

      if (!response.ok) {
        throw new Error('Flight not found or data unavailable');
      }

      const result = await response.json();
      setFlightData(result);

      toast.success(`✈️ Found flight data for ${flightNumber}!`, { duration: 3000 });

    } catch (error) {
      console.error('Flight lookup error:', error);
      toast.error('Flight not found. Please check the flight number and date.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBoardingPassUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setBoardingPassFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setBoardingPassPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    toast.success('Boarding pass uploaded! Click "Process" to extract data.');
  };

  const processBoardingPass = async () => {
    if (!boardingPassFile || !user) {
      toast.error('Please upload a boarding pass and sign in');
      return;
    }

    setIsProcessingBoardingPass(true);

    try {
      const formData = new FormData();
      formData.append('boardingPass', boardingPassFile);

      const response = await fetch('/api/flights/boarding-pass', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process boarding pass');
      }

      const result = await response.json();
      setFlightData(result.data);

      // Show success with bonus XP
      toast.success(
        `🎫 Boarding pass processed! +${result.data.totalBonusXP} bonus XP!`,
        { duration: 5000 }
      );

      // Show verification status
      if (result.verification.isValid) {
        toast.success('✅ Flight details verified!', { duration: 3000 });
      } else {
        toast.error(`⚠️ Verification issues: ${result.verification.discrepancies.join(', ')}`);
      }

    } catch (error) {
      console.error('Boarding pass processing error:', error);
      toast.error('Failed to process boarding pass. Please try again.');
    } finally {
      setIsProcessingBoardingPass(false);
    }
  };

  const saveFlightLog = async () => {
    if (!flightData || !user) return;

    try {
      // Here you would save to Firebase/database
      toast.success('Flight logged successfully! 🎉');
      router.push('/feed');
    } catch (error) {
      toast.error('Failed to save flight log');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Link 
            href="/feed" 
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm sm:text-base">Back to Feed</span>
          </Link>
        </div>

        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Enhanced Flight Logger</h1>
          <p className="text-gray-400 text-sm sm:text-base">Enter flight details or upload your boarding pass</p>
          <p className="text-orange-400 text-xs mt-2">✨ Get bonus XP for boarding pass uploads!</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-700 mb-6 sm:mb-8">
          <nav className="flex space-x-4 sm:space-x-8">
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex items-center space-x-2 py-3 sm:py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'manual'
                  ? 'border-orange-500 text-orange-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Plane className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Manual Entry</span>
            </button>
            <button
              onClick={() => setActiveTab('boarding-pass')}
              className={`flex items-center space-x-2 py-3 sm:py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'boarding-pass'
                  ? 'border-orange-500 text-orange-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Boarding Pass</span>
            </button>
          </nav>
        </div>

        {/* Manual Entry Tab */}
        {activeTab === 'manual' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Flight Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Flight Number</label>
                  <input
                    type="text"
                    placeholder="e.g., QR123, EK456"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Flight Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={flightDate}
                    onChange={(e) => setFlightDate(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={handleFlightLookup}
                disabled={isLoading || !flightNumber.trim()}
                className="w-full flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Looking up flight...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    <span>Get Flight Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Boarding Pass Tab */}
        {activeTab === 'boarding-pass' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Upload Boarding Pass</h2>
              
              {!boardingPassPreview ? (
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Upload your boarding pass for automatic data extraction</p>
                  <p className="text-orange-400 text-sm mb-4">📱 Take a photo or upload from gallery</p>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBoardingPassUpload}
                    className="hidden"
                    id="boarding-pass-upload"
                  />
                  <label
                    htmlFor="boarding-pass-upload"
                    className="inline-flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg cursor-pointer transition-colors"
                  >
                    <Upload className="h-5 w-5" />
                    <span>Choose File</span>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={boardingPassPreview}
                      alt="Boarding pass preview"
                      className="w-full max-h-64 object-contain rounded-lg border border-gray-600"
                    />
                    <button
                      onClick={() => {
                        setBoardingPassPreview(null);
                        setBoardingPassFile(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                    >
                      ×
                    </button>
                  </div>
                  
                  <button
                    onClick={processBoardingPass}
                    disabled={isProcessingBoardingPass}
                    className="w-full flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white py-3 px-6 rounded-lg transition-colors"
                  >
                    {isProcessingBoardingPass ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Processing boarding pass...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        <span>Extract Flight Data</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Flight Data Display */}
        {flightData && (
          <div className="mt-8 space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Flight Information</h2>
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm">Data Retrieved</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-gray-400 text-sm">Flight</p>
                  <p className="text-white font-medium">{flightData.flightNumber}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Airline</p>
                  <p className="text-white font-medium">{flightData.airline?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Aircraft</p>
                  <p className="text-white font-medium">{flightData.aircraft?.type || 'Unknown'}</p>
                </div>
              </div>

              {/* Route Information */}
              {flightData.route && (
                <div className="border-t border-gray-600 pt-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Route</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-medium mb-2">Departure</h4>
                      <p className="text-gray-300">{flightData.route.departure?.airport || 'Unknown'}</p>
                      <p className="text-gray-400 text-sm">{flightData.route.departure?.city}</p>
                      {flightData.route.departure?.time && (
                        <p className="text-orange-400 text-sm">🕐 {flightData.route.departure.time}</p>
                      )}
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-2">Arrival</h4>
                      <p className="text-gray-300">{flightData.route.arrival?.airport || 'Unknown'}</p>
                      <p className="text-gray-400 text-sm">{flightData.route.arrival?.city}</p>
                      {flightData.route.arrival?.time && (
                        <p className="text-orange-400 text-sm">🕐 {flightData.route.arrival.time}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Boarding Pass Specific Data */}
              {flightData.seat && (
                <div className="border-t border-gray-600 pt-4 mt-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Boarding Pass Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Seat</p>
                      <p className="text-white font-medium">{flightData.seat.number}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Class</p>
                      <p className="text-white font-medium">{flightData.seat.class}</p>
                    </div>
                    {flightData.bookingReference && (
                      <div>
                        <p className="text-gray-400 text-sm">Booking Ref</p>
                        <p className="text-white font-medium">{flightData.bookingReference}</p>
                      </div>
                    )}
                    {flightData.totalBonusXP && (
                      <div>
                        <p className="text-gray-400 text-sm">Bonus XP</p>
                        <p className="text-orange-400 font-bold">+{flightData.totalBonusXP}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {flightData.achievements && flightData.achievements.length > 0 && (
                <div className="border-t border-gray-600 pt-4 mt-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Achievements Unlocked</h3>
                  <div className="space-y-2">
                    {flightData.achievements.map((achievement: any, index: number) => (
                      <div key={index} className="bg-orange-900/20 border border-orange-700 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{achievement.icon}</span>
                          <div>
                            <p className="text-orange-400 font-medium">{achievement.name}</p>
                            <p className="text-gray-400 text-sm">{achievement.description}</p>
                            <p className="text-orange-300 text-xs">+{achievement.xp} XP</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-600">
                <button
                  onClick={saveFlightLog}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg transition-colors font-medium"
                >
                  Save Flight Log 🎉
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
