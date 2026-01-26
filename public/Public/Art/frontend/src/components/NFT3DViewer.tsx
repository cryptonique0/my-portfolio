import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useGLTF, Center } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

interface NFT3DViewerProps {
  modelUrl: string;
  title?: string;
  autoRotate?: boolean;
  className?: string;
}

const Model: React.FC<{ url: string; autoRotate: boolean }> = ({ url, autoRotate }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  // Try to load GLTF/GLB model, fallback to creating a cube if fails
  let scene;
  try {
    const gltf = useGLTF(url);
    scene = gltf.scene;
  } catch (error) {
    // Fallback to a placeholder cube
    scene = null;
  }

  useFrame((state, delta) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  if (scene) {
    return (
      <Center>
        <primitive ref={meshRef} object={scene} scale={1.5} />
      </Center>
    );
  }

  // Fallback placeholder cube
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#3b82f6" metalness={0.8} roughness={0.2} />
    </mesh>
  );
};

const Placeholder: React.FC = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#6366f1" wireframe />
  </mesh>
);

export const NFT3DViewer: React.FC<NFT3DViewerProps> = ({
  modelUrl,
  title,
  autoRotate = true,
  className = ''
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden ${className}`}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleFullscreen}
          className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
          title="Toggle fullscreen"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </motion.button>
      </div>

      {/* Title */}
      {title && (
        <div className="absolute top-4 left-4 z-10">
          <h3 className="text-white font-bold text-lg bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
            {title}
          </h3>
        </div>
      )}

      {/* 3D Canvas */}
      <div className="w-full h-full min-h-[400px]">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <Suspense fallback={<Placeholder />}>
            <Model url={modelUrl} autoRotate={autoRotate} />
          </Suspense>
          
          <Environment preset="sunset" />
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            minDistance={2}
            maxDistance={10}
          />
        </Canvas>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg text-white text-xs">
          🖱️ Drag to rotate • Scroll to zoom • Right-click to pan
        </div>
      </div>
    </motion.div>
  );
};
