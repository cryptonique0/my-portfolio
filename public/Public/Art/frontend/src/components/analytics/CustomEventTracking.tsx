import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { analyticsDataService } from "../../services/analytics-data.service";

interface CustomEventTrackingProps {
  eventName: string;
  dateRange?: { startDate: string; endDate: string };
}

const CustomEventTracking: React.FC<CustomEventTrackingProps> = ({ eventName, dateRange }) => {
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await analyticsDataService.getEventAnalytics(eventName, dateRange);
      setEventData(data);
      setLoading(false);
    };

    fetchData();
  }, [eventName, dateRange]);

  if (loading) {
    return <div className="p-4 text-center">Loading event data...</div>;
  }

  // Sample data structure (would come from backend)
  const chartData = [
    { date: 'Mon', count: 120, uniqueUsers: 90 },
    { date: 'Tue', count: 150, uniqueUsers: 110 },
    { date: 'Wed', count: 130, uniqueUsers: 95 },
    { date: 'Thu', count: 180, uniqueUsers: 140 },
    { date: 'Fri', count: 200, uniqueUsers: 160 },
    { date: 'Sat', count: 220, uniqueUsers: 175 },
    { date: 'Sun', count: 190, uniqueUsers: 145 },
  ];

  return (
    <div className="space-y-4">
      {/* Event Stats */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-bold mb-4">📊 Event: {eventName}</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-xs text-gray-600">Total Events</p>
            <p className="text-2xl font-bold">1,245</p>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <p className="text-xs text-gray-600">Unique Users</p>
            <p className="text-2xl font-bold">892</p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <p className="text-xs text-gray-600">Conversion Rate</p>
            <p className="text-2xl font-bold">35.2%</p>
          </div>
          <div className="bg-orange-50 p-4 rounded">
            <p className="text-xs text-gray-600">Avg per User</p>
            <p className="text-2xl font-bold">1.4</p>
          </div>
        </div>
      </div>

      {/* Event Trend Chart */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-bold mb-4">📈 Event Trend</h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.1}
              name="Event Count"
            />
            <Area
              type="monotone"
              dataKey="uniqueUsers"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.1}
              name="Unique Users"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Event Properties */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-bold mb-4">🏷️ Top Event Properties</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-sm">Property: Device Type</span>
            <span className="text-sm font-bold text-gray-700">Desktop (65%), Mobile (35%)</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-sm">Property: Traffic Source</span>
            <span className="text-sm font-bold text-gray-700">Direct (45%), Organic (40%), Referral (15%)</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-sm">Property: Geographic</span>
            <span className="text-sm font-bold text-gray-700">US (50%), EU (30%), Other (20%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomEventTracking;
