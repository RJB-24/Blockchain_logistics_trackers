
import { Transaction } from './types';

// Mock blockchain address
export const MOCK_WALLET_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

// Generate a random transaction hash
export const generateTransactionHash = (): string => {
  return '0x' + Array.from({ length: 64 })
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');
};

// Carbon emission factors (gCO2/km)
export const emissionFactors: Record<string, number> = {
  air: 0.82,
  truck: 0.092,
  rail: 0.022,
  ship: 0.015
};

// Create a mock transaction
export const createMockTransaction = (
  data: any,
  status: 'pending' | 'confirmed' | 'failed' = 'confirmed'
): Transaction => {
  return {
    hash: generateTransactionHash(),
    blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
    from: MOCK_WALLET_ADDRESS,
    to: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72', // Mock contract address
    data: JSON.stringify(data),
    timestamp: Date.now(),
    status
  };
};
