import React, { useEffect, useState } from 'react';
import {
  Sankey, Sink, Source, Node, Link, Tooltip, ResponsiveContainer
} from 'recharts';
import { analyticsDataService } from "../../services/analytics-data.service";

interface UserBehaviorAnalysisProps {
  timeframe?: 'today' | 'week' | 'month';
}

const UserBehaviorAnalysis: React.FC<UserBehaviorAnalysisProps> = ({ timeframe = 'week' }) => {
  const [userFlow, setUserFlow] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [flowData, behaviorData] = await Promise.all([
        analyticsDataService.getUserFlow(),
        analyticsDataService.getUserBehavior(timeframe)
      ]);

      setUserFlow(flowData);
      
      // Calculate metrics
      const avgSessionDuration = behaviorData.length > 0
        ? (behaviorData.reduce((sum, u) => sum + u.avgSessionDuration, 0) / behaviorData.length).toFixed(0)
        : 0;
      
      const avgRetention = behaviorData.length > 0
        ? ((behaviorData.filter(u => u.sessionsCount > 1).length / behaviorData.length) * 100).toFixed(1)
        : 0;

      setMetrics({
        totalUsers: behaviorData.length,
        avgSessionDuration,
        avgRetention,
        bounceRate: (flowData.filter(f => f.bounceRate > 0.5).length / flowData.length * 100).toFixed(1)
      });

      setLoading(false);
    };

    fetchData();
  }, [timeframe]);

  if (loading) {
    return <div className="p-4 text-center">Loading user behavior analysis...</div>;
  }

  // Transform flow data for Sankey diagram
  const nodes: any[] = [];
  const links: any[] = [];
  const nodeSet = new Set<string>();

  userFlow.forEach(flow => {
    nodeSet.add(flow.source);
    nodeSet.add(flow.destination);
    links.push({
      source: flow.source,
      target: flow.destination,
      value: flow.count
    });
  });

  const sankyData = {
    nodes: Array.from(nodeSet).map((node, idx) => ({ name: node, id: idx })),
    links: links.map(link => ({
      source: Array.from(nodeSet).indexOf(link.source),
      target: Array.from(nodeSet).indexOf(link.target),
      value: link.value
    }))
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-bold mb-4">👥 User Behavior Analysis</h3>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-xs text-gray-600">Total Users ({timeframe})</p>
            <p className="text-2xl font-bold">{metrics.totalUsers?.toLocaleString()}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <p className="text-xs text-gray-600">Avg Session Duration</p>
            <p className="text-2xl font-bold">{metrics.avgSessionDuration}s</p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <p className="text-xs text-gray-600">Retention Rate</p>
            <p className="text-2xl font-bold">{metrics.avgRetention}%</p>
          </div>
          <div className="bg-orange-50 p-4 rounded">
            <p className="text-xs text-gray-600">Bounce Rate</p>
            <p className="text-2xl font-bold">{metrics.bounceRate}%</p>
          </div>
        </div>
      </div>

      {/* User Flow Diagram */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-bold mb-4">🔄 User Journey Flow</h3>
        
        {sankyData.nodes.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <Sankey data={sankyData} node={{ fill: '#8884d8' }} link={{ stroke: '#d084d8' }} margin={{ top: 20, right: 160, bottom: 20, left: 20 }}>
              <Tooltip 
                contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}
              />
            </Sankey>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500">No user flow data available</p>
        )}
      </div>

      {/* User Engagement Patterns */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-bold mb-4">📈 Engagement Patterns</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-sm">High Engagement (3+ sessions)</span>
            <span className="text-lg font-bold text-green-600">35%</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-sm">Medium Engagement (1-2 sessions)</span>
            <span className="text-lg font-bold text-blue-600">45%</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-sm">Low Engagement (1 session only)</span>
            <span className="text-lg font-bold text-orange-600">20%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBehaviorAnalysis;
