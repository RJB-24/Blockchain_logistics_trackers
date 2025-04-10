
// Types for blockchain operations
export interface BlockchainVerifyResult {
  verified: boolean;
  blockNumber: number;
  timestamp: string;
  from: string;
  to: string;
  gasUsed: number;
  status: string;
}

export interface ShipmentBlockchainData {
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

export interface BlockchainRecordResult {
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

export interface SmartContractResult {
  success: boolean;
  transactionHash: string;
  contractAddress?: string;
  eventEmitted?: string;
  data?: any;
}

export interface DisputeDetails {
  reason: string;
  evidence: string;
  claimAmount?: number;
}

export interface TransportPreference {
  mode: 'truck' | 'ship' | 'rail' | 'air' | 'multi-modal';
  priority: number;
}

export interface CarbonCreditResult {
  success: boolean;
  tokens: number;
  transactionHash?: string;
}

export interface DisputeResolutionResult {
  resolved: boolean;
  resolution: string;
  transactionHash?: string;
}

export interface OptimizationParams {
  origin: string;
  destination: string;
  transportType: string;
  optimizationCriteria: 'time' | 'cost' | 'carbon';
}

export interface SustainabilityRecommendation {
  id: string;
  title: string;
  description: string;
  potentialSavings: {
    carbon: number;
    cost: number;
    time: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  implementationSteps: string[];
}
