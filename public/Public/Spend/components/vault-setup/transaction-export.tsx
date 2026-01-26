'use client';

/**
 * Transaction Export Component
 * Export transactions in CSV, JSON, and PDF formats
 */

import React, { useState } from 'react';
import {
  Calendar,
  Download,
  FileJson,
  FileText,
  Filter,
  Search,
} from 'lucide-react';
import { TransactionExportService, Transaction } from '@/lib/services/export/transaction-export-service';

interface FilterState {
  dateRange: {
    start: string;
    end: string;
  };
  types: Transaction['type'][];
  statuses: Transaction['status'][];
  searchTerm: string;
}

export default function TransactionExport() {
  // Sample transactions for demo
  const sampleTransactions: Transaction[] = [
    {
      id: '1',
      hash: '0x1234567890abcdef1234567890abcdef12345678',
      vaultAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      type: 'deposit',
      amount: '10.5',
      token: 'ETH',
      from: '0x0000000000000000000000000000000000000001',
      to: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      status: 'completed',
      timestamp: Date.now() - 86400000,
      blockNumber: 17500000,
      gasUsed: '21000',
      gasPrice: '25',
      fees: '0.525',
      description: 'Initial deposit',
    },
    {
      id: '2',
      hash: '0x2345678901bcdef1234567890abcdef123456789',
      vaultAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      type: 'withdrawal',
      amount: '5.25',
      token: 'ETH',
      from: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      to: '0x0000000000000000000000000000000000000002',
      status: 'completed',
      timestamp: Date.now() - 43200000,
      blockNumber: 17500100,
      gasUsed: '21000',
      gasPrice: '20',
      fees: '0.420',
      description: 'Emergency withdrawal',
    },
    {
      id: '3',
      hash: '0x3456789012cdef1234567890abcdef1234567890',
      vaultAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      type: 'transfer',
      amount: '2.0',
      token: 'USDC',
      from: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      to: '0x0000000000000000000000000000000000000003',
      status: 'pending',
      timestamp: Date.now() - 3600000,
      blockNumber: 0,
      description: 'Transfer to wallet',
    },
    {
      id: '4',
      hash: '0x456789012def1234567890abcdef12345678901',
      vaultAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      type: 'approval',
      amount: '100.0',
      token: 'USDC',
      from: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      to: '0x0000000000000000000000000000000000000004',
      status: 'completed',
      timestamp: Date.now() - 604800000,
      blockNumber: 17499900,
      description: 'Token approval',
    },
  ];

  const [transactions] = useState<Transaction[]>(sampleTransactions);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [includeMetadata, setIncludeMetadata] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      start: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    types: [],
    statuses: [],
    searchTerm: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  // Filter transactions based on criteria
  const filteredTransactions = transactions.filter((tx) => {
    // Search filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      if (
        !tx.hash.toLowerCase().includes(term) &&
        !tx.from.toLowerCase().includes(term) &&
        !tx.to.toLowerCase().includes(term) &&
        !tx.description?.toLowerCase().includes(term)
      ) {
        return false;
      }
    }

    // Type filter
    if (filters.types.length > 0 && !filters.types.includes(tx.type)) {
      return false;
    }

    // Status filter
    if (filters.statuses.length > 0 && !filters.statuses.includes(tx.status)) {
      return false;
    }

    // Date range filter
    const startDate = new Date(filters.dateRange.start).getTime();
    const endDate = new Date(filters.dateRange.end).getTime() + 86400000;
    if (tx.timestamp < startDate || tx.timestamp > endDate) {
      return false;
    }

    return true;
  });

  // Get statistics
  const stats = TransactionExportService.getStatistics(filteredTransactions);

  const handleExport = () => {
    let content = '';
    let mimeType = 'text/plain';
    let format = exportFormat;

    const exportOptions = {
      format: format as 'csv' | 'json' | 'pdf',
      includeMetadata,
      vaultAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    };

    if (exportFormat === 'csv') {
      content = TransactionExportService.exportToCSV(filteredTransactions, exportOptions);
      mimeType = 'text/csv';
    } else if (exportFormat === 'json') {
      content = TransactionExportService.exportToJSON(filteredTransactions, exportOptions);
      mimeType = 'application/json';
    } else if (exportFormat === 'pdf') {
      content = TransactionExportService.exportToPDF(filteredTransactions, exportOptions);
      mimeType = 'text/plain';
    }

    const filename = TransactionExportService.generateFilename(
      exportFormat,
      '0xabcd'
    );
    TransactionExportService.downloadFile(content, filename, mimeType);
  };

  const toggleTypeFilter = (type: Transaction['type']) => {
    setFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }));
  };

  const toggleStatusFilter = (status: Transaction['status']) => {
    setFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateRange: {
        start: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
      types: [],
      statuses: [],
      searchTerm: '',
    });
  };

  const activeFilters = filters.types.length + filters.statuses.length + (filters.searchTerm ? 1 : 0);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Transaction Export</h1>
        <p className="text-gray-400">
          Export your vault transactions in multiple formats for record-keeping and analysis
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Transactions</p>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Completed</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{stats.completed}</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Failed</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{stats.failed}</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Total Amount</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{stats.totalAmount}</p>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Format Selection */}
          <div>
            <h3 className="font-medium mb-3">Export Format</h3>
            <div className="space-y-2">
              {['csv', 'json', 'pdf'].map((format) => (
                <label
                  key={format}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-700/50 transition"
                >
                  <input
                    type="radio"
                    name="format"
                    value={format}
                    checked={exportFormat === format}
                    onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json' | 'pdf')}
                    className="rounded"
                  />
                  <div className="flex items-center gap-2">
                    {format === 'csv' && <FileText className="w-4 h-4" />}
                    {format === 'json' && <FileJson className="w-4 h-4" />}
                    {format === 'pdf' && <FileText className="w-4 h-4" />}
                    <span className="uppercase font-medium">{format}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Options */}
          <div>
            <h3 className="font-medium mb-3">Options</h3>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-700/50 transition">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="rounded"
              />
              <span>Include Metadata</span>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Include additional metadata and custom fields in export
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleExport}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Export
            </button>
            <p className="text-xs text-gray-500 text-center">
              {filteredTransactions.length} transaction
              {filteredTransactions.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {activeFilters > 0 && (
            <span className="ml-2 px-2 py-1 bg-blue-600 rounded-full text-xs">
              {activeFilters}
            </span>
          )}
        </button>

        {showFilters && (
          <div className="mt-4 bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      searchTerm: e.target.value,
                    }))
                  }
                  placeholder="Search by hash, address, or description..."
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Transaction Types */}
            <div>
              <label className="block text-sm font-medium mb-2">Transaction Types</label>
              <div className="flex flex-wrap gap-2">
                {(['deposit', 'withdrawal', 'transfer', 'approval'] as Transaction['type'][]).map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => toggleTypeFilter(type)}
                      className={`px-3 py-1 rounded-full text-sm transition ${
                        filters.types.includes(type)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <div className="flex flex-wrap gap-2">
                {(['pending', 'completed', 'failed', 'rejected'] as Transaction['status'][]).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => toggleStatusFilter(status)}
                      className={`px-3 py-1 rounded-full text-sm transition ${
                        filters.statuses.includes(status)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  )
                )}
              </div>
            </div>

            {activeFilters > 0 && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-sm"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-900/50">
                <th className="px-6 py-3 text-left font-medium text-gray-300">Hash</th>
                <th className="px-6 py-3 text-left font-medium text-gray-300">Type</th>
                <th className="px-6 py-3 text-left font-medium text-gray-300">Amount</th>
                <th className="px-6 py-3 text-left font-medium text-gray-300">Status</th>
                <th className="px-6 py-3 text-left font-medium text-gray-300">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-700 hover:bg-gray-700/30 transition">
                  <td className="px-6 py-3 font-mono text-xs">
                    {tx.hash.substring(0, 10)}...{tx.hash.substring(34)}
                  </td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-1 bg-gray-700 rounded text-xs capitalize">
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {tx.amount} {tx.token}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs capitalize ${
                        tx.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : tx.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : tx.status === 'failed'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-400">
                    {new Date(tx.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            <p>No transactions match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
