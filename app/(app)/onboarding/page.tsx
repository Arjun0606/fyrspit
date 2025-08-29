'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage } from '@/lib/firebase';
import { doc, updateDoc, getDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plane, MapPin, Heart, Users, Sparkles, ArrowRight, Camera, User, Calendar, Search } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { searchAirports, getPopularAirports, Airport } from '@/lib/global-airports';

interface OnboardingData {
  username: string;
  profilePicture: File | null;
  profilePictureUrl: string;
  dateOfBirth: string;
  gender: string;
  homeAirport: string;
  favoriteAirlines: string[];
  travelStyle: string;
  privacyLevel: string;
  interests: string[];
}

export default function OnboardingPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [airportQuery, setAirportQuery] = useState('');
  const [filteredAirports, setFilteredAirports] = useState<Airport[]>(getPopularAirports());
  const [uploading, setUploading] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [data, setData] = useState<OnboardingData>({
    username: '',
    profilePicture: null,
    profilePictureUrl: '',
    dateOfBirth: '',
    gender: '',
    homeAirport: '',
    favoriteAirlines: [],
    travelStyle: '',
    privacyLevel: 'public',
    interests: []
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Search airports as user types
  useEffect(() => {
    if (airportQuery.length > 0) {
      const results = searchAirports(airportQuery);
      setFilteredAirports(results);
    } else {
      setFilteredAirports(getPopularAirports());
    }
  }, [airportQuery]);

  // Check username availability
  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setUsernameChecking(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      setUsernameAvailable(querySnapshot.empty);
    } catch (error) {
      console.error('Username check error:', error);
      setUsernameAvailable(null);
    } finally {
      setUsernameChecking(false);
    }
  };

  // Debounced username check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (data.username) {
        checkUsernameAvailability(data.username);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [data.username]);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleProfilePictureUpload = async (file: File) => {
    if (!user) return;
    
    setUploading(true);
    try {
      const storageRef = ref(storage, `profile-pictures/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      setData({...data, profilePicture: file, profilePictureUrl: downloadURL});
      toast.success('Profile picture uploaded! 📸');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    try {
      const calculatedAge = calculateAge(data.dateOfBirth);
      
      await updateDoc(doc(db, 'users', user.uid), {
        onboarded: true,
        username: data.username.toLowerCase(),
        profilePictureUrl: data.profilePictureUrl,
        dateOfBirth: data.dateOfBirth,
        age: calculatedAge,
        gender: data.gender,
        homeAirport: data.homeAirport,
        favoriteAirlines: data.favoriteAirlines,
        travelStyle: data.travelStyle,
        'privacy.defaultVisibility': data.privacyLevel,
        interests: data.interests,
        updatedAt: new Date().toISOString()
      });

      toast.success('Welcome to Fyrspit! 🎉');
      router.push('/feed');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete setup');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
            <Image 
              src="/fyrspit-logo.png" 
              alt="Fyrspit" 
              width={40} 
              height={40} 
              className="rounded-lg sm:rounded-xl shadow-lg sm:w-12 sm:h-12"
            />
            <span className="text-2xl sm:text-3xl font-bold text-white">Fyrspit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-white">Welcome aboard, {user?.displayName}! ✈️</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 px-4">Let's personalize your aviation experience</p>
          
          {/* Progress Bar */}
          <div className="max-w-sm sm:max-w-md mx-auto mt-6 sm:mt-8 px-4">
            <div className="flex justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-400">Step {step} of 6</span>
              <span className="text-xs sm:text-sm text-gray-400">{Math.round((step / 6) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 6) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-2 sm:px-0">
          {/* Step 1: Username & Basic Info */}
          {step === 1 && (
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl">
              <div className="text-center mb-6 sm:mb-8">
                <User className="h-12 w-12 sm:h-16 sm:w-16 text-orange-500 mx-auto mb-3 sm:mb-4" />
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4">Create your unique identity</h2>
                <p className="text-gray-300 text-sm sm:text-base">Choose a username that others can find you by</p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username *</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g., pilot_arjun, sky_explorer, aviation_pro"
                      className={`w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 text-base sm:text-lg ${
                        data.username.length >= 3 
                          ? usernameAvailable === true 
                            ? 'border-green-500 focus:ring-green-500' 
                            : usernameAvailable === false 
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-600 focus:ring-orange-500'
                          : 'border-gray-600 focus:ring-orange-500'
                      }`}
                      value={data.username}
                      onChange={(e) => {
                        const newUsername = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                        setData({...data, username: newUsername});
                        setUsernameAvailable(null); // Reset availability while typing
                      }}
                    />
                    {usernameChecking && (
                      <div className="absolute right-4 top-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                      </div>
                    )}
                    {!usernameChecking && data.username.length >= 3 && usernameAvailable === true && (
                      <div className="absolute right-4 top-4 text-green-500">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    {!usernameChecking && data.username.length >= 3 && usernameAvailable === false && (
                      <div className="absolute right-4 top-4 text-red-500">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-400">Letters, numbers, and underscores only</p>
                    {data.username.length >= 3 && (
                      <p className={`text-xs ${
                        usernameAvailable === true 
                          ? 'text-green-400' 
                          : usernameAvailable === false 
                          ? 'text-red-400' 
                          : 'text-gray-400'
                      }`}>
                        {usernameChecking 
                          ? 'Checking...' 
                          : usernameAvailable === true 
                          ? 'Available!' 
                          : usernameAvailable === false 
                          ? 'Username taken' 
                          : ''}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                      min={new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split('T')[0]}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                      value={data.dateOfBirth}
                      onChange={(e) => setData({...data, dateOfBirth: e.target.value})}
                    />
                    {data.dateOfBirth && (
                      <p className="text-xs text-gray-400 mt-1">Age: {calculateAge(data.dateOfBirth)}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                    <select
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                      value={data.gender}
                      onChange={(e) => setData({...data, gender: e.target.value})}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!data.username || data.username.length < 3 || usernameAvailable !== true}
                className="w-full mt-8 bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 font-bold py-4 px-6 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Continue</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Step 2: Profile Picture */}
          {step === 2 && (
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <Camera className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-4">Add your profile picture</h2>
                <p className="text-gray-300">Help others recognize you in the aviation community</p>
              </div>

              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  {data.profilePictureUrl ? (
                    <Image
                      src={data.profilePictureUrl}
                      alt="Profile"
                      width={150}
                      height={150}
                      className="rounded-full object-cover border-4 border-orange-500"
                    />
                  ) : (
                    <div className="w-36 h-36 bg-gray-700 rounded-full flex items-center justify-center border-4 border-gray-600">
                      <User className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  
                  <label className="absolute bottom-0 right-0 bg-orange-500 rounded-full p-2 cursor-pointer hover:bg-orange-600 transition-colors">
                    <Camera className="h-5 w-5 text-gray-900" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleProfilePictureUpload(file);
                        }
                      }}
                    />
                  </label>
                </div>

                {uploading && (
                  <div className="flex items-center space-x-2 text-orange-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                    <span>Uploading...</span>
                  </div>
                )}

                <p className="text-sm text-gray-400 text-center">
                  Click the camera icon to upload a photo. JPG, PNG up to 5MB.
                </p>
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 px-6 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 font-bold py-4 px-6 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Home Airport */}
          {step === 3 && (
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <MapPin className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-4">What's your home airport?</h2>
                <p className="text-gray-300">This helps us show relevant flights and routes</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search airports by name, city, or code..."
                    className="w-full pl-12 pr-6 py-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg"
                    value={airportQuery}
                    onChange={(e) => setAirportQuery(e.target.value)}
                  />
                </div>
                
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {filteredAirports.map((airport) => (
                    <button
                      key={airport.code}
                      onClick={() => setData({...data, homeAirport: airport.city})}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        data.homeAirport === airport.city 
                          ? 'border-orange-500 bg-orange-500/20 text-orange-400' 
                          : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-lg">{airport.code}</div>
                          <div className="text-sm">{airport.name}</div>
                          <div className="text-xs text-gray-400">{airport.city}, {airport.country}</div>
                        </div>
                        <div className="text-right text-xs text-gray-400">
                          {airport.region}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {filteredAirports.length === 0 && airportQuery.length > 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No airports found for "{airportQuery}"
                  </div>
                )}
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 px-6 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!data.homeAirport}
                  className="flex-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 font-bold py-4 px-6 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Travel Style */}
          {step === 4 && (
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <Sparkles className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-4">What's your travel style?</h2>
                <p className="text-gray-300">Help us understand your flying preferences</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'frequent', title: 'Frequent Flyer', desc: 'I fly multiple times per month', icon: '✈️' },
                  { id: 'business', title: 'Business Traveler', desc: 'Mostly work-related flights', icon: '💼' },
                  { id: 'leisure', title: 'Leisure Traveler', desc: 'Vacation and personal trips', icon: '🏖️' },
                  { id: 'aviation', title: 'Aviation Enthusiast', desc: 'I love everything about flying', icon: '🛩️' },
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setData({...data, travelStyle: style.id})}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      data.travelStyle === style.id 
                        ? 'border-orange-500 bg-orange-500/20' 
                        : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">{style.icon}</span>
                      <div>
                        <div className="font-bold text-xl text-white">{style.title}</div>
                        <div className="text-gray-300">{style.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-4 px-6 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(5)}
                  disabled={!data.travelStyle}
                  className="flex-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 font-bold py-4 px-6 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Privacy */}
          {step === 5 && (
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-8">
                <Users className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-4">Who can see your flights?</h2>
                <p className="text-gray-300">You can always change this later in settings</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'public', title: 'Public', desc: 'Anyone can see your flights and stats', icon: '🌍' },
                  { id: 'friends', title: 'Friends Only', desc: 'Only people you follow can see your activity', icon: '👥' },
                  { id: 'private', title: 'Private', desc: 'Keep all your flight data private', icon: '🔒' },
                ].map((privacy) => (
                  <button
                    key={privacy.id}
                    onClick={() => setData({...data, privacyLevel: privacy.id})}
                    className={`w-full p-6 rounded-lg border-2 transition-all text-left ${
                      data.privacyLevel === privacy.id 
                        ? 'border-orange-500 bg-orange-500/20' 
                        : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">{privacy.icon}</span>
                      <div>
                        <div className="font-bold text-xl text-white">{privacy.title}</div>
                        <div className="text-gray-300">{privacy.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 py-4 px-6 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(6)}
                  className="flex-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 font-bold py-4 px-6 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Complete */}
          {step === 6 && (
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl text-center">
              <div className="text-center mb-8">
                <div className="h-16 w-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-gray-900" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">You're all set! 🎉</h2>
                <p className="text-gray-300 text-lg">Ready to start your aviation journey on Fyrspit</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Your Profile Summary</h3>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Username:</span>
                    <span className="text-white font-medium">@{data.username}</span>
                  </div>
                  {data.dateOfBirth && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Age:</span>
                      <span className="text-white font-medium">{calculateAge(data.dateOfBirth)} years old</span>
                    </div>
                  )}
                  {data.gender && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gender:</span>
                      <span className="text-white font-medium capitalize">{data.gender.replace('-', ' ')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Home Airport:</span>
                    <span className="text-white font-medium">{data.homeAirport}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Travel Style:</span>
                    <span className="text-white font-medium capitalize">{data.travelStyle.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Privacy:</span>
                    <span className="text-white font-medium capitalize">{data.privacyLevel}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(5)}
                  className="flex-1 py-4 px-6 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  className="flex-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 font-bold py-4 px-6 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>Start Flying! 🚀</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}