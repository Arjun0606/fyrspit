'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Flight, Comment } from '@/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FlightCard } from '@/components/flight-card';
import { 
  MessageCircle, 
  Send, 
  Heart, 
  Share, 
  ArrowLeft,
  MoreHorizontal 
} from 'lucide-react';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils';

export default function FlightDetailPage() {
  const [user] = useAuthState(auth);
  const params = useParams();
  const flightId = params.id as string;
  
  const [flight, setFlight] = useState<Flight | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const fetchFlightDetail = async () => {
      try {
        // Fetch flight details
        const flightResponse = await fetch(`/api/flights/${flightId}`);
        if (flightResponse.ok) {
          const flightData = await flightResponse.json();
          setFlight({
            ...flightData.flight,
            createdAt: new Date(flightData.flight.createdAt),
            editedAt: flightData.flight.editedAt ? new Date(flightData.flight.editedAt) : undefined,
          });
        }

        // TODO: Fetch comments
        // const commentsResponse = await fetch(`/api/flights/${flightId}/comments`);
        // if (commentsResponse.ok) {
        //   const commentsData = await commentsResponse.json();
        //   setComments(commentsData.comments);
        // }
      } catch (error) {
        console.error('Error fetching flight details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (flightId) {
      fetchFlightDetail();
    }
  }, [flightId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    setCommenting(true);
    try {
      const token = await user.getIdToken();
      
      // TODO: Implement comment API
      console.log('Submitting comment:', commentText);
      
      setCommentText('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setCommenting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Flight not found</h1>
          <p className="text-gray-400 mb-6">This flight doesn't exist or you don't have permission to view it.</p>
          <Link href="/feed" className="btn-primary">
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

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
        <h1 className="text-xl font-bold">Flight Details</h1>
      </div>

      {/* Flight Card */}
      <div className="mb-8">
        <FlightCard flight={flight} showUserInfo={true} />
      </div>

      {/* Detailed Review */}
      {flight.reviewLong && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-3">Full Review</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {flight.reviewLong}
            </p>
          </div>
        </div>
      )}

      {/* Photo Gallery */}
      {flight.photos && flight.photos.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-3">Photos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flight.photos.map((photo, index) => (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                <img
                  src={photo}
                  alt={`Flight photo ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <span>Comments ({comments.length})</span>
        </h2>

        {/* Comment Form */}
        {user && (
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="flex space-x-3">
              <div className="h-8 w-8 bg-gray-700 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="input w-full h-20 resize-none"
                  placeholder="Share your thoughts about this flight..."
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {commentText.length}/500
                  </span>
                  <button
                    type="submit"
                    disabled={!commentText.trim() || commenting}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>{commenting ? 'Posting...' : 'Post'}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <h3 className="font-medium text-gray-400 mb-1">No comments yet</h3>
            <p className="text-sm text-gray-500">
              Be the first to share your thoughts about this flight!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CommentCard({ comment }: { comment: Comment }) {
  return (
    <div className="flex space-x-3 p-3 bg-gray-800/50 rounded-lg">
      <div className="h-8 w-8 bg-gray-700 rounded-full flex-shrink-0"></div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-medium text-white">User {comment.userId.slice(0, 8)}</span>
          <span className="text-xs text-gray-500">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">
          {comment.body}
        </p>
      </div>
      <button className="p-1 hover:bg-gray-700 rounded transition-colors">
        <MoreHorizontal className="h-4 w-4 text-gray-400" />
      </button>
    </div>
  );
}
