/**
 * Analytics Components Index
 * Central export for all analytics dashboard components
 */

export { AnalyticsDashboard } from './Dashboard';
export { Leaderboard } from './Leaderboard';
export { PredictiveAnalytics } from './PredictiveAnalytics';
export { DataExport } from './DataExport';
export { ROITracking } from './ROITracking';

// Analytics module index - combines all components
export default {
  Dashboard: () => import('./Dashboard').then(m => m.AnalyticsDashboard),
  Leaderboard: () => import('./Leaderboard').then(m => m.Leaderboard),
  PredictiveAnalytics: () => import('./PredictiveAnalytics').then(m => m.PredictiveAnalytics),
  DataExport: () => import('./DataExport').then(m => m.DataExport),
  ROITracking: () => import('./ROITracking').then(m => m.ROITracking)
};
