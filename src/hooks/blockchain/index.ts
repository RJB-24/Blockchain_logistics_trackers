
import { useState } from 'react';
import { useBlockchainVerification } from './useVerification';
import { useSmartContracts } from './useSmartContracts';
import { useSustainability } from './useSustainability';

export function useBlockchain() {
  const verification = useBlockchainVerification();
  const smartContracts = useSmartContracts();
  const sustainability = useSustainability();
  
  // Combine loading and error states
  const isLoading = verification.isLoading || smartContracts.isLoading || sustainability.isLoading;
  const error = verification.error || smartContracts.error || sustainability.error;

  // Return all functionality as a single hook
  return {
    isLoading,
    error,
    
    // Verification methods
    verifyBlockchainRecord: verification.verifyBlockchainRecord,
    registerShipment: verification.registerShipment,
    updateShipmentStatus: verification.updateShipmentStatus,
    verifyOnBlockchain: verification.verifyOnBlockchain,
    
    // Smart contract methods
    executeSmartContract: smartContracts.executeSmartContract,
    processPayment: smartContracts.processPayment,
    processClearance: smartContracts.processClearance,
    confirmDelivery: smartContracts.confirmDelivery,
    resolveDispute: smartContracts.resolveDispute,
    
    // Sustainability methods
    getCarbonCredits: sustainability.getCarbonCredits,
    generateMultiModalRoute: sustainability.generateMultiModalRoute,
    getSustainabilityRecommendations: sustainability.getSustainabilityRecommendations
  };
}

// Re-export types
export * from './types';
