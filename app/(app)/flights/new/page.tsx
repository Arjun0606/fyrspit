'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateFlightSchema, CreateFlightData } from '@/types';
import { FlightComposer } from '@/components/flight-composer';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewFlightPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateFlightData>({
    resolver: zodResolver(CreateFlightSchema),
    defaultValues: {
      visibility: 'public',
      cabinClass: 'economy',
      photos: [],
      tags: [],
      ratings: {},
    },
  });

  const handleSubmit = async (data: CreateFlightData) => {
    setIsSubmitting(true);
    try {
      // Get auth token
      const { auth } = await import('@/lib/firebase');
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      const token = await user.getIdToken();
      
      // Create flight via API
      const response = await fetch('/api/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create flight');
      }
      
      const result = await response.json();
      
      // Show success and redirect
      const { toast } = await import('react-hot-toast');
      toast.success('Flight logged successfully!');
      router.push(`/flights/${result.flightId}`);
    } catch (error: any) {
      console.error('Error creating flight:', error);
      const { toast } = await import('react-hot-toast');
      toast.error(error.message || 'Failed to create flight');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Link
          href="/feed"
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Log a Flight</h1>
      </div>

      {/* Flight Composer */}
      <FlightComposer
        form={form}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
