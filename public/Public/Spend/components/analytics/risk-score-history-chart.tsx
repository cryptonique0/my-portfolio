"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const generateRiskScoreData = () => {
  return [
    { date: 'Jan 1', riskScore: 32, alerts: 1, safetyIndex: 88 },
    { date: 'Jan 5', riskScore: 28, alerts: 0, safetyIndex: 92 },
    { date: 'Jan 10', riskScore: 45, alerts: 2, safetyIndex: 80 },
    { date: 'Jan 15', riskScore: 38, alerts: 1, safetyIndex: 85 },
    { date: 'Jan 20', riskScore: 52, alerts: 3, safetyIndex: 72 },
    { date: 'Jan 25', riskScore: 41, alerts: 1, safetyIndex: 82 },
    { date: 'Jan 30', riskScore: 35, alerts: 0, safetyIndex: 89 },
  ];
};

const getRiskLevel = (score: number) => {
  if (score < 25) return { level: 'Safe', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/20' };
  if (score < 50) return { level: 'Normal', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/20' };
  if (score < 75) return { level: 'Caution', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/20' };
  return { level: 'Critical', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/20' };
};

export function RiskScoreHistoryChart({ timeRange }: { timeRange: string }) {
  const data = generateRiskScoreData();
  const latestScore = data[data.length - 1].riskScore;
  const latestRisk = getRiskLevel(latestScore);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-6">Risk Score History</h3>
        <p className="text-sm text-muted-foreground mb-4">Vault security and risk assessment over time</p>
        
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" domain={[0, 100]} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="riskScore" 
              stroke="var(--primary)" 
              fillOpacity={1} 
              fill="url(#colorRisk)"
              name="Risk Score"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Current Risk Status */}
      <div className={`${latestRisk.bg} border border-current rounded-lg p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Current Risk Level</p>
            <p className={`text-4xl font-bold ${latestRisk.color}`}>{latestScore}</p>
            <p className="text-sm text-muted-foreground mt-2">
              <span className={latestRisk.color}>{latestRisk.level}</span> - 
              <span className="ml-2">Last updated today</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-2">Safety Index</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{100 - latestScore}</p>
            <p className="text-xs text-muted-foreground mt-1">Higher is better</p>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-muted rounded-lg p-4">
          <h4 className="font-semibold mb-3">Contributing Factors</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 dark:text-yellow-400 font-bold">⚠</span>
              <span>Withdrawal velocity increased 15% this week</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span>All guardians responsive (avg 2.4h)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span>Spending limits: 52% utilized</span>
            </li>
          </ul>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <h4 className="font-semibold mb-3">Recommendations</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">→</span>
              <span>Monitor spending patterns closely this week</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">→</span>
              <span>Consider reducing spending limits temporarily</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">→</span>
              <span>Review guardian participation in voting</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Historical Alerts */}
      <div>
        <h4 className="font-semibold mb-3">Recent Alerts</h4>
        <div className="space-y-2">
          {data.map((item, idx) => 
            item.alerts > 0 && (
              <div key={idx} className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-3 flex items-start gap-3">
                <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">⚠</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.alerts} anomal{item.alerts > 1 ? 'ies' : 'y'} detected</p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">{item.date} - Risk score: {item.riskScore}</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
