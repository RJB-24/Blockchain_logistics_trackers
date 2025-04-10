
import { Transaction } from './types';
import { emissionFactors, createMockTransaction } from './mockUtils';

// Calculate carbon footprint based on transport method and distance
export const calculateCarbonFootprint = (transportType: string, distanceKm: number): number => {
  const factor = emissionFactors[transportType.toLowerCase()] || emissionFactors.truck;
  return Math.round(factor * distanceKm * 100) / 100; // kg CO2
};

// Issue carbon credits
export const issueCarbonCredits = async (shipmentId: string, carbonSaved: number): Promise<Transaction> => {
  const tx = createMockTransaction({ 
    shipmentId, 
    carbonSaved, 
    operation: 'carbon-credits-issuance' 
  });

  console.log(`Issuing carbon credits for shipment ${shipmentId}: ${carbonSaved} kg CO2 saved`);
  console.log('Transaction:', tx);

  return tx;
};
