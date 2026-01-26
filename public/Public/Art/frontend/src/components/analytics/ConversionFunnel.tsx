import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, FunnelChart, Funnel, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { analyticsDataService } from "../../services/analytics-data.service";

interface ConversionFunnelProps {
  dateRange?: { startDate: string; endDate: string };
}

const ConversionFunnel: React.FC<ConversionFunnelProps> = ({ dateRange }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const funnel = await analyticsDataService.getConversionFunnel(dateRange);
      
      // Transform data for funnel chart
      const transformedData = funnel.map(step => ({
        name: step.step,
        value: step.users,
        fill: getColorByStep(step.step),
      }));
      
      setData(transformedData);
      setLoading(false);
    };

    fetchData();
  }, [dateRange]);

  const getColorByStep = (step: string): string => {
    const colors: Record<string, string> = {
      'Browse': '#3b82f6',
      'View': '#8b5cf6',
      'Offer': '#ec4899',
      'Purchase': '#10b981',
      'Wishlist': '#f59e0b'
    };
    return colors[step] || '#6b7280';
  };

  if (loading) {
    return <div className="p-4 text-center">Loading conversion funnel...</div>;
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-bold mb-4">🎯 Conversion Funnel</h3>
      
      <ResponsiveContainer width="100%" height={400}>
        <FunnelChart>
          <Tooltip 
            formatter={(value) => `${value} users`}
            contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}
          />
          <Funnel dataKey="value" data={data} margin={{ top: 20, right: 160, bottom: 20, left: 20 }}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>

      {/* Funnel Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map((step, index) => {
          const conversionRate = index === 0 ? 100 : ((step.value / data[0].value) * 100).toFixed(1);
          return (
            <div key={step.name} className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-600">{step.name}</p>
              <p className="text-lg font-bold">{step.value}</p>
              <p className="text-xs text-gray-500">{conversionRate}% conversion</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversionFunnel;
