
import { ShipmentRecord, SensorReading, Transaction } from './types';
import { MOCK_WALLET_ADDRESS, generateTransactionHash, createMockTransaction } from './mockUtils';

// Create a new shipment record on the blockchain
export const createShipment = async (shipment: Omit<ShipmentRecord, 'transactionHash' | 'timestamps' | 'sensorData'>): Promise<Transaction> => {
  // Simulate blockchain transaction
  const tx = createMockTransaction(shipment);

  // In a real app, we would wait for transaction confirmation
  console.log('Creating shipment on blockchain:', shipment);
  console.log('Transaction:', tx);

  return tx;
};

// Update shipment status
export const updateShipmentStatus = async (shipmentId: string, status: 'in-transit' | 'delivered'): Promise<Transaction> => {
  const tx = createMockTransaction({ shipmentId, status });

  console.log(`Updating shipment ${shipmentId} status to ${status}`);
  console.log('Transaction:', tx);

  return tx;
};

// Add sensor data for a shipment
export const addSensorData = async (shipmentId: string, reading: Omit<SensorReading, 'transactionHash'>): Promise<Transaction> => {
  const tx = createMockTransaction({ shipmentId, reading });

  console.log(`Adding sensor data for shipment ${shipmentId}:`, reading);
  console.log('Transaction:', tx);

  return tx;
};

// Get shipment information from the blockchain
export const getShipment = async (shipmentId: string): Promise<ShipmentRecord | null> => {
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
};
