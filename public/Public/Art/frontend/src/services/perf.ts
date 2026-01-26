import { getCLS, getFID, getLCP, getTTFB, getFCP, Metric } from 'web-vitals';

function report(metric: Metric) {
  // Log to console for local debugging
  // eslint-disable-next-line no-console
  console.info('[WebVitals]', metric.name, metric.value);

  const enabled = (import.meta.env.VITE_ENABLE_PERF_METRICS || '').toLowerCase() === 'true';
  if (!enabled) return;

  try {
    const api = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    const url = `${api.replace('/api', '')}/api/advanced-analytics/web-vitals`;
    const body = JSON.stringify({ name: metric.name, value: metric.value, id: metric.id, delta: metric.delta, rating: metric.rating });
    if ('sendBeacon' in navigator) {
      navigator.sendBeacon(url, body);
    } else {
      fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    }
  } catch {
    // silently ignore network errors
  }
}

export function startPerfMetrics() {
  getCLS(report);
  getFID(report);
  getLCP(report);
  getTTFB(report);
  getFCP(report);
}
