
// This is a mock blockchain service that simulates interactions with Ethereum
// In a real application, this would use ethers.js or web3.js to interact with the blockchain

// Types
export interface Transaction {
  hash: string;
  blockNumber?: number;
  from: string;
  to: string;
  data: string;
  timestamp: number; // Unix timestamp
  status: 'pending' | 'confirmed' | 'failed';
}

export interface ShipmentRecord {
  id: string;
  owner: string;
  origin: string;
  destination: string;
  productType: string;
  quantity: number;
  carbonFootprint: number;
  status: 'created' | 'in-transit' | 'delivered';
  timestamps: {
    created: number;
    inTransit?: number;
    delivered?: number;
  };
  sensorData: SensorReading[];
  transactionHash: string;
}

export interface SensorReading {
  timestamp: number;
  temperature?: number;
  humidity?: number;
  shockDetected?: boolean;
  location?: { lat: number; long: number };
  transactionHash: string;
}

// Mock blockchain address
const MOCK_WALLET_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

// Generate a random transaction hash
const generateTransactionHash = (): string => {
  return '0x' + Array.from({ length: 64 })
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');
};

// Mock blockchain methods
export const blockchainService = {
  // Get wallet address (in a real app, this would connect to MetaMask or similar)
  getWalletAddress: async (): Promise<string> => {
    return MOCK_WALLET_ADDRESS;
  },

  // Create a new shipment record on the blockchain
  createShipment: async (shipment: Omit<ShipmentRecord, 'transactionHash' | 'timestamps' | 'sensorData'>): Promise<Transaction> => {
    // Simulate blockchain transaction
    const txHash = generateTransactionHash();
    const tx: Transaction = {
      hash: txHash,
      blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
      from: MOCK_WALLET_ADDRESS,
      to: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72', // Mock contract address
      data: JSON.stringify(shipment),
      timestamp: Date.now(),
      status: 'confirmed'
    };

    // In a real app, we would wait for transaction confirmation
    console.log('Creating shipment on blockchain:', shipment);
    console.log('Transaction:', tx);

    return tx;
  },

  // Update shipment status
  updateShipmentStatus: async (shipmentId: string, status: 'in-transit' | 'delivered'): Promise<Transaction> => {
    const txHash = generateTransactionHash();
    const tx: Transaction = {
      hash: txHash,
      from: MOCK_WALLET_ADDRESS,
      to: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72', // Mock contract address
      data: JSON.stringify({ shipmentId, status }),
      timestamp: Date.now(),
      status: 'confirmed'
    };

    console.log(`Updating shipment ${shipmentId} status to ${status}`);
    console.log('Transaction:', tx);

    return tx;
  },

  // Add sensor data for a shipment
  addSensorData: async (shipmentId: string, reading: Omit<SensorReading, 'transactionHash'>): Promise<Transaction> => {
    const txHash = generateTransactionHash();
    const tx: Transaction = {
      hash: txHash,
      from: MOCK_WALLET_ADDRESS,
      to: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72',
      data: JSON.stringify({ shipmentId, reading }),
      timestamp: Date.now(),
      status: 'confirmed'
    };

    console.log(`Adding sensor data for shipment ${shipmentId}:`, reading);
    console.log('Transaction:', tx);

    return tx;
  },

  // Get shipment information from the blockchain
  getShipment: async (shipmentId: string): Promise<ShipmentRecord | null> => {
    // This would call a smart contract's view function in a real app
    console.log(`Getting shipment ${shipmentId} from blockchain`);
    
    // Mock data for demonstration
    if (shipmentId === 'SH-2025-001') {
      return {
        id: 'SH-2025-001',
        owner: MOCK_WALLET_ADDRESS,
        origin: 'New York, USA',
        destination: 'Toronto, Canada',
        productType: 'Medical Supplies',
        quantity: 250,
        carbonFootprint: 35,
        status: 'in-transit',
        timestamps: {
          created: Date.now() - 86400000 * 2, // 2 days ago
          inTransit: Date.now() - 86400000, // 1 day ago
        },
        sensorData: [
          {
            timestamp: Date.now() - 3600000 * 2,
            temperature: 4.2,
            humidity: 45,
            location: { lat: 40.7128, long: -74.006 },
            transactionHash: generateTransactionHash()
          },
          {
            timestamp: Date.now() - 3600000,
            temperature: 4.5,
            humidity: 47,
            location: { lat: 41.2033, long: -73.9185 },
            transactionHash: generateTransactionHash()
          }
        ],
        transactionHash: generateTransactionHash()
      };
    }
    
    return null;
  },

  // Get recent transactions
  getRecentTransactions: async (limit: number = 5): Promise<Transaction[]> => {
    // In a real app, this would query the blockchain or a blockchain explorer API
    console.log(`Getting recent ${limit} transactions`);
    
    // Mock data
    return Array.from({ length: limit }).map((_, i) => ({
      hash: generateTransactionHash(),
      blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
      from: MOCK_WALLET_ADDRESS,
      to: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72',
      data: JSON.stringify({ event: `Mock Transaction ${i + 1}` }),
      timestamp: Date.now() - i * 3600000, // Each transaction 1 hour older
      status: Math.random() > 0.2 ? 'confirmed' : 'pending'
    }));
  },

  // Calculate carbon footprint based on transport method and distance
  calculateCarbonFootprint: (transportType: string, distanceKm: number): number => {
    // Carbon emission factors (gCO2/km)
    const emissionFactors: Record<string, number> = {
      air: 0.82,
      truck: 0.092,
      rail: 0.022,
      ship: 0.015
    };

    const factor = emissionFactors[transportType.toLowerCase()] || emissionFactors.truck;
    return Math.round(factor * distanceKm * 100) / 100; // kg CO2
  },
  
  // Execute smart contract for customs clearance
  executeCustomsClearance: async (shipmentId: string, countryCode: string, documents: string[]): Promise<Transaction> => {
    const txHash = generateTransactionHash();
    const tx: Transaction = {
      hash: txHash,
      blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
      from: MOCK_WALLET_ADDRESS,
      to: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72', // Mock contract address
      data: JSON.stringify({ shipmentId, countryCode, documents, operation: 'customs-clearance' }),
      timestamp: Date.now(),
      status: 'confirmed'
    };

    console.log(`Executing customs clearance for shipment ${shipmentId}`);
    console.log('Transaction:', tx);

    return tx;
  },
  
  // Execute smart contract for payment release
  executePaymentRelease: async (shipmentId: string, amount: number, currency: string): Promise<Transaction> => {
    const txHash = generateTransactionHash();
    const tx: Transaction = {
      hash: txHash,
      blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
      from: MOCK_WALLET_ADDRESS,
      to: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72', // Mock contract address
      data: JSON.stringify({ shipmentId, amount, currency, operation: 'payment-release' }),
      timestamp: Date.now(),
      status: 'confirmed'
    };

    console.log(`Releasing payment for shipment ${shipmentId}: ${amount} ${currency}`);
    console.log('Transaction:', tx);

    return tx;
  },
  
  // Issue carbon credits
  issueCarbonCredits: async (shipmentId: string, carbonSaved: number): Promise<Transaction> => {
    const txHash = generateTransactionHash();
    const tx: Transaction = {
      hash: txHash,
      blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
      from: MOCK_WALLET_ADDRESS,
      to: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72', // Mock contract address
      data: JSON.stringify({ shipmentId, carbonSaved, operation: 'carbon-credits-issuance' }),
      timestamp: Date.now(),
      status: 'confirmed'
    };

    console.log(`Issuing carbon credits for shipment ${shipmentId}: ${carbonSaved} kg CO2 saved`);
    console.log('Transaction:', tx);

    return tx;
  },
  
  // Create smart contract for dispute resolution
  createDisputeResolution: async (shipmentId: string, issue: string, partyA: string, partyB: string): Promise<Transaction> => {
    const txHash = generateTransactionHash();
    const tx: Transaction = {
      hash: txHash,
      blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
      from: MOCK_WALLET_ADDRESS,
      to: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72', // Mock contract address
      data: JSON.stringify({ shipmentId, issue, partyA, partyB, operation: 'dispute-resolution' }),
      timestamp: Date.now(),
      status: 'confirmed'
    };

    console.log(`Creating dispute resolution contract for shipment ${shipmentId}`);
    console.log('Transaction:', tx);

    return tx;
  }
};

export default blockchainService;
