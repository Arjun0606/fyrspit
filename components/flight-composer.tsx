'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CreateFlightData, CabinClass, Visibility } from '@/types';
import { AirportAutocomplete } from '@/components/forms/airport-autocomplete';
import { AirlineAutocomplete } from '@/components/forms/airline-autocomplete';
import { RatingStars } from '@/components/forms/rating-stars';
import { PhotoUploader } from '@/components/forms/photo-uploader';
import { TagInput } from '@/components/forms/tag-input';
import { 
  Plane, 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  Camera, 
  Tag, 
  Eye, 
  EyeOff, 
  Users, 
  Lock 
} from 'lucide-react';

interface FlightComposerProps {
  form: UseFormReturn<CreateFlightData>;
  onSubmit: (data: CreateFlightData) => Promise<void>;
  isSubmitting: boolean;
}

export function FlightComposer({ form, onSubmit, isSubmitting }: FlightComposerProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const watchedValues = watch();

  const visibilityOptions: { value: Visibility; label: string; icon: React.ReactNode; description: string }[] = [
    { 
      value: 'public', 
      label: 'Public', 
      icon: <Eye className="h-4 w-4" />, 
      description: 'Anyone can see this flight' 
    },
    { 
      value: 'friends', 
      label: 'Friends', 
      icon: <Users className="h-4 w-4" />, 
      description: 'Only people you follow can see this' 
    },
    { 
      value: 'private', 
      label: 'Private', 
      icon: <Lock className="h-4 w-4" />, 
      description: 'Only you can see this flight' 
    },
  ];

  const cabinClassOptions: { value: CabinClass; label: string }[] = [
    { value: 'economy', label: 'Economy' },
    { value: 'premium', label: 'Premium Economy' },
    { value: 'business', label: 'Business' },
    { value: 'first', label: 'First Class' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Route Section */}
      <section className="card">
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="h-5 w-5 text-teal-500" />
          <h2 className="text-lg font-semibold">Route</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              From Airport *
            </label>
            <AirportAutocomplete
              value={watchedValues.fromIata}
              onChange={(value) => setValue('fromIata', value)}
              placeholder="Search departure airport..."
            />
            {errors.fromIata && (
              <p className="mt-1 text-sm text-red-400">{errors.fromIata.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              To Airport *
            </label>
            <AirportAutocomplete
              value={watchedValues.toIata}
              onChange={(value) => setValue('toIata', value)}
              placeholder="Search arrival airport..."
            />
            {errors.toIata && (
              <p className="mt-1 text-sm text-red-400">{errors.toIata.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* Flight Details Section */}
      <section className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Plane className="h-5 w-5 text-teal-500" />
          <h2 className="text-lg font-semibold">Flight Details</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Airline *
            </label>
            <AirlineAutocomplete
              value={watchedValues.airlineCode}
              onChange={(value) => setValue('airlineCode', value)}
              placeholder="Search airline..."
            />
            {errors.airlineCode && (
              <p className="mt-1 text-sm text-red-400">{errors.airlineCode.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Flight Number
            </label>
            <input
              {...register('flightNumber')}
              type="text"
              className="input w-full"
              placeholder="e.g. 1234"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Date *
            </label>
            <input
              {...register('date')}
              type="date"
              className="input w-full"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-400">{errors.date.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Departure Time
            </label>
            <input
              {...register('departureTime')}
              type="time"
              className="input w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Arrival Time
            </label>
            <input
              {...register('arrivalTime')}
              type="time"
              className="input w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Aircraft
            </label>
            <input
              {...register('aircraftCode')}
              type="text"
              className="input w-full"
              placeholder="e.g. A320, B737"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Seat
            </label>
            <input
              {...register('seat')}
              type="text"
              className="input w-full"
              placeholder="e.g. 12A, 7F"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Cabin Class
            </label>
            <select
              {...register('cabinClass')}
              className="input w-full"
            >
              {cabinClassOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Ratings Section */}
      <section className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Star className="h-5 w-5 text-teal-500" />
          <h2 className="text-lg font-semibold">Ratings</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RatingStars
            label="Airline"
            value={watchedValues.ratings?.airline}
            onChange={(value) => setValue('ratings.airline', value)}
          />
          <RatingStars
            label="Aircraft"
            value={watchedValues.ratings?.aircraft}
            onChange={(value) => setValue('ratings.aircraft', value)}
          />
          <RatingStars
            label="Departure Airport"
            value={watchedValues.ratings?.airportFrom}
            onChange={(value) => setValue('ratings.airportFrom', value)}
          />
          <RatingStars
            label="Arrival Airport"
            value={watchedValues.ratings?.airportTo}
            onChange={(value) => setValue('ratings.airportTo', value)}
          />
          <RatingStars
            label="Crew"
            value={watchedValues.ratings?.crew}
            onChange={(value) => setValue('ratings.crew', value)}
          />
          <RatingStars
            label="Food & Beverage"
            value={watchedValues.ratings?.food}
            onChange={(value) => setValue('ratings.food', value)}
          />
        </div>
      </section>

      {/* Review Section */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-4">Your Review</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Quick Review *
            </label>
            <textarea
              {...register('reviewShort')}
              className="input w-full h-20 resize-none"
              placeholder="Share your experience in a few words..."
            />
            {errors.reviewShort && (
              <p className="mt-1 text-sm text-red-400">{errors.reviewShort.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Detailed Review
            </label>
            <textarea
              {...register('reviewLong')}
              className="input w-full h-32 resize-none"
              placeholder="Tell us more about your flight experience..."
            />
          </div>
        </div>
      </section>

      {/* Photos Section */}
      <section className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Camera className="h-5 w-5 text-teal-500" />
          <h2 className="text-lg font-semibold">Photos</h2>
        </div>
        
        <PhotoUploader
          photos={watchedValues.photos || []}
          onChange={(photos) => setValue('photos', photos)}
          maxPhotos={6}
        />
      </section>

      {/* Tags Section */}
      <section className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Tag className="h-5 w-5 text-teal-500" />
          <h2 className="text-lg font-semibold">Tags</h2>
        </div>
        
        <TagInput
          tags={watchedValues.tags || []}
          onChange={(tags) => setValue('tags', tags)}
          placeholder="Add tags to help others discover your flight..."
        />
      </section>

      {/* Visibility Section */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-4">Privacy</h2>
        
        <div className="space-y-2">
          {visibilityOptions.map(({ value, label, icon, description }) => (
            <label
              key={value}
              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                watchedValues.visibility === value
                  ? 'border-teal-500 bg-teal-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <input
                {...register('visibility')}
                type="radio"
                value={value}
                className="sr-only"
              />
              <div className={`${watchedValues.visibility === value ? 'text-teal-500' : 'text-gray-400'}`}>
                {icon}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${watchedValues.visibility === value ? 'text-white' : 'text-gray-300'}`}>
                  {label}
                </p>
                <p className="text-sm text-gray-400">{description}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="btn-secondary"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Publishing...' : 'Publish Flight'}
        </button>
      </div>
    </form>
  );
}
