
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useBlockchain } from '@/hooks/useBlockchain';
import { 
  MessageSquare, 
  Package, 
  Star, 
  Truck, 
  CalendarCheck, 
  LocateFixed,
  ArrowLeft,
  Loader2
} from 'lucide-react';

interface Shipment {
  id: string;
  title: string;
  tracking_id: string;
  origin: string;
  destination: string;
  status: string;
  transport_type: string;
  created_at: string;
  actual_arrival_date: string | null;
}

const LeaveReview = () => {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { registerShipment, isLoading: blockchainLoading } = useBlockchain();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [existingReview, setExistingReview] = useState<any>(null);

  useEffect(() => {
    if (shipmentId && user) {
      fetchShipmentData();
      checkExistingReview();
    }
  }, [shipmentId, user]);

  const fetchShipmentData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('id', shipmentId)
        .single();
      
      if (error) throw error;
      
      setShipment(data);
    } catch (error) {
      console.error('Error fetching shipment:', error);
      toast.error('Failed to load shipment data');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingReview = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('shipment_id', shipmentId)
        .eq('user_id', user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned" error
      
      if (data) {
        setExistingReview(data);
        setRating(data.rating);
        setComment(data.comment || '');
      }
    } catch (error) {
      console.error('Error checking for existing review:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!shipmentId || !user || rating === 0) {
      toast.error('Please select a rating before submitting');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // First, register the review on blockchain
      const blockchainData = {
        shipmentId,
        rating,
        userId: user.id
      };
      
      const blockchainResult = await registerShipment(blockchainData);
      
      const reviewData = {
        shipment_id: shipmentId,
        user_id: user.id,
        rating,
        comment: comment.trim() || null,
        blockchain_tx_hash: blockchainResult?.transactionHash || null
      };
      
      let result;
      if (existingReview) {
        // Update existing review
        const { data, error } = await supabase
          .from('reviews')
          .update(reviewData)
          .eq('id', existingReview.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Create new review
        const { data, error } = await supabase
          .from('reviews')
          .insert(reviewData)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }
      
      toast.success(existingReview ? 'Review updated successfully' : 'Review submitted successfully');
      setExistingReview(result);
      
      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate('/customer');
      }, 2000);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500';
      case 'in-transit':
        return 'bg-amber-500';
      case 'processing':
        return 'bg-blue-500';
      case 'delayed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-eco-purple" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!shipment) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Shipment Not Found</h2>
                <p className="text-muted-foreground mb-4">
                  The shipment you're looking for doesn't exist or you don't have permission to view it.
                </p>
                <Button onClick={handleBackClick} variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBackClick}
            className="mr-2 p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-eco-dark">Leave a Review</h1>
            <p className="text-muted-foreground">Share your feedback about the shipment</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-eco-purple" />
                Your Review
              </CardTitle>
              <CardDescription>
                Rate your experience with this shipment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  <div className="flex items-center space-x-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= (hoverRating || rating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {rating === 0 ? 'Select a rating' : `Your rating: ${rating} stars`}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="comment" className="block text-sm font-medium">
                    Your Comments (Optional)
                  </label>
                  <Textarea
                    id="comment"
                    placeholder="Share your experience with this shipment..."
                    rows={5}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                
                {existingReview && existingReview.blockchain_tx_hash && (
                  <div className="bg-eco-light p-4 rounded-md">
                    <div className="flex items-start">
                      <div className="mr-3 mt-1">
                        <Shield className="h-5 w-5 text-eco-purple" />
                      </div>
                      <div>
                        <h4 className="font-medium text-eco-dark">Blockchain Verified</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your review has been recorded on the blockchain for verification.
                        </p>
                        <p className="text-xs mt-1 text-eco-purple break-all">
                          {existingReview.blockchain_tx_hash}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <Button 
                  className="w-full bg-eco-purple hover:bg-eco-purple/90"
                  onClick={handleSubmitReview}
                  disabled={submitting || blockchainLoading || rating === 0}
                >
                  {submitting || blockchainLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {existingReview ? 'Updating...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {existingReview ? 'Update Review' : 'Submit Review'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5 text-eco-purple" />
                Shipment Details
              </CardTitle>
              <CardDescription>
                {shipment.tracking_id}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{shipment.title}</h3>
                  
                  <div className="flex items-center mt-2">
                    <Badge className={getStatusColor(shipment.status)}>
                      {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
                    </Badge>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {new Date(shipment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center mb-2">
                    <Truck className="h-4 w-4 mr-1" />
                    Transport Details
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Transport Type:</span>
                      <span className="text-sm font-medium capitalize">{shipment.transport_type}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <LocateFixed className="h-4 w-4 text-eco-purple mx-1" />
                      <span className="text-sm truncate">{shipment.origin}</span>
                      <ArrowRight className="h-3 w-3 mx-1" />
                      <LocateFixed className="h-4 w-4 text-eco-purple mx-1" />
                      <span className="text-sm truncate">{shipment.destination}</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center mb-2">
                    <CalendarCheck className="h-4 w-4 mr-1" />
                    Delivery Information
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Delivery Status:</span>
                      <Badge className={getStatusColor(shipment.status)}>
                        {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
                      </Badge>
                    </div>
                    
                    {shipment.actual_arrival_date && (
                      <div className="flex justify-between">
                        <span className="text-sm">Delivered On:</span>
                        <span className="text-sm font-medium">
                          {new Date(shipment.actual_arrival_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/shipment/${shipment.id}`)}
              >
                <Package className="mr-2 h-4 w-4" />
                View Full Details
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Add missing components
const ArrowRight = () => (
  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const Shield = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export default LeaveReview;
