
// Types for blockchain service
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
