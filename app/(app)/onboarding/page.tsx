'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { UpdateProfileSchema, UpdateProfileData } from '@/types';
import { AirportAutocomplete } from '@/components/forms/airport-autocomplete';
import { 
  User, 
  MapPin, 
  Upload, 
  ArrowRight, 
  CheckCircle,
  Plane
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function OnboardingPage() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateProfileData>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: user?.displayName || '',
      bio: '',
      homeAirportIata: '',
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const watchedValues = watch();

  const steps = [
    {
      id: 1,
      title: 'Welcome to Fyrspit!',
      description: 'Let\'s set up your profile to get started.',
    },
    {
      id: 2,
      title: 'Tell us about yourself',
      description: 'This helps other aviation enthusiasts find and connect with you.',
    },
    {
      id: 3,
      title: 'All set!',
      description: 'You\'re ready to start logging flights and connecting with the community.',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    router.push('/feed');
  };

  const handleFinish = async (data: UpdateProfileData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...data,
        onboardingCompleted: true,
      });
      
      toast.success('Profile updated successfully!');
      router.push('/feed');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Step {currentStep} of {steps.length}</span>
            <span className="text-sm text-gray-400">{Math.round((currentStep / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="card">
          {currentStep === 1 && (
            <div className="text-center">
              <div className="h-16 w-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2">{steps[0].title}</h1>
              <p className="text-gray-400 mb-6">{steps[0].description}</p>
              
              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                  <Plane className="h-5 w-5 text-teal-500" />
                  <div>
                    <h3 className="font-medium">Log Your Flights</h3>
                    <p className="text-sm text-gray-400">Track every journey with photos and reviews</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                  <User className="h-5 w-5 text-teal-500" />
                  <div>
                    <h3 className="font-medium">Connect & Discover</h3>
                    <p className="text-sm text-gray-400">Follow aviation enthusiasts and share experiences</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-teal-500" />
                  <div>
                    <h3 className="font-medium">Earn Achievements</h3>
                    <p className="text-sm text-gray-400">Collect badges and climb leaderboards</p>
                  </div>
                </div>
              </div>
              
              <button onClick={handleNext} className="btn-primary w-full mt-6">
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h1 className="text-2xl font-bold mb-2 text-center">{steps[1].title}</h1>
              <p className="text-gray-400 mb-6 text-center">{steps[1].description}</p>
              
              <form onSubmit={handleSubmit(handleFinish)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Display Name
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className="input w-full"
                    placeholder="How should others see your name?"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    {...register('bio')}
                    className="input w-full h-20 resize-none"
                    placeholder="Tell us about your aviation interests..."
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-400">{errors.bio.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Home Airport
                  </label>
                  <AirportAutocomplete
                    value={watchedValues.homeAirportIata}
                    onChange={(value) => setValue('homeAirportIata', value)}
                    placeholder="Where do you usually fly from?"
                  />
                  {errors.homeAirportIata && (
                    <p className="mt-1 text-sm text-red-400">{errors.homeAirportIata.message}</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="btn-secondary flex-1"
                    disabled={isSubmitting}
                  >
                    Skip for now
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Continue'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center">
              <div className="h-16 w-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2">{steps[2].title}</h1>
              <p className="text-gray-400 mb-6">{steps[2].description}</p>
              
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <h3 className="font-medium mb-2">What's next?</h3>
                <ul className="text-sm text-gray-400 space-y-1 text-left">
                  <li>• Log your first flight to start building your profile</li>
                  <li>• Import past flights from CSV files or other apps</li>
                  <li>• Follow other aviation enthusiasts</li>
                  <li>• Explore airports and airlines</li>
                </ul>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push('/import')}
                  className="btn-secondary flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Flights
                </button>
                <button
                  onClick={() => router.push('/flights/new')}
                  className="btn-primary flex-1"
                >
                  <Plane className="h-4 w-4 mr-2" />
                  Log First Flight
                </button>
              </div>
              
              <button
                onClick={() => router.push('/feed')}
                className="text-gray-400 hover:text-white transition-colors mt-4 text-sm"
              >
                I'll do this later
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
