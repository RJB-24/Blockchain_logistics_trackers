
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Mock data for carbon emissions by transport type
const transportEmissionsData = [
  { type: 'Air', actual: 130, optimized: 95, unit: 'kg CO₂' },
  { type: 'Truck', actual: 90, optimized: 50, unit: 'kg CO₂' },
  { type: 'Rail', actual: 30, optimized: 25, unit: 'kg CO₂' },
  { type: 'Ship', actual: 40, optimized: 35, unit: 'kg CO₂' },
];

const CarbonFootprintChart = () => {
  return (
    <div className="eco-card p-4">
      <h3 className="font-medium mb-4">Carbon Emissions By Transport Type</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={transportEmissionsData}
            margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f2f4d5" />
            <XAxis dataKey="type" />
            <YAxis label={{ value: 'kg CO₂', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #f2f4d5',
                borderRadius: '0.375rem' 
              }}
              formatter={(value, name) => [`${value} kg CO₂`, name === 'actual' ? 'Current' : 'Optimized']}
            />
            <Legend formatter={(value) => value === 'actual' ? 'Current Emissions' : 'Optimized Emissions'} />
            <Bar dataKey="actual" fill="#3b431e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="optimized" fill="#6f61ef" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Optimized routes can reduce emissions by up to 40% depending on transport type.
      </p>
    </div>
  );
};

export default CarbonFootprintChart;
