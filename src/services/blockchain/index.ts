
import { MOCK_WALLET_ADDRESS } from './mockUtils';
import { getShipment, createShipment, updateShipmentStatus, addSensorData } from './shipmentOperations';
import { getRecentTransactions } from './transactionHistory';
import { calculateCarbonFootprint, issueCarbonCredits } from './sustainabilityOperations';
import { executeCustomsClearance, executePaymentRelease, createDisputeResolution } from './smartContracts';

// Export all functionality from a single entry point
export const blockchainService = {
  // Wallet
  getWalletAddress: async () => MOCK_WALLET_ADDRESS,
  
  // Shipment operations
  createShipment,
  updateShipmentStatus,
  addSensorData,
  getShipment,
  
  // Transaction history
  getRecentTransactions,
  
  // Sustainability operations
  calculateCarbonFootprint,
  issueCarbonCredits,
  
  // Smart contracts
  executeCustomsClearance,
  executePaymentRelease,
  createDisputeResolution
};

// Also export types
export * from './types';

export default blockchainService;
