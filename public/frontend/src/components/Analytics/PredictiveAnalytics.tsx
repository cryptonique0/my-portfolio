'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ForecastData {
  date: string;
  predictedClaims: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface SuccessForecast {
  successProbability: number;
  estimatedFinalClaimRate: number;
  riskFactors: string[];
  recommendations: string[];
}

export const PredictiveAnalytics: React.FC = () => {
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [success, setSuccess] = useState<SuccessForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [forecastDays, setForecastDays] = useState<30 | 60 | 90>(30);

  useEffect(() => {
    loadPredictions();
  }, [forecastDays]);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      // Mock forecast data
      const data: ForecastData[] = Array.from({ length: forecastDays }, (_, i) => ({
        date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        predictedClaims: Math.floor(Math.random() * 300 + 150),
        confidence: Math.max(40, 95 - (i * 0.5)),
        trend: i % 3 === 0 ? 'increasing' : i % 3 === 1 ? 'decreasing' : 'stable'
      }));

      setForecast(data);

      // Mock success forecast
      setSuccess({
        successProbability: 78,
        estimatedFinalClaimRate: 82.5,
        riskFactors: [
          'Declining claim momentum observed',
          'Volatility increasing in recent trends',
          'User acquisition slowing down'
        ],
        recommendations: [
          'Increase marketing push in week 3',
          'Simplify the claiming process',
          'Implement user incentives for early claims',
          'Monitor gas prices and optimize timing'
        ]
      });
    } catch (error) {
      console.error('Failed to load predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Predictive Analytics</h1>
          <p className="text-gray-400">AI-powered forecasts and campaign success predictions</p>
        </div>

        {/* Control Panel */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Forecast Period</h2>
              <p className="text-gray-400 text-sm">Select the time window for predictions</p>
            </div>
            <div className="flex gap-2">
              {[30, 60, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setForecastDays(days as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    forecastDays === days
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Forecast Chart */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Predicted Claims Forecast</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#f1f5f9' }}
                formatter={(value: any) => [
                  typeof value === 'number' ? value.toFixed(0) : value,
                  'Predicted Claims'
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="predictedClaims"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Predicted Claims"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Success Forecast */}
        {success && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Key Metrics */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white mb-4">
                <p className="text-sm text-green-100 mb-1">Success Probability</p>
                <p className="text-4xl font-bold">{success.successProbability}%</p>
                <p className="text-xs text-green-100 mt-2">Campaign will succeed</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <p className="text-sm text-blue-100 mb-1">Estimated Final Rate</p>
                <p className="text-4xl font-bold">{success.estimatedFinalClaimRate.toFixed(1)}%</p>
                <p className="text-xs text-blue-100 mt-2">Of allocated tokens</p>
              </div>
            </div>

            {/* Risks & Recommendations */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Risk Factors */}
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-red-500">⚠️</span>
                    Risk Factors
                  </h3>
                  <ul className="space-y-2">
                    {success.riskFactors.map((risk, i) => (
                      <li key={i} className="text-gray-300 text-sm flex gap-2">
                        <span className="text-red-400 flex-shrink-0">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-blue-500">💡</span>
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {success.recommendations.map((rec, i) => (
                      <li key={i} className="text-gray-300 text-sm flex gap-2">
                        <span className="text-blue-400 flex-shrink-0">→</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confidence Explanation */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Understanding the Forecast</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-blue-400 font-semibold mb-2">📊 Forecast Accuracy</p>
              <p className="text-gray-300">
                Predictions are most accurate for near-term forecasts (7-14 days). Confidence decreases
                for longer forecasts as more variables come into play.
              </p>
            </div>
            <div>
              <p className="text-green-400 font-semibold mb-2">🎯 Success Factors</p>
              <p className="text-gray-300">
                Based on historical data, market trends, and current engagement metrics. Success
                probability considers both technical and behavioral factors.
              </p>
            </div>
            <div>
              <p className="text-purple-400 font-semibold mb-2">🔄 Regular Updates</p>
              <p className="text-gray-300">
                Forecasts are continuously updated with new data. As the campaign progresses, predictions
                become more refined and accurate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;
