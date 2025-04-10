
import { emissionFactors, fuelConsumptionRates } from './constants';

// Calculate carbon footprint for a route
export const calculateCarbonFootprint = (
  distance: number, 
  mode: 'truck' | 'ship' | 'rail' | 'air', 
  weightTons: number = 1
): number => {
  const emissionFactor = emissionFactors[mode] || emissionFactors.truck;
  // Calculate emissions in kg of CO2
  return (distance * emissionFactor * weightTons) / 1000;
};

// Calculate fuel consumption for a route
export const calculateFuelConsumption = (
  distance: number, 
  mode: 'truck' | 'ship' | 'rail' | 'air'
): number => {
  const consumptionRate = fuelConsumptionRates[mode] || fuelConsumptionRates.truck;
  return distance * consumptionRate;
};
