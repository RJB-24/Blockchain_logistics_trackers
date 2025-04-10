
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Calculate carbon footprint for a shipment based on transport type, distance and weight
export const calculateCarbonFootprint = async (
  transportType: 'truck' | 'ship' | 'rail' | 'air',
  distanceKm: number,
  weightTons: number = 1
): Promise<{ 
  carbonFootprint: number; 
  verified: boolean; 
  transactionHash?: string; 
}> => {
  try {
    // Emission factors (g CO2 per ton-km)
    const emissionFactors = {
      truck: 62,
      ship: 8,
      rail: 22,
      air: 602
    };

    // Calculate total emissions in kg CO2
    const carbonFootprint = (distanceKm * emissionFactors[transportType] * weightTons) / 1000;

    // Verify calculation on blockchain
    const { data, error } = await supabase.functions.invoke('blockchain-verify', {
      body: {
        operation: 'register',
        shipmentData: {
          transportType,
          distanceKm,
          carbonFootprint,
          timestamp: new Date().toISOString()
        }
      }
    });

    if (error) throw error;

    return {
      carbonFootprint,
      verified: data.success,
      transactionHash: data.transactionHash
    };
  } catch (error) {
    console.error('Error calculating carbon footprint:', error);
    toast.error('Failed to calculate carbon footprint');
    return {
      carbonFootprint: 0,
      verified: false
    };
  }
};

// Issue carbon credits based on sustainability metrics
export const issueCarbonCredits = async (
  shipmentId: string,
  carbonSaved: number,
  sustainabilityScore: number
): Promise<{ 
  success: boolean; 
  creditsIssued?: number; 
  transactionHash?: string; 
}> => {
  try {
    // Call blockchain-verify edge function to issue tokens
    const { data, error } = await supabase.functions.invoke('blockchain-verify', {
      body: {
        operation: 'carbon-credits',
        shipmentId,
        sustainabilityScore
      }
    });

    if (error) throw error;

    if (!data.success) {
      throw new Error('Failed to issue carbon credits');
    }

    // Record the credits in the database
    await supabase.from('shipment_events').insert({
      shipment_id: shipmentId,
      event_type: 'carbon_credits_issued',
      data: {
        carbonSaved,
        sustainabilityScore,
        creditsIssued: data.tokens,
        transactionHash: data.transactionHash
      },
      blockchain_tx_hash: data.transactionHash
    });

    toast.success(`${data.tokens} carbon credits issued for sustainable shipping`);
    return {
      success: true,
      creditsIssued: data.tokens,
      transactionHash: data.transactionHash
    };
  } catch (error) {
    console.error('Error issuing carbon credits:', error);
    toast.error('Failed to issue carbon credits');
    return {
      success: false
    };
  }
};

// Get sustainability analytics for a specific time period
export const getSustainabilityAnalytics = async (
  startDate: Date,
  endDate: Date = new Date()
): Promise<{ 
  totalCarbonFootprint: number; 
  totalCarbonSaved: number; 
  transportModeBreakdown: Record<string, number>; 
  sustainabilityScore: number; 
}> => {
  try {
    // Query the supply-chain-management edge function for analytics
    const { data, error } = await supabase.functions.invoke('supply-chain-management', {
      body: {
        action: 'query_supply_chain',
        query: {
          type: 'carbon_footprint',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      }
    });

    if (error) throw error;

    if (!data.success) {
      throw new Error('Failed to get sustainability analytics');
    }

    // Calculate overall sustainability score (0-100)
    const maxFootprint = Object.values(data.results.byTransportType).reduce((sum: number, value: number) => sum + value, 0) * 2;
    const sustainabilityScore = Math.min(100, Math.round((1 - (data.results.totalFootprint / maxFootprint)) * 100));

    return {
      totalCarbonFootprint: data.results.totalFootprint,
      totalCarbonSaved: data.results.totalFootprint * 0.3, // Estimated savings compared to industry average
      transportModeBreakdown: data.results.byTransportType,
      sustainabilityScore
    };
  } catch (error) {
    console.error('Error getting sustainability analytics:', error);
    toast.error('Failed to load sustainability analytics');
    return {
      totalCarbonFootprint: 0,
      totalCarbonSaved: 0,
      transportModeBreakdown: {},
      sustainabilityScore: 0
    };
  }
};

// Get AI-generated sustainability recommendations
export const getSustainabilityRecommendations = async (
  shipmentId: string
): Promise<{ 
  recommendations: Array<{
    title: string;
    description: string;
    impact: string;
    potentialSavings: {
      carbon: number;
      cost: number;
    };
  }>
}> => {
  try {
    // Call the sustainability-ai edge function for recommendations
    const { data, error } = await supabase.functions.invoke('sustainability-ai', {
      body: {
        action: 'generate_suggestions',
        shipmentId
      }
    });

    if (error) throw error;

    return {
      recommendations: data.suggestions || []
    };
  } catch (error) {
    console.error('Error getting sustainability recommendations:', error);
    toast.error('Failed to load sustainability recommendations');
    return {
      recommendations: []
    };
  }
};
