
import { Transaction } from './types';
import { createMockTransaction } from './mockUtils';

// Get recent transactions
export const getRecentTransactions = async (limit: number = 5): Promise<Transaction[]> => {
  // In a real app, this would query the blockchain or a blockchain explorer API
  console.log(`Getting recent ${limit} transactions`);
  
  // Mock data
  return Array.from({ length: limit }).map((_, i) => ({
    hash: createMockTransaction({ event: `Mock Transaction ${i + 1}` }).hash,
    blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
    from: createMockTransaction({}).from,
    to: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72',
    data: JSON.stringify({ event: `Mock Transaction ${i + 1}` }),
    timestamp: Date.now() - i * 3600000, // Each transaction 1 hour older
    status: Math.random() > 0.2 ? 'confirmed' : 'pending'
  }));
};
