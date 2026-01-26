'use client';

import React, { useState } from 'react';
import CSVExportService from '../../utils/csvExport';

interface ExportOption {
  id: string;
  label: string;
  description: string;
  icon: string;
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: 'airdrop-data',
    label: 'Airdrop Data',
    description: 'Export all airdrop allocations and claims',
    icon: '📋'
  },
  {
    id: 'metrics',
    label: 'Daily Metrics',
    description: 'Export daily campaign metrics and trends',
    icon: '📊'
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    description: 'Export top claimers and rankings',
    icon: '🏆'
  },
  {
    id: 'roi',
    label: 'ROI Report',
    description: 'Export campaign ROI and success metrics',
    icon: '💰'
  },
  {
    id: 'forecast',
    label: 'Forecast Data',
    description: 'Export predictive analytics and forecasts',
    icon: '🔮'
  }
];

export const DataExport: React.FC = () => {
  const [selectedExports, setSelectedExports] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [csvFormat, setCSVFormat] = useState<'comma' | 'semicolon'>('comma');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const toggleExport = (id: string) => {
    const newSet = new Set(selectedExports);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedExports(newSet);
  };

  const handleExport = async () => {
    if (selectedExports.size === 0) {
      setExportMessage({ type: 'error', text: 'Please select at least one export option' });
      return;
    }

    setExporting(true);
    try {
      // Process each selected export
      for (const exportId of selectedExports) {
        const option = EXPORT_OPTIONS.find(o => o.id === exportId);
        if (!option) continue;

        // Mock data generation - replace with actual data
        let content = '';
        let filename = '';

        switch (exportId) {
          case 'airdrop-data':
            content = generateAirdropDataCSV();
            filename = CSVExportService.generateFilename('airdrop_data');
            break;
          case 'metrics':
            content = generateMetricsCSV();
            filename = CSVExportService.generateFilename('daily_metrics');
            break;
          case 'leaderboard':
            content = generateLeaderboardCSV();
            filename = CSVExportService.generateFilename('leaderboard');
            break;
          case 'roi':
            content = generateROICSV();
            filename = CSVExportService.generateFilename('roi_report');
            break;
          case 'forecast':
            content = generateForecastCSV();
            filename = CSVExportService.generateFilename('forecast_data');
            break;
        }

        if (content) {
          // In browser, download the file
          if (typeof window !== 'undefined') {
            const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }

        // Add delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setExportMessage({
        type: 'success',
        text: `Successfully exported ${selectedExports.size} file(s)`
      });

      // Clear selections
      setSelectedExports(new Set());

      // Clear message after 5 seconds
      setTimeout(() => setExportMessage(null), 5000);
    } catch (error) {
      setExportMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Export failed'
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Data Export</h1>
          <p className="text-gray-400">Download your airdrop data in CSV format for analysis</p>
        </div>

        {/* Message */}
        {exportMessage && (
          <div
            className={`rounded-lg p-4 mb-8 flex items-center gap-3 ${
              exportMessage.type === 'success'
                ? 'bg-green-900 border border-green-700 text-green-200'
                : 'bg-red-900 border border-red-700 text-red-200'
            }`}
          >
            <span className="text-xl">{exportMessage.type === 'success' ? '✓' : '✕'}</span>
            <span>{exportMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Export Options */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Select Export Types</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EXPORT_OPTIONS.map(option => (
                  <div
                    key={option.id}
                    onClick={() => toggleExport(option.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedExports.has(option.id)
                        ? 'border-blue-500 bg-blue-900 bg-opacity-20'
                        : 'border-slate-700 bg-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedExports.has(option.id)}
                        onChange={() => {}}
                        className="mt-1 w-5 h-5 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{option.icon}</span>
                          <h3 className="font-semibold text-white">{option.label}</h3>
                        </div>
                        <p className="text-sm text-gray-400">{option.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Export Settings */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Export Settings</h2>

            {/* CSV Format */}
            <div className="mb-6">
              <label className="text-white text-sm font-semibold mb-3 block">CSV Delimiter</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                  <input
                    type="radio"
                    name="csv-format"
                    value="comma"
                    checked={csvFormat === 'comma'}
                    onChange={(e) => setCSVFormat(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <span>Comma (,)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                  <input
                    type="radio"
                    name="csv-format"
                    value="semicolon"
                    checked={csvFormat === 'semicolon'}
                    onChange={(e) => setCSVFormat(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <span>Semicolon (;)</span>
                </label>
              </div>
            </div>

            {/* Headers */}
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHeaders}
                  onChange={(e) => setIncludeHeaders(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-white text-sm font-semibold">Include Headers</span>
              </label>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={exporting || selectedExports.size === 0}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                exporting || selectedExports.size === 0
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {exporting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⟳</span>
                  Exporting...
                </span>
              ) : (
                <span>📥 Export ({selectedExports.size})</span>
              )}
            </button>

            {/* Info */}
            <div className="mt-6 p-4 bg-slate-700 rounded-lg text-xs text-gray-300">
              <p className="font-semibold mb-2">💡 Tips:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Export multiple types in one click</li>
                <li>Files are downloaded to your computer</li>
                <li>Use Excel or Google Sheets to analyze</li>
              </ul>
            </div>
          </div>
        </div>

        {/* File Preview */}
        <div className="mt-8 bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">File Formats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
            <div>
              <h3 className="font-semibold text-white mb-2">📋 Airdrop Data</h3>
              <p className="mb-2">Columns: Address, Amount, Status, Claim Date, TX Hash</p>
              <pre className="bg-slate-900 p-2 rounded text-xs overflow-x-auto">
{`address,amount,status,claim_date
0x123...456,1000.00,claimed,2024-01-10
0x789...abc,500.00,pending,`}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">📊 Daily Metrics</h3>
              <p className="mb-2">Columns: Date, Claims, Volume, Users, Rate</p>
              <pre className="bg-slate-900 p-2 rounded text-xs overflow-x-auto">
{`date,claims,volume,users,rate
2024-01-10,245,150000,123,89.5%
2024-01-09,198,120000,98,85.2%`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock data generators
function generateAirdropDataCSV(): string {
  const headers = 'Address,Amount,Status,Claim Date,Transaction Hash\n';
  let rows = '';
  for (let i = 0; i < 100; i++) {
    const address = `0x${Math.random().toString(16).slice(2, 42)}`;
    const amount = (Math.random() * 10000).toFixed(2);
    const status = Math.random() > 0.3 ? 'claimed' : 'pending';
    const date = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    const hash = `0x${Math.random().toString(16).slice(2, 66)}`;
    rows += `${address},${amount},${status},${date},${hash}\n`;
  }
  return headers + rows;
}

function generateMetricsCSV(): string {
  const headers = 'Date,Claims,Volume,Unique Users,Claim Rate\n';
  let rows = '';
  for (let i = 0; i < 30; i++) {
    const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    const claims = Math.floor(Math.random() * 300 + 100);
    const volume = (Math.random() * 500000 + 100000).toFixed(2);
    const users = Math.floor(Math.random() * 100 + 50);
    const rate = (Math.random() * 40 + 60).toFixed(1);
    rows += `${date},${claims},${volume},${users},${rate}%\n`;
  }
  return headers + rows;
}

function generateLeaderboardCSV(): string {
  const headers = 'Rank,Address,Total Claimed,Number of Claims,Percentage of Total\n';
  let rows = '';
  for (let i = 0; i < 50; i++) {
    const address = `0x${Math.random().toString(16).slice(2, 42)}`;
    const claimed = (Math.random() * 100000).toFixed(2);
    const claims = Math.floor(Math.random() * 50 + 1);
    const percentage = ((100 / (i + 1)) * 1.5).toFixed(4);
    rows += `${i + 1},${address},${claimed},${claims},${percentage}%\n`;
  }
  return headers + rows;
}

function generateROICSV(): string {
  const headers = 'Campaign,Invested,Claimed,ROI (%),Success Score\n';
  let rows = '';
  const campaigns = ['Campaign A', 'Campaign B', 'Campaign C', 'Campaign D'];
  campaigns.forEach(campaign => {
    const invested = (Math.random() * 1000000).toFixed(2);
    const claimed = (Math.random() * 800000).toFixed(2);
    const roi = ((Math.random() * 150 - 20)).toFixed(2);
    const score = Math.floor(Math.random() * 40 + 60);
    rows += `${campaign},${invested},${claimed},${roi},${score}\n`;
  });
  return headers + rows;
}

function generateForecastCSV(): string {
  const headers = 'Date,Predicted Claims,Confidence (%),Trend\n';
  let rows = '';
  for (let i = 0; i < 30; i++) {
    const date = new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    const claims = Math.floor(Math.random() * 300 + 150);
    const confidence = Math.max(40, 95 - i * 1.5).toFixed(1);
    const trend = ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)];
    rows += `${date},${claims},${confidence},${trend}\n`;
  }
  return headers + rows;
}

export default DataExport;
