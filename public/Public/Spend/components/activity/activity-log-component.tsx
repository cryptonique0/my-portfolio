'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  Download,
  Filter,
  Search,
  Calendar,
  Copy,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  User,
  Shield,
  Settings,
  Zap,
  Lock,
  MoreVertical,
  FileJson,
  FileText,
  File,
} from 'lucide-react';
import {
  ActivityLog,
  ActivityFilterOptions,
  ActivityExportOptions,
  severityColors,
  severityEmojis,
} from '@/lib/services/activity/activity-log-types';
import { ActivityLogExportService } from '@/lib/services/activity/activity-log-export-service';

interface ActivityLogComponentProps {
  logs: ActivityLog[];
  vaultAddress?: string;
  userId?: string;
  maxHeight?: string;
  compact?: boolean;
}

export function ActivityLogComponent({
  logs,
  vaultAddress,
  userId,
  maxHeight = 'max-h-96',
  compact = false,
}: ActivityLogComponentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([]);
  const [showSuccessOnly, setShowSuccessOnly] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Get unique types and categories
  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(logs.map((l) => l.type)));
  }, [logs]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(logs.map((l) => l.category)));
  }, [logs]);

  const uniqueSeverities = ['critical', 'high', 'medium', 'low', 'info'];

  // Build filter options
  const filters: ActivityFilterOptions = {
    types: selectedTypes.length > 0 ? (selectedTypes as any) : undefined,
    categories: selectedCategories.length > 0 ? (selectedCategories as any) : undefined,
    severities: selectedSeverities.length > 0 ? (selectedSeverities as any) : undefined,
    searchTerm: searchTerm || undefined,
    vaultAddress: vaultAddress || undefined,
    userId: userId || undefined,
    successOnly: showSuccessOnly || undefined,
    dateRange: startDate && endDate ? { start: startDate.getTime(), end: endDate.getTime() } : undefined,
  };

  // Filter logs
  const filteredLogs = useMemo(() => {
    return ActivityLogExportService.filterLogs(logs, filters);
  }, [logs, filters]);

  // Sort logs
  const sortedLogs = useMemo(() => {
    const sorted = [...filteredLogs];
    sorted.sort((a, b) => {
      const comparison = b.timestamp - a.timestamp;
      return sortOrder === 'asc' ? -comparison : comparison;
    });
    return sorted;
  }, [filteredLogs, sortOrder]);

  // Get statistics
  const stats = useMemo(() => {
    return ActivityLogExportService.getStatistics(filteredLogs);
  }, [filteredLogs]);

  const handleExport = () => {
    const exportOptions: ActivityExportOptions = {
      format: exportFormat,
      includeMetadata: true,
      includeChanges: true,
      filters,
      filename: ActivityLogExportService.generateFilename(exportFormat, vaultAddress),
    };

    let content = '';
    if (exportFormat === 'csv') {
      content = ActivityLogExportService.exportToCSV(filteredLogs, exportOptions);
    } else if (exportFormat === 'json') {
      content = ActivityLogExportService.exportToJSON(filteredLogs, exportOptions);
    } else {
      content = ActivityLogExportService.exportToPDF(filteredLogs, exportOptions);
    }

    ActivityLogExportService.downloadFile(
      content,
      exportOptions.filename,
      exportFormat === 'csv' ? 'text/csv' : exportFormat === 'json' ? 'application/json' : 'text/plain'
    );
  };

  const handleCopyJSON = async () => {
    const json = ActivityLogExportService.exportToJSON(filteredLogs, {
      format: 'json',
      includeMetadata: true,
      includeChanges: true,
    });
    await ActivityLogExportService.copyToClipboard(json);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vault':
        return <Lock className="w-4 h-4" />;
      case 'guardian':
        return <Shield className="w-4 h-4" />;
      case 'transaction':
        return <Zap className="w-4 h-4" />;
      case 'security':
        return <AlertCircle className="w-4 h-4" />;
      case 'settings':
        return <Settings className="w-4 h-4" />;
      case 'emergency':
        return <AlertCircle className="w-4 h-4" />;
      case 'user':
        return <User className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getSeverityBg = (severity: string) => {
    const colors = {
      critical: 'bg-red-50 border-red-200',
      high: 'bg-orange-50 border-orange-200',
      medium: 'bg-yellow-50 border-yellow-200',
      low: 'bg-blue-50 border-blue-200',
      info: 'bg-gray-50 border-gray-200',
    };
    return colors[severity as keyof typeof colors] || colors.info;
  };

  const getSeverityBadge = (severity: string) => {
    const badges = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800',
      info: 'bg-gray-100 text-gray-800',
    };
    return badges[severity as keyof typeof badges] || badges.info;
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Recent Activity</h3>
          <span className="text-xs text-gray-500">{filteredLogs.length} total</span>
        </div>

        <div className={`space-y-2 ${maxHeight} overflow-y-auto`}>
          {sortedLogs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No activities found</p>
            </div>
          ) : (
            sortedLogs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-lg border ${getSeverityBg(log.severity)} text-sm`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <span className="mt-0.5">{severityEmojis[log.severity as any] || '📝'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{log.action}</p>
                      <p className="text-gray-600 text-xs">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  {log.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Activity Log</h2>
          <p className="text-sm text-gray-500">
            {filteredLogs.length} of {logs.length} activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filters
            {selectedTypes.length + selectedCategories.length + selectedSeverities.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs font-semibold text-white bg-blue-600 rounded-full">
                {selectedTypes.length + selectedCategories.length + selectedSeverities.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalActivities}</p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs text-green-700 mb-1">Success Rate</p>
          <p className="text-2xl font-bold text-green-900">
            {(stats.successRate * 100).toFixed(0)}%
          </p>
        </div>
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-xs text-red-700 mb-1">Failures</p>
          <p className="text-2xl font-bold text-red-900">{stats.failureCount}</p>
        </div>
        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-xs text-orange-700 mb-1">Critical</p>
          <p className="text-2xl font-bold text-orange-900">{stats.bySeverity.critical || 0}</p>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate ? startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate ? endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Activity Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Activity Types</label>
            <div className="flex flex-wrap gap-2">
              {uniqueTypes.slice(0, 6).map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    setSelectedTypes(
                      selectedTypes.includes(type)
                        ? selectedTypes.filter((t) => t !== type)
                        : [...selectedTypes, type]
                    )
                  }
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    selectedTypes.includes(type)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
            <div className="flex flex-wrap gap-2">
              {uniqueCategories.map((category) => (
                <button
                  key={category}
                  onClick={() =>
                    setSelectedCategories(
                      selectedCategories.includes(category)
                        ? selectedCategories.filter((c) => c !== category)
                        : [...selectedCategories, category]
                    )
                  }
                  className={`px-3 py-1 rounded-full text-sm font-medium transition flex items-center gap-1 ${
                    selectedCategories.includes(category)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {getCategoryIcon(category)}
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
            <div className="flex flex-wrap gap-2">
              {uniqueSeverities.map((severity) => (
                <button
                  key={severity}
                  onClick={() =>
                    setSelectedSeverities(
                      selectedSeverities.includes(severity)
                        ? selectedSeverities.filter((s) => s !== severity)
                        : [...selectedSeverities, severity]
                    )
                  }
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    selectedSeverities.includes(severity)
                      ? 'bg-blue-600 text-white'
                      : `${getSeverityBadge(severity)} border`
                  }`}
                >
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Show Success Only */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showSuccessOnly}
              onChange={(e) => setShowSuccessOnly(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Show successful activities only</span>
          </label>
        </div>
      )}

      {/* Export Options */}
      <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
        <Download className="w-4 h-4 text-blue-600" />
        <div className="flex-1 text-sm text-blue-900">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json' | 'pdf')}
            className="text-sm font-medium text-blue-600 bg-transparent border-0 cursor-pointer hover:underline"
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
            <option value="pdf">PDF</option>
          </select>
          <span className="ml-1">({filteredLogs.length} items)</span>
        </div>
        <button
          onClick={handleExport}
          className="px-3 py-1 text-sm font-medium text-blue-600 bg-white rounded border border-blue-300 hover:bg-blue-50"
        >
          Export
        </button>
        {exportFormat === 'json' && (
          <button
            onClick={handleCopyJSON}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded border border-gray-300 hover:bg-gray-50"
          >
            <Copy className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Activity List */}
      <div className={`${maxHeight} overflow-y-auto bg-white rounded-lg border border-gray-200`}>
        {sortedLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Activity className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">No activities found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y">
            {sortedLogs.map((log, index) => (
              <div key={log.id}>
                <button
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  className={`w-full px-4 py-3 hover:bg-gray-50 transition text-left flex items-start justify-between gap-3 ${
                    expandedId === log.id ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Severity indicator */}
                    <div
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{
                        backgroundColor:
                          severityColors[log.severity as keyof typeof severityColors],
                      }}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getCategoryIcon(log.category)}
                        <h3 className="font-semibold text-gray-900 truncate">{log.action}</h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${getSeverityBadge(log.severity)}`}
                        >
                          {log.severity}
                        </span>
                        {!log.success && (
                          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{log.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                        {log.vaultAddress && (
                          <span className="truncate" title={log.vaultAddress}>
                            {log.vaultAddress.substring(0, 10)}...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expand button */}
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition ${
                      expandedId === log.id ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Expanded details */}
                {expandedId === log.id && (
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 space-y-3">
                    {log.userEmail && (
                      <div className="text-sm">
                        <p className="text-gray-600">User</p>
                        <p className="font-medium text-gray-900">{log.userEmail}</p>
                      </div>
                    )}

                    {log.vaultAddress && (
                      <div className="text-sm">
                        <p className="text-gray-600">Vault Address</p>
                        <p className="font-mono text-gray-900 text-xs truncate">
                          {log.vaultAddress}
                        </p>
                      </div>
                    )}

                    {log.errorMessage && (
                      <div className="text-sm p-2 bg-red-50 rounded border border-red-200">
                        <p className="text-red-800 text-xs">Error</p>
                        <p className="text-red-700 text-xs font-medium mt-1">{log.errorMessage}</p>
                      </div>
                    )}

                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="text-sm">
                        <p className="text-gray-600 mb-2">Metadata</p>
                        <div className="bg-white p-2 rounded border border-gray-200 text-xs font-mono text-gray-700 max-h-32 overflow-y-auto">
                          <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                        </div>
                      </div>
                    )}

                    {log.changes && (
                      <div className="text-sm">
                        <p className="text-gray-600 mb-2">Changes</p>
                        <div className="space-y-2">
                          {log.changes.before && (
                            <div className="bg-red-50 p-2 rounded border border-red-200">
                              <p className="text-red-800 text-xs font-medium mb-1">Before</p>
                              <pre className="text-xs font-mono text-red-700 overflow-x-auto">
                                {typeof log.changes.before === 'string'
                                  ? log.changes.before
                                  : JSON.stringify(log.changes.before, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.changes.after && (
                            <div className="bg-green-50 p-2 rounded border border-green-200">
                              <p className="text-green-800 text-xs font-medium mb-1">After</p>
                              <pre className="text-xs font-mono text-green-700 overflow-x-auto">
                                {typeof log.changes.after === 'string'
                                  ? log.changes.after
                                  : JSON.stringify(log.changes.after, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination info */}
      <div className="text-center text-sm text-gray-500">
        Showing {sortedLogs.length} of {filteredLogs.length} activities
      </div>
    </div>
  );
}
