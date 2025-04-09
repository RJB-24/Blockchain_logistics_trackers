
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { StarIcon, CheckCircle, XCircle, MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Review {
  id: string;
  shipment_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  approved: boolean;
  blockchain_tx_hash: string | null;
  shipment: {
    title: string;
    tracking_id: string;
  };
  profile: {
    full_name: string;
    avatar_url: string | null;
  };
}

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const { getProfileById } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          shipment:shipment_id (title, tracking_id)
        `)
        .eq(filter === 'pending' ? 'approved' : 'approved', filter === 'pending' ? false : true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch user profiles for each review
      const reviewsWithProfiles = await Promise.all((data || []).map(async (review) => {
        const profile = await getProfileById(review.user_id);
        return {
          ...review,
          profile: {
            full_name: profile?.full_name || 'Unknown User',
            avatar_url: profile?.avatar_url || null
          }
        };
      }));
      
      setReviews(reviewsWithProfiles);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const approveReview = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ approved: true })
        .eq('id', id);
      
      if (error) throw error;
      
      if (filter === 'pending') {
        // Remove from list if viewing pending
        setReviews(reviews.filter(review => review.id !== id));
      } else {
        // Update the approval status
        setReviews(reviews.map(review => 
          review.id === id ? { ...review, approved: true } : review
        ));
      }
      
      toast.success('Review approved successfully');
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('Failed to approve review');
    }
  };

  const deleteReview = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Remove from list
      setReviews(reviews.filter(review => review.id !== id));
      toast.success('Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <StarIcon
          key={index}
          className={`h-4 w-4 ${
            index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      ));
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-eco-dark">Reviews Management</h1>
            <p className="text-muted-foreground">Manage customer reviews for shipments</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-eco-purple" />
              Customer Reviews
            </CardTitle>
            <CardDescription>
              {filter === 'pending' ? 'Pending approval' : 'Approved reviews'}
            </CardDescription>
            
            <Tabs value={filter} onValueChange={setFilter} className="mt-2">
              <TabsList>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-eco-purple" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No {filter} reviews to display.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4 border rounded-lg">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-start">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={review.profile.avatar_url || undefined} />
                            <AvatarFallback className="bg-eco-purple text-white">
                              {review.profile.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium">{review.profile.full_name}</h3>
                              <span className="mx-2 text-muted-foreground">•</span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex mt-1 mb-2">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                        </div>
                        
                        <p className="mt-2">{review.comment || '(No comment provided)'}</p>
                        
                        <div className="mt-3 flex items-center">
                          <Badge variant="outline">
                            Shipment: {review.shipment.tracking_id}
                          </Badge>
                          <span className="mx-2 text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">
                            {review.shipment.title}
                          </span>
                        </div>
                        
                        {review.blockchain_tx_hash && (
                          <div className="mt-2">
                            <Badge className="bg-eco-purple">Blockchain Verified</Badge>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex md:flex-col gap-2 justify-end">
                        {filter === 'pending' && (
                          <Button 
                            variant="default"
                            size="sm"
                            className="bg-eco-green hover:bg-eco-green/90"
                            onClick={() => approveReview(review.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        <Button 
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-500 hover:bg-red-50"
                          onClick={() => deleteReview(review.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ReviewsManagement;
