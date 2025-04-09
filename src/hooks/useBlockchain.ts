
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

  return {
    isLoading,
    error,
    verifyBlockchainRecord,
    registerShipment,
    updateShipmentStatus,
    verifyOnBlockchain
  };
}
