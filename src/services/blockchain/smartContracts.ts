
import { Transaction } from './types';
import { createMockTransaction } from './mockUtils';

// Execute smart contract for customs clearance
export const executeCustomsClearance = async (
  shipmentId: string, 
  countryCode: string, 
  documents: string[]
): Promise<Transaction> => {
  const tx = createMockTransaction({ 
    shipmentId, 
    countryCode, 
    documents, 
    operation: 'customs-clearance' 
  });

  console.log(`Executing customs clearance for shipment ${shipmentId}`);
  console.log('Transaction:', tx);

  return tx;
};

// Execute smart contract for payment release
export const executePaymentRelease = async (
  shipmentId: string, 
  amount: number, 
  currency: string
): Promise<Transaction> => {
  const tx = createMockTransaction({ 
    shipmentId, 
    amount, 
    currency, 
    operation: 'payment-release' 
  });

  console.log(`Releasing payment for shipment ${shipmentId}: ${amount} ${currency}`);
  console.log('Transaction:', tx);

  return tx;
};

// Create smart contract for dispute resolution
export const createDisputeResolution = async (
  shipmentId: string, 
  issue: string, 
  partyA: string, 
  partyB: string
): Promise<Transaction> => {
  const tx = createMockTransaction({ 
    shipmentId, 
    issue, 
    partyA, 
    partyB, 
    operation: 'dispute-resolution' 
  });

  console.log(`Creating dispute resolution contract for shipment ${shipmentId}`);
  console.log('Transaction:', tx);

  return tx;
};
