import Link from 'next/link';
import { Plane, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <Plane className="h-24 w-24 text-orange-500 mx-auto mb-4 animate-bounce" />
          <h1 className="text-6xl font-bold text-white mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-300 mb-2">Flight Not Found</h2>
          <p className="text-gray-400 mb-8">
            Looks like this page took an unexpected flight path. 
            Let's get you back on course.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/"
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            <Home className="h-5 w-5" />
            <span>Return Home</span>
          </Link>
          
          <Link 
            href="/feed"
            className="btn-secondary w-full flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Feed</span>
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Need help? <Link href="/support" className="text-orange-400 hover:text-orange-300">Contact Support</Link></p>
        </div>
      </div>
    </div>
  );
}
