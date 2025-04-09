
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBlockchain } from '@/hooks/useBlockchain';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Star, CheckCircle2, Leaf, AlertTriangle, Truck, Package } from 'lucide-react';

// Define the shipment interface
interface Shipment {
  id: string;
  title: string;
  tracking_id: string;
  status: string;
  origin: string;
  destination: string;
  customer_id: string;
  transport_type: string;
  carbon_footprint: number;
  created_at: string;
  estimated_arrival_date: string;
}

// Define the interface for blockchain data
interface ShipmentBlockchainData {
  shipmentId: string;
  rating: number;
  userId: string;
  transportType: string;
}

const LeaveReview = () => {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState<boolean>(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { verifyOnBlockchain } = useBlockchain();

  useEffect(() => {
    if (!shipmentId) return;
    
    const fetchShipment = async () => {
      try {
        setLoading(true);
        
        // Fetch the shipment details
        const { data: shipmentData, error: shipmentError } = await supabase
          .from('shipments')
          .select('*')
          .eq('id', shipmentId)
          .single();
        
        if (shipmentError) throw shipmentError;
        
        if (!shipmentData) {
          setError("Shipment not found");
          return;
        }
        
        // Check if the shipment belongs to the current user
        if (shipmentData.customer_id !== user?.id) {
          setError("You are not authorized to review this shipment");
          return;
        }
        
        // Check if the shipment has been delivered
        if (shipmentData.status !== 'delivered') {
          setError("You can only review shipments that have been delivered");
          return;
        }
        
        setShipment(shipmentData);
        
        // Check if user has already reviewed this shipment
        const { data: reviewData, error: reviewError } = await supabase
          .from('reviews')
          .select('*')
          .eq('shipment_id', shipmentId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (reviewError) throw reviewError;
        
        if (reviewData) {
          setAlreadyReviewed(true);
          setRating(reviewData.rating);
          setComment(reviewData.comment || '');
        }
        
      } catch (err: any) {
        console.error('Error fetching shipment:', err);
        setError(err.message || 'Failed to load shipment details');
        toast.error('Failed to load shipment details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchShipment();
  }, [shipmentId, user?.id]);

  const handleSubmitReview = async () => {
    if (!shipment || !user) return;
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Check if we're updating an existing review
      if (alreadyReviewed) {
        const { error } = await supabase
          .from('reviews')
          .update({
            rating,
            comment,
          })
          .eq('shipment_id', shipmentId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        toast.success('Your review has been updated');
      } else {
        // Create a new review
        const { data, error } = await supabase
          .from('reviews')
          .insert({
            shipment_id: shipmentId,
            user_id: user.id,
            rating,
            comment,
            approved: false, // Reviews need manager approval first
          });
        
        if (error) throw error;
        
        // Verify the review on blockchain
        const blockchainData: ShipmentBlockchainData = {
          shipmentId: shipment.id,
          rating,
          userId: user.id,
          transportType: shipment.transport_type
        };
        
        try {
          const txHash = await verifyOnBlockchain(blockchainData);
          
          // Update the review with the blockchain transaction hash
          if (txHash) {
            await supabase
              .from('reviews')
              .update({ blockchain_tx_hash: txHash })
              .eq('shipment_id', shipmentId)
              .eq('user_id', user.id);
          }
        } catch (blockchainError) {
          console.error('Blockchain verification failed, but review was submitted:', blockchainError);
        }
        
        toast.success('Your review has been submitted and is pending approval');
      }
      
      // Navigate back to dashboard after success
      setTimeout(() => {
        navigate('/customer');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error submitting review:', err);
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-eco-purple border-t-transparent rounded-full"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTriangle />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => navigate('/customer')}>Back to Dashboard</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-eco-dark">Leave a Review</h1>
          <p className="text-muted-foreground">Share your experience with this shipment</p>
        </div>
        
        {shipment && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5 text-eco-purple" />
                  Review for {shipment.title}
                </CardTitle>
                <CardDescription>
                  Tracking ID: {shipment.tracking_id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Your Rating</h3>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          onClick={() => setRating(value)}
                          className={`h-8 w-8 cursor-pointer ${
                            value <= rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Your Comments (Optional)</h3>
                    <Textarea
                      placeholder="Share your experience with this shipment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={5}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button
                      onClick={handleSubmitReview}
                      disabled={submitting || rating === 0}
                      className="bg-eco-purple hover:bg-eco-purple/90 w-full"
                    >
                      {submitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                          {alreadyReviewed ? 'Updating Review...' : 'Submitting Review...'}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          {alreadyReviewed ? 'Update Review' : 'Submit Review'}
                        </div>
                      )}
                    </Button>
                    
                    {alreadyReviewed && (
                      <p className="text-center text-sm mt-2 text-muted-foreground">
                        You've already reviewed this shipment. Submitting will update your review.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Shipment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">From</p>
                    <p>{shipment.origin}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">To</p>
                    <p>{shipment.destination}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Transport Type</p>
                    <div className="flex items-center">
                      {shipment.transport_type === 'truck' ? (
                        <Truck className="mr-1 h-4 w-4" />
                      ) : shipment.transport_type === 'ship' ? (
                        <Ship className="mr-1 h-4 w-4" />
                      ) : shipment.transport_type === 'rail' ? (
                        <Train className="mr-1 h-4 w-4" />
                      ) : (
                        <Truck className="mr-1 h-4 w-4" />
                      )}
                      {shipment.transport_type.charAt(0).toUpperCase() + shipment.transport_type.slice(1)}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Carbon Footprint</p>
                    <div className="flex items-center">
                      <Leaf className="mr-1 h-4 w-4 text-green-500" />
                      <span>{shipment.carbon_footprint} kg CO₂</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge className="bg-green-500">Delivered</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LeaveReview;
