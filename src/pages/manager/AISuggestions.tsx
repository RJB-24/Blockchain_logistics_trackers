
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Sparkles, Loader2, Check, X } from 'lucide-react';

interface AISuggestion {
  id: string;
  title: string;
  description: string;
  carbon_savings: number | null;
  cost_savings: number | null;
  created_at: string;
  implemented: boolean;
  shipment_id: string | null;
}

const AISuggestions = () => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('ai_suggestions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      toast.error('Failed to load AI suggestions');
    } finally {
      setLoading(false);
    }
  };

  const implementSuggestion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_suggestions')
        .update({ implemented: true })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setSuggestions(suggestions.map(suggestion => 
        suggestion.id === id ? { ...suggestion, implemented: true } : suggestion
      ));
      
      toast.success('Suggestion marked as implemented');
    } catch (error) {
      console.error('Error implementing suggestion:', error);
      toast.error('Failed to implement suggestion');
    }
  };

  const dismissSuggestion = async (id: string) => {
    try {
      // Instead of deleting, we could add a 'dismissed' field
      const { error } = await supabase
        .from('ai_suggestions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setSuggestions(suggestions.filter(suggestion => suggestion.id !== id));
      
      toast.success('Suggestion dismissed');
    } catch (error) {
      console.error('Error dismissing suggestion:', error);
      toast.error('Failed to dismiss suggestion');
    }
  };

  const requestNewSuggestion = async () => {
    toast.info('Generating new AI suggestions...');
    
    try {
      // Call the sustainability-ai Edge Function to generate new suggestions
      const { data, error } = await supabase.functions.invoke('sustainability-ai', {
        body: { action: 'generate_suggestions' }
      });
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success('New suggestions generated!');
        // Refresh the suggestions list
        fetchSuggestions();
      } else {
        throw new Error('Failed to generate suggestions');
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate new suggestions');
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-eco-dark">AI Sustainability Suggestions</h1>
            <p className="text-muted-foreground">Smart recommendations to reduce emissions and costs</p>
          </div>
          <Button className="bg-eco-purple hover:bg-eco-purple/90" onClick={requestNewSuggestion}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate New Suggestions
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-eco-purple" />
          </div>
        ) : suggestions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No AI suggestions available. Click "Generate New Suggestions".</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id} className={suggestion.implemented ? 'border-eco-green' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                    {suggestion.implemented && (
                      <Badge className="bg-eco-green">Implemented</Badge>
                    )}
                  </div>
                  <CardDescription>{new Date(suggestion.created_at).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{suggestion.description}</p>
                  
                  <div className="flex flex-wrap gap-4 mb-4">
                    {suggestion.carbon_savings && (
                      <div className="bg-eco-light rounded-md p-2">
                        <span className="text-sm font-medium text-eco-dark">Carbon Savings:</span>
                        <p className="text-eco-green font-bold">{suggestion.carbon_savings} kg CO₂</p>
                      </div>
                    )}
                    
                    {suggestion.cost_savings && (
                      <div className="bg-eco-light rounded-md p-2">
                        <span className="text-sm font-medium text-eco-dark">Cost Savings:</span>
                        <p className="text-eco-purple font-bold">${suggestion.cost_savings.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                  
                  {!suggestion.implemented && (
                    <div className="flex justify-end gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => dismissSuggestion(suggestion.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Dismiss
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-eco-green hover:bg-eco-green/90"
                        onClick={() => implementSuggestion(suggestion.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Implement
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AISuggestions;
