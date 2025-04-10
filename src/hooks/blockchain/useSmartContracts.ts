
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SmartContractResult, DisputeDetails } from './types';

export function useSmartContracts() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Process payment automatically via smart contract
  const processPayment = async (
    shipmentId: string, 
    amount: number, 
    currency: string = 'USD'
  ): Promise<SmartContractResult | null> => {
    return executeSmartContract('payment', {
      shipmentId,
      amount,
      currency
    });
  };
  
  // Automated customs clearance
  const processClearance = async (
    shipmentId: string, 
    countryCode: string,
    documentHashes: string[]
  ): Promise<SmartContractResult | null> => {
    return executeSmartContract('customs', {
      shipmentId,
      countryCode,
      documentHashes
    });
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

  // Resolve disputes using blockchain
  const resolveDispute = async (shipmentId: string, disputeDetails: DisputeDetails): Promise<{ resolved: boolean, resolution: string } | null> => {
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

  return {
    isLoading,
    error,
    executeSmartContract,
    processPayment,
    processClearance,
    confirmDelivery,
    resolveDispute
  };
}
