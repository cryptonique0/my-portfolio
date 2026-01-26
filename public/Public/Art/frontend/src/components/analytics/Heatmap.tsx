import React, { useEffect, useState, useRef } from 'react';
import { analyticsDataService } from '../../services/analytics-data.service';

interface HeatmapPoint {
  x: number;
  y: number;
  value: number;
  element?: string;
}

interface HeatmapProps {
  pageUrl: string;
  width?: number;
  height?: number;
}

const Heatmap: React.FC<HeatmapProps> = ({ pageUrl, width = 1200, height = 800 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await analyticsDataService.getHeatmapData(pageUrl);
      setHeatmapData(data);
      setLoading(false);
    };

    fetchData();
  }, [pageUrl]);

  useEffect(() => {
    if (!canvasRef.current || heatmapData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw gradient heatmap
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    // Initialize with white
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;     // R
      data[i + 1] = 255; // G
      data[i + 2] = 255; // B
      data[i + 3] = 255; // A
    }

    // Draw each click point with gradient
    heatmapData.forEach(point => {
      const radius = 30;
      const maxIntensity = point.value || 1;

      for (let y = Math.max(0, point.y - radius); y < Math.min(canvas.height, point.y + radius); y++) {
        for (let x = Math.max(0, point.x - radius); x < Math.min(canvas.width, point.x + radius); x++) {
          const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
          if (distance < radius) {
            const intensity = (1 - distance / radius) * maxIntensity;
            const index = (y * canvas.width + x) * 4;

            // Red gradient (cool to hot colors)
            const r = Math.min(255, data[index] - intensity * 100);
            const g = Math.max(0, data[index + 1] - intensity * 150);
            const b = Math.max(0, data[index + 2] - intensity * 200);

            data[index] = r;
            data[index + 1] = g;
            data[index + 2] = b;
            data[index + 3] = 255;
          }
        }
      }
    });

    ctx.putImageData(imageData, 0, 0);
  }, [heatmapData]);

  if (loading) {
    return <div className="p-4 text-center">Loading heatmap...</div>;
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-bold mb-4">🔥 Click Heatmap</h3>
      
      <div className="overflow-x-auto mb-4">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="border rounded bg-white mx-auto"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      <div className="flex items-center justify-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{ backgroundColor: '#0000ff' }}></div>
          <span className="text-sm">Cool (Low Activity)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{ backgroundColor: '#ff0000' }}></div>
          <span className="text-sm">Hot (High Activity)</span>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <h4 className="font-semibold">Top Clicked Elements:</h4>
        {heatmapData
          .sort((a, b) => (b.value || 0) - (a.value || 0))
          .slice(0, 5)
          .map((point, idx) => (
            <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-sm">{point.element || `Element (${point.x}, ${point.y})`}</span>
              <span className="font-bold text-purple-600">{point.value} clicks</span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Heatmap;
