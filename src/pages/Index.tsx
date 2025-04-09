
import { TruckIcon, PackageIcon, AlertTriangle, Leaf, ArrowUpRight } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import StatCard from '@/components/dashboard/StatCard';
import ShipmentStatusCard from '@/components/dashboard/ShipmentStatusCard';
import MapView from '@/components/dashboard/MapView';
import BlockchainTransactionList from '@/components/dashboard/BlockchainTransactionList';
import CarbonFootprintChart from '@/components/sustainability/CarbonFootprintChart';
import SustainabilityScore from '@/components/sustainability/SustainabilityScore';
import { Button } from '@/components/ui/button';

// Mock data for active shipments
const activeShipments = [
  {
    id: 'SH-2025-001',
    title: 'Medical Supplies',
    origin: 'New York, USA',
    destination: 'Toronto, Canada',
    status: 'in-transit' as const,
    eta: 'Apr 11, 2025',
    carbonFootprint: 35,
  },
  {
    id: 'SH-2025-002',
    title: 'Electronics Batch',
    origin: 'Shenzhen, China',
    destination: 'Los Angeles, USA',
    status: 'processing' as const,
    eta: 'Apr 15, 2025',
    carbonFootprint: 68,
  },
  {
    id: 'SH-2025-003',
    title: 'Food Products',
    origin: 'Miami, USA',
    destination: 'Atlanta, USA',
    status: 'delayed' as const,
    eta: 'Apr 12, 2025',
    carbonFootprint: 25,
  },
];

const Dashboard = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to EcoFreight Ledger</p>
          </div>
          <Button className="mt-4 sm:mt-0 bg-eco-purple hover:bg-eco-purple/90">
            <ArrowUpRight className="mr-2 h-4 w-4" /> New Shipment
          </Button>
        </div>

        {/* Sustainability score and stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="md:col-span-1 flex justify-center">
            <SustainabilityScore score={72} previousScore={65} size="lg" />
          </div>
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard 
              title="Active Shipments" 
              value={32} 
              icon={<TruckIcon className="h-6 w-6 text-eco-dark" />} 
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard 
              title="Warehouse Inventory" 
              value="4,281 units" 
              icon={<PackageIcon className="h-6 w-6 text-eco-dark" />} 
              trend={{ value: 8, isPositive: true }}
            />
            <StatCard 
              title="Carbon Reduction" 
              value="28%" 
              icon={<Leaf className="h-6 w-6 text-eco-purple" />} 
              trend={{ value: 5, isPositive: true }}
            />
          </div>
        </div>

        {/* Map and transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <MapView />
          </div>
          <div className="lg:col-span-1">
            <BlockchainTransactionList />
          </div>
        </div>

        {/* Active shipments */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Active Shipments</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {activeShipments.map(shipment => (
              <ShipmentStatusCard key={shipment.id} shipment={shipment} />
            ))}
          </div>
        </div>

        {/* Carbon footprint section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Sustainability Insights</h2>
          <CarbonFootprintChart />
        </div>

        {/* AI Suggestions */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">AI Recommendations</h2>
          <div className="eco-card p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-eco-purple/10 p-3 rounded-full">
                <Leaf className="h-6 w-6 text-eco-purple" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Sustainability Opportunities</h3>
                <ul className="mt-3 space-y-3">
                  <li className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Switch to rail for Los Angeles shipments</p>
                      <p className="text-sm text-muted-foreground">Switching from air freight to rail can reduce carbon emissions by up to 75% for your LA route.</p>
                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full mr-2">
                          -52% CO₂
                        </span>
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          +$1,200 savings
                        </span>
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Consolidate Atlanta shipments</p>
                      <p className="text-sm text-muted-foreground">You have 3 half-empty trucks going to Atlanta next week. Consolidating could save fuel and reduce emissions.</p>
                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full mr-2">
                          -28% CO₂
                        </span>
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          +$800 savings
                        </span>
                      </div>
                    </div>
                  </li>
                </ul>
                <Button className="mt-4 bg-eco-purple hover:bg-eco-purple/90">View All Recommendations</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
