
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CarbonFootprintChartProps {
  data: { month: string; carbon: number }[];
}

const CarbonFootprintChart: React.FC<CarbonFootprintChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis unit=" kg" />
        <Tooltip 
          formatter={(value) => [`${value} kg CO₂`, 'Carbon Footprint']}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Legend />
        <Bar dataKey="carbon" name="Carbon Footprint (kg CO₂)" fill="#6f61ef" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CarbonFootprintChart;
