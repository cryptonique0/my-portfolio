import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import '@google/model-viewer';

interface ARPreviewProps {
  modelUrl: string;
  iosUrl?: string;
  poster?: string;
  alt: string;
  title?: string;
  className?: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

export const ARPreview: React.FC<ARPreviewProps> = ({
  modelUrl,
  iosUrl,
  poster,
  alt,
  title,
  className = ''
}) => {
  const modelViewerRef = useRef<any>(null);

  useEffect(() => {
    // Load model-viewer polyfill if needed
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js';
    
    if (!document.querySelector(`script[src="${script.src}"]`)) {
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden ${className}`}
    >
      {/* Title */}
      {title && (
        <div className="absolute top-4 left-4 z-20">
          <h3 className="text-gray-900 dark:text-white font-bold text-lg bg-white/80 dark:bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
            {title}
          </h3>
        </div>
      )}

      {/* AR Badge */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
          </svg>
          AR Ready
        </div>
      </div>

      {/* Model Viewer */}
      <model-viewer
        ref={modelViewerRef}
        src={modelUrl}
        ios-src={iosUrl || modelUrl}
        poster={poster}
        alt={alt}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        shadow-intensity="1"
        environment-image="neutral"
        exposure="1"
        className="w-full h-full min-h-[400px]"
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
      >
        {/* AR Button */}
        <button
          slot="ar-button"
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
          </svg>
          View in AR
        </button>

        {/* Loading Indicator */}
        <div slot="progress-bar" className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading 3D model...</p>
          </div>
        </div>
      </model-viewer>

      {/* Instructions */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg text-white text-xs max-w-xs text-center">
          🖱️ Drag to rotate • Scroll to zoom • Tap AR button to view in your space
        </div>
      </div>
    </motion.div>
  );
};
