
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BlockchainVerifyResult {
  verified: boolean;
  blockNumber: number;
  timestamp: string;
  from: string;
  to: string;
  gasUsed: number;
  status: string;
}

interface ShipmentBlockchainData {
  id?: string;
  shipmentId?: string;
  transportType: string;
  distanceKm?: number;
  carbonFootprint?: number;
  origin?: string;
  destination?: string;
  rating?: number;
  userId?: string;
  sustainabilityScore?: number;
}

interface BlockchainRecordResult {
  success: boolean;
  transactionHash: string;
  blockchainRecord: {
    shipmentId: string;
    timestamp: string;
    carbonFootprint?: number;
    transportType?: string;
    status?: string;
    verified: boolean;
  };
}

interface SmartContractResult {
  success: boolean;
  transactionHash: string;
  contractAddress?: string;
  eventEmitted?: string;
  data?: any;
}

export function useBlockchain() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyBlockchainRecord = async (hash: string): Promise<BlockchainVerifyResult | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('blockchain-verify', {
        body: { operation: 'verify', hash }
      });
      
      if (error) throw error;
      return data as BlockchainVerifyResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Blockchain verification error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const registerShipment = async (shipmentData: ShipmentBlockchainData): Promise<BlockchainRecordResult | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('blockchain-verify', {
        body: { operation: 'register', shipmentData }
      });
      
      if (error) throw error;
      return data as BlockchainRecordResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Blockchain registration error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateShipmentStatus = async (shipmentId: string, status: string): Promise<BlockchainRecordResult | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('blockchain-verify', {
        body: { operation: 'update', shipmentId, status }
      });
      
      if (error) throw error;
      return data as BlockchainRecordResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Blockchain update error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Add the verifyOnBlockchain method that was missing
  const verifyOnBlockchain = async (data: ShipmentBlockchainData): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await registerShipment(data);
      if (!result || !result.success) {
        throw new Error('Blockchain verification failed');
      }
      return result.transactionHash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Blockchain verification error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Execute smart contract for payment, customs, or delivery confirmation
  const executeSmartContract = async (contractType: 'payment' | 'customs' | 'delivery', payload: any): Promise<SmartContractResult | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('blockchain-verify', {
        body: { operation: 'execute-contract', contractType, payload }
      });
      
      if (error) throw error;
      return data as SmartContractResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Smart contract execution error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

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

  // Resolve disputes using blockchain
  const resolveDispute = async (shipmentId: string, disputeDetails: any): Promise<{ resolved: boolean, resolution: string } | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('blockchain-verify', {
        body: { operation: 'resolve-dispute', shipmentId, disputeDetails }
      });
      
      if (error) throw error;
      return data as { resolved: boolean, resolution: string };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Dispute resolution error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate multi-modal route optimization
  const generateMultiModalRoute = async (
    origin: string, 
    destination: string, 
    transportPreferences: string[],
    optimizationCriteria: 'time' | 'cost' | 'carbon' = 'carbon'
  ): Promise<any | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('sustainability-ai', {
        body: { 
          action: 'optimize_route', 
          routeParams: {
            origin,
            destination,
            transportType: transportPreferences.includes('multi-modal') ? 'multi-modal' : transportPreferences[0],
            optimizationCriteria
          }
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
  ): Promise<any | null> => {
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
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Sustainability recommendations error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process payment automatically via smart contract
  const processPayment = async (
    shipmentId: string, 
    amount: number, 
    currency: string = 'USD'
  ): Promise<SmartContractResult | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('blockchain-verify', {
        body: { 
          operation: 'execute-contract', 
          contractType: 'payment', 
          payload: {
            shipmentId,
            amount,
            currency
          }
        }
      });
      
      if (error) throw error;
      return data as SmartContractResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Payment processing error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Automated customs clearance
  const processClearance = async (
    shipmentId: string, 
    countryCode: string,
    documentHashes: string[]
  ): Promise<SmartContractResult | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('blockchain-verify', {
        body: { 
          operation: 'execute-contract', 
          contractType: 'customs', 
          payload: {
            shipmentId,
            countryCode,
            documentHashes
          }
        }
      });
      
      if (error) throw error;
      return data as SmartContractResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Customs clearance error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Confirm delivery and trigger relevant smart contracts
  const confirmDelivery = async (
    shipmentId: string,
    recipientSignature: string,
    deliveryNotes: string
  ): Promise<SmartContractResult | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First update the shipment status to delivered
      await updateShipmentStatus(shipmentId, 'delivered');
      
      // Then execute the delivery confirmation smart contract
      const { data, error } = await supabase.functions.invoke('blockchain-verify', {
        body: { 
          operation: 'execute-contract', 
          contractType: 'delivery', 
          payload: {
            shipmentId,
            recipientSignature,
            deliveryNotes,
            deliveryTime: new Date().toISOString()
          }
        }
      });
      
      if (error) throw error;
      return data as SmartContractResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Delivery confirmation error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    verifyBlockchainRecord,
    registerShipment,
    updateShipmentStatus,
    verifyOnBlockchain,
    executeSmartContract,
    getCarbonCredits,
    resolveDispute,
    generateMultiModalRoute,
    getSustainabilityRecommendations,
    processPayment,
    processClearance,
    confirmDelivery
  };
}
