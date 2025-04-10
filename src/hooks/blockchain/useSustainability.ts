
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OptimizationParams, SustainabilityRecommendation } from './types';

export function useSustainability() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get carbon credit tokens for sustainable practices
  const getCarbonCredits = async (shipmentId: string, sustainabilityScore: number): Promise<{ success: boolean, tokens: number } | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('blockchain-verify', {
        body: { operation: 'carbon-credits', shipmentId, sustainabilityScore }
      });
      
      if (error) throw error;
      return data as { success: boolean, tokens: number };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Carbon credits error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate multi-modal route optimization
  const generateMultiModalRoute = async (params: OptimizationParams): Promise<any | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('sustainability-ai', {
        body: { 
          action: 'optimize_route', 
          routeParams: params
        }
      });
      
      if (error) throw error;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Route optimization error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate AI sustainability recommendations
  const getSustainabilityRecommendations = async (
    shipmentId: string
  ): Promise<SustainabilityRecommendation[] | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('sustainability-ai', {
        body: { 
          action: 'generate_suggestions', 
          shipmentId
        }
      });
      
      if (error) throw error;
      return data.suggestions as SustainabilityRecommendation[];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Sustainability recommendations error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    getCarbonCredits,
    generateMultiModalRoute,
    getSustainabilityRecommendations
  };
}
