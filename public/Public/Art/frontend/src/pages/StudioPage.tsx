import React, { useRef, useState, useEffect } from 'react';
import { useUserStore } from '../store';

type Tool = 'brush' | 'eraser' | 'line' | 'rectangle' | 'circle' | 'fill' | 'eyedropper';

interface Point {
  x: number;
  y: number;
}

export const StudioPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('brush');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [opacity, setOpacity] = useState(1);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const { user } = useUserStore();

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#00FFAA', '#FF6B6B'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize canvas with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  }, []);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const newStep = historyStep - 1;
      ctx.putImageData(history[newStep], 0, 0);
      setHistoryStep(newStep);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const newStep = historyStep + 1;
      ctx.putImageData(history[newStep], 0, 0);
      setHistoryStep(newStep);
    }
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getMousePos(e);
    setIsDrawing(true);
    setStartPoint(pos);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = opacity;

    if (tool === 'brush' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else if (tool === 'eyedropper') {
      const imageData = ctx.getImageData(pos.x, pos.y, 1, 1);
      const pixel = imageData.data;
      const pickedColor = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
      setColor(pickedColor);
      setIsDrawing(false);
    } else if (tool === 'fill') {
      floodFill(ctx, pos.x, pos.y, color);
      saveToHistory();
      setIsDrawing(false);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getMousePos(e);

    if (tool === 'brush') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = brushSize;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (startPoint && (tool === 'line' || tool === 'rectangle' || tool === 'circle')) {
      // Preview shape
      if (historyStep >= 0) {
        ctx.putImageData(history[historyStep], 0, 0);
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;

      if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (tool === 'rectangle') {
        ctx.strokeRect(startPoint.x, startPoint.y, pos.x - startPoint.x, pos.y - startPoint.y);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(pos.x - startPoint.x, 2) + Math.pow(pos.y - startPoint.y, 2));
        ctx.beginPath();
        ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    if (isDrawing && (tool === 'brush' || tool === 'eraser' || tool === 'line' || tool === 'rectangle' || tool === 'circle')) {
      saveToHistory();
    }
    setIsDrawing(false);
    setStartPoint(null);
  };

  const floodFill = (ctx: CanvasRenderingContext2D, x: number, y: number, fillColor: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const targetColor = getPixelColor(imageData, x, y);
    const fillColorRgb = hexToRgb(fillColor);

    if (!fillColorRgb || colorsMatch(targetColor, fillColorRgb)) return;

    const pixelsToCheck = [x, y];
    const width = canvas.width;
    const height = canvas.height;

    while (pixelsToCheck.length > 0) {
      const y = pixelsToCheck.pop()!;
      const x = pixelsToCheck.pop()!;

      const currentColor = getPixelColor(imageData, x, y);
      if (!colorsMatch(currentColor, targetColor)) continue;

      setPixelColor(imageData, x, y, fillColorRgb);

      if (x > 0) pixelsToCheck.push(x - 1, y);
      if (x < width - 1) pixelsToCheck.push(x + 1, y);
      if (y > 0) pixelsToCheck.push(x, y - 1);
      if (y < height - 1) pixelsToCheck.push(x, y + 1);
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const getPixelColor = (imageData: ImageData, x: number, y: number) => {
    const index = (y * imageData.width + x) * 4;
    return {
      r: imageData.data[index],
      g: imageData.data[index + 1],
      b: imageData.data[index + 2],
      a: imageData.data[index + 3]
    };
  };

  const setPixelColor = (imageData: ImageData, x: number, y: number, color: { r: number; g: number; b: number }) => {
    const index = (y * imageData.width + x) * 4;
    imageData.data[index] = color.r;
    imageData.data[index + 1] = color.g;
    imageData.data[index + 2] = color.b;
    imageData.data[index + 3] = 255;
  };

  const colorsMatch = (a: any, b: any) => {
    return a.r === b.r && a.g === b.g && a.b === b.b;
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const downloadArt = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `bitart-creation-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const mintNFT = () => {
    if (!user.isConnected) {
      alert('Please connect your wallet to mint an NFT');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // In a real implementation, this would upload to IPFS and call the smart contract
    alert('Minting NFT... (This would upload to IPFS and mint on Base blockchain)');
    
    // Save the artwork
    downloadArt();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">NFT Creation Studio</h1>
          <p className="text-gray-600 dark:text-gray-400">Create your digital artwork and mint it as an NFT on Base</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tools Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Drawing Tools */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Tools</h3>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setTool('brush')}
                  className={`p-3 rounded-lg transition-colors ${
                    tool === 'brush'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Brush"
                >
                  <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>

                <button
                  onClick={() => setTool('eraser')}
                  className={`p-3 rounded-lg transition-colors ${
                    tool === 'eraser'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Eraser"
                >
                  <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <button
                  onClick={() => setTool('line')}
                  className={`p-3 rounded-lg transition-colors ${
                    tool === 'line'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Line"
                >
                  <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19l14-14" />
                  </svg>
                </button>

                <button
                  onClick={() => setTool('rectangle')}
                  className={`p-3 rounded-lg transition-colors ${
                    tool === 'rectangle'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Rectangle"
                >
                  <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="4" y="4" width="16" height="16" strokeWidth={2} />
                  </svg>
                </button>

                <button
                  onClick={() => setTool('circle')}
                  className={`p-3 rounded-lg transition-colors ${
                    tool === 'circle'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Circle"
                >
                  <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="8" strokeWidth={2} />
                  </svg>
                </button>

                <button
                  onClick={() => setTool('fill')}
                  className={`p-3 rounded-lg transition-colors ${
                    tool === 'fill'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Fill"
                >
                  <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 11h-8v8h8v-8zm4 8V9c0-1.1-.9-2-2-2h-4V5c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H3c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2z" />
                  </svg>
                </button>

                <button
                  onClick={() => setTool('eyedropper')}
                  className={`p-3 rounded-lg transition-colors ${
                    tool === 'eyedropper'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Color Picker"
                >
                  <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Brush Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Brush Settings</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Size: {brushSize}px</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Opacity: {Math.round(opacity * 100)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Color Palette */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Colors</h3>
              
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-5 gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-full aspect-square rounded border-2 transition-transform hover:scale-110 ${
                      color === c ? 'border-blue-600 scale-110' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Actions</h3>
              
              <div className="flex gap-2">
                <button
                  onClick={undo}
                  disabled={historyStep <= 0}
                  className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Undo
                </button>
                <button
                  onClick={redo}
                  disabled={historyStep >= history.length - 1}
                  className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Redo
                </button>
              </div>

              <button
                onClick={clearCanvas}
                className="w-full px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-colors"
              >
                Clear Canvas
              </button>

              <button
                onClick={downloadArt}
                className="w-full px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors"
              >
                Download PNG
              </button>

              <button
                onClick={mintNFT}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
              >
                Mint as NFT
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="border-2 border-gray-300 dark:border-gray-600 rounded cursor-crosshair bg-white"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>

              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-2"><strong>Tips:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use the brush tool to draw freely</li>
                  <li>Hold down and drag to create shapes</li>
                  <li>Use the eyedropper to pick colors from your canvas</li>
                  <li>Fill tool floods areas with color</li>
                  <li>Download your art or mint it directly as an NFT on Base</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
