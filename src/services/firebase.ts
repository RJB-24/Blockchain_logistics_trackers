
// This is a Firebase service - in a real app, this would interact with Firebase
// For now, we'll create a mock service that simulates Firebase functionality

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'driver' | 'customer';
  company?: string;
  createdAt: number;
}

export interface Shipment {
  id: string;
  title: string;
  description?: string;
  origin: string;
  destination: string;
  status: 'processing' | 'in-transit' | 'delivered' | 'delayed';
  createdAt: number;
  updatedAt: number;
  plannedDepartureDate?: number;
  estimatedArrivalDate?: number;
  actualArrivalDate?: number;
  productType: string;
  quantity: number;
  weight?: number;
  carbonFootprint: number;
  transportType: 'air' | 'truck' | 'rail' | 'ship' | 'multi-modal';
  assignedDriverId?: string;
  customerId: string;
  blockchainTxHash?: string;
}

export interface SensorData {
  shipmentId: string;
  timestamp: number;
  temperature?: number;
  humidity?: number;
  shockDetected?: boolean;
  location?: { lat: number; long: number };
  batteryLevel?: number;
  blockchainTxHash?: string;
}

export interface Company {
  id: string;
  name: string;
  address: string;
  sustainabilityScore: number;
  previousScore?: number;
  carbonReductionGoal?: number;
}

// Mock currently authenticated user
let currentUser: User | null = {
  id: 'usr123',
  name: 'Demo User',
  email: 'demo@ecofreight.example.com',
  role: 'manager',
  company: 'EcoFreight Inc.',
  createdAt: Date.now() - 86400000 * 30 // 30 days ago
};

// Mock data storage
const shipments: Shipment[] = [
  {
    id: 'SH-2025-001',
    title: 'Medical Supplies',
    description: 'Temperature-controlled medical supplies',
    origin: 'New York, USA',
    destination: 'Toronto, Canada',
    status: 'in-transit',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000,
    plannedDepartureDate: Date.now() - 86400000,
    estimatedArrivalDate: Date.now() + 86400000 * 2,
    productType: 'Medical',
    quantity: 250,
    weight: 450,
    carbonFootprint: 35,
    transportType: 'truck',
    customerId: 'cust456',
    blockchainTxHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  },
  {
    id: 'SH-2025-002',
    title: 'Electronics Batch',
    description: 'Consumer electronics shipment',
    origin: 'Shenzhen, China',
    destination: 'Los Angeles, USA',
    status: 'processing',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 1,
    plannedDepartureDate: Date.now() + 86400000,
    estimatedArrivalDate: Date.now() + 86400000 * 15,
    productType: 'Electronics',
    quantity: 1000,
    weight: 2500,
    carbonFootprint: 68,
    transportType: 'ship',
    customerId: 'cust789',
    blockchainTxHash: '0x2345678901abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  },
  {
    id: 'SH-2025-003',
    title: 'Food Products',
    description: 'Refrigerated food products',
    origin: 'Miami, USA',
    destination: 'Atlanta, USA',
    status: 'delayed',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 3600000 * 2,
    plannedDepartureDate: Date.now() - 86400000 * 1,
    estimatedArrivalDate: Date.now() + 86400000 * 1,
    productType: 'Food',
    quantity: 500,
    weight: 1200,
    carbonFootprint: 25,
    transportType: 'truck',
    assignedDriverId: 'drv567',
    customerId: 'cust123',
    blockchainTxHash: '0x3456789012abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  }
];

const sensorDataStore: SensorData[] = [];
// Generate some mock sensor data
for (const shipment of shipments) {
  const dataPointCount = Math.floor(Math.random() * 20) + 10;
  
  for (let i = 0; i < dataPointCount; i++) {
    const timeOffset = Math.floor(Math.random() * 86400000 * 3); // Up to 3 days of data
    
    sensorDataStore.push({
      shipmentId: shipment.id,
      timestamp: Date.now() - timeOffset,
      temperature: Math.round((Math.random() * 10 + 2) * 10) / 10, // 2°C to 12°C
      humidity: Math.round(Math.random() * 50 + 30), // 30% to 80%
      shockDetected: Math.random() > 0.9, // 10% chance of shock
      location: {
        lat: Math.random() * 10 + 35, // Random coordinates
        long: Math.random() * 10 - 80
      },
      batteryLevel: Math.round(Math.random() * 100),
      blockchainTxHash: `0x${Array.from({ length: 64 }).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`
    });
  }
}

// Firebase service mock
export const firebaseService = {
  // Auth methods
  auth: {
    getCurrentUser: async (): Promise<User | null> => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return currentUser;
    },
    
    signIn: async (email: string, password: string): Promise<User> => {
      // This is a mock - in a real app, we would authenticate with Firebase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'demo@ecofreight.example.com' && password === 'password') {
        currentUser = {
          id: 'usr123',
          name: 'Demo User',
          email,
          role: 'manager',
          company: 'EcoFreight Inc.',
          createdAt: Date.now() - 86400000 * 30
        };
        return currentUser;
      }
      
      throw new Error('Invalid email or password');
    },
    
    signOut: async (): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      currentUser = null;
    },
    
    signUp: async (email: string, password: string, name: string): Promise<User> => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: `usr${Date.now()}`,
        name,
        email,
        role: 'customer', // Default role for new users
        createdAt: Date.now()
      };
      
      currentUser = newUser;
      return newUser;
    }
  },
  
  // Firestore methods
  firestore: {
    // Shipment methods
    getShipments: async (): Promise<Shipment[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [...shipments]; // Return a copy to avoid reference issues
    },
    
    getShipmentById: async (id: string): Promise<Shipment | null> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return shipments.find(s => s.id === id) || null;
    },
    
    createShipment: async (data: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shipment> => {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newShipment: Shipment = {
        ...data,
        id: `SH-${new Date().getFullYear()}-${String(shipments.length + 1).padStart(3, '0')}`,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      shipments.push(newShipment);
      return newShipment;
    },
    
    updateShipment: async (id: string, data: Partial<Shipment>): Promise<Shipment> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const index = shipments.findIndex(s => s.id === id);
      if (index === -1) throw new Error(`Shipment ${id} not found`);
      
      shipments[index] = {
        ...shipments[index],
        ...data,
        updatedAt: Date.now()
      };
      
      return shipments[index];
    },
    
    // Sensor data methods
    getSensorData: async (shipmentId: string): Promise<SensorData[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return sensorDataStore.filter(data => data.shipmentId === shipmentId);
    },
    
    addSensorData: async (data: Omit<SensorData, 'timestamp'>): Promise<SensorData> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newData: SensorData = {
        ...data,
        timestamp: Date.now()
      };
      
      sensorDataStore.push(newData);
      return newData;
    },
    
    // Company methods
    getCompany: async (id: string): Promise<Company | null> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock company data
      if (id === 'ecofreight') {
        return {
          id: 'ecofreight',
          name: 'EcoFreight Inc.',
          address: '123 Sustainability Ave, Green City, 10001',
          sustainabilityScore: 72,
          previousScore: 65,
          carbonReductionGoal: 50
        };
      }
      
      return null;
    }
  }
};

export default firebaseService;
