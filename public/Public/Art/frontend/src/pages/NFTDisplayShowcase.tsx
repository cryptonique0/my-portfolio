import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NFT3DViewer } from '../components/NFT3DViewer';
import { EnhancedMediaPlayer } from '../components/EnhancedMediaPlayer';
import { ZoomableImage } from '../components/ZoomableImage';
import { ARPreview } from '../components/ARPreview';
import { NFTGallery } from '../components/NFTGallery';

const NFTDisplayShowcase: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string>('all');

  // Sample NFT data for gallery
  const sampleNFTs = [
    {
      id: '1',
      image: 'https://picsum.photos/seed/nft1/400/400',
      title: 'Abstract Dreams #1',
      creator: 'Digital Artist',
      price: '2.5 STX'
    },
    {
      id: '2',
      image: 'https://picsum.photos/seed/nft2/400/600',
      title: 'Cyber Punk City',
      creator: 'Future Vision',
      price: '5.0 STX'
    },
    {
      id: '3',
      image: 'https://picsum.photos/seed/nft3/400/300',
      title: 'Nature Flow',
      creator: 'EcoArt',
      price: '1.8 STX'
    },
    {
      id: '4',
      image: 'https://picsum.photos/seed/nft4/400/500',
      title: 'Digital Waves',
      creator: 'WaveCreator',
      price: '3.2 STX'
    },
    {
      id: '5',
      image: 'https://picsum.photos/seed/nft5/400/400',
      title: 'Cosmic Portal',
      creator: 'SpaceArt',
      price: '4.5 STX'
    },
    {
      id: '6',
      image: 'https://picsum.photos/seed/nft6/400/700',
      title: 'Mountain Majesty',
      creator: 'LandscapeKing',
      price: '2.0 STX'
    }
  ];

  const demos = [
    { id: 'all', title: 'All Features', icon: '🎨' },
    { id: '3d', title: '3D Viewer', icon: '🎲' },
    { id: 'video', title: 'Video Player', icon: '🎬' },
    { id: 'audio', title: 'Audio Player', icon: '🎵' },
    { id: 'zoom', title: 'Zoom & Pan', icon: '🔍' },
    { id: 'ar', title: 'AR Preview', icon: '📱' },
    { id: 'gallery', title: 'Gallery Views', icon: '🖼️' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            NFT Display Features
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Advanced viewing experiences for digital assets
          </p>
        </motion.div>

        {/* Feature Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {demos.map((demo) => (
            <motion.button
              key={demo.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveDemo(demo.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeDemo === demo.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md'
              }`}
            >
              <span className="mr-2">{demo.icon}</span>
              {demo.title}
            </motion.button>
          ))}
        </div>

        {/* Demo Content */}
        <motion.div
          key={activeDemo}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-12"
        >
          {/* 3D Viewer Demo */}
          {(activeDemo === 'all' || activeDemo === '3d') && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                🎲 3D NFT Viewer
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Interactive 3D model viewer with orbit controls, auto-rotate, and fullscreen mode.
                Supports GLTF/GLB formats.
              </p>
              <div className="h-96">
                <NFT3DViewer
                  modelUrl="https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/chair/model.gltf"
                  title="Sample 3D Model"
                />
              </div>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  <strong>Features:</strong> Drag to rotate • Scroll to zoom • Right-click to pan • Fullscreen mode
                </p>
              </div>
            </section>
          )}

          {/* Video Player Demo */}
          {(activeDemo === 'all' || activeDemo === 'video') && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                🎬 Enhanced Video Player
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Custom video player with full controls, seek bar, volume control, and fullscreen support.
              </p>
              <EnhancedMediaPlayer
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                type="video"
                poster="https://picsum.photos/seed/video/800/450"
                title="Sample Video NFT"
              />
              <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-purple-900 dark:text-purple-300">
                  <strong>Features:</strong> Custom controls • Progress bar • Volume slider • Fullscreen • Time display
                </p>
              </div>
            </section>
          )}

          {/* Audio Player Demo */}
          {(activeDemo === 'all' || activeDemo === 'audio') && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                🎵 Audio Player
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Music NFT player with waveform visualization and full playback controls.
              </p>
              <EnhancedMediaPlayer
                src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                type="audio"
                title="Sample Audio NFT"
              />
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-900 dark:text-green-300">
                  <strong>Features:</strong> Play/Pause • Seek • Volume control • Visual waveform
                </p>
              </div>
            </section>
          )}

          {/* Zoom & Pan Demo */}
          {(activeDemo === 'all' || activeDemo === 'zoom') && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                🔍 Zoomable Image Viewer
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                High-resolution image viewer with zoom (up to 5x) and pan capabilities.
              </p>
              <div className="h-96">
                <ZoomableImage
                  src="https://picsum.photos/seed/highres/2000/1500"
                  alt="High Resolution Artwork"
                  title="Sample High-Res NFT"
                />
              </div>
              <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-sm text-orange-900 dark:text-orange-300">
                  <strong>Features:</strong> Zoom in/out buttons • Drag to pan • Scroll to zoom • Double-click toggle • Reset view
                </p>
              </div>
            </section>
          )}

          {/* AR Preview Demo */}
          {(activeDemo === 'all' || activeDemo === 'ar') && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                📱 AR Preview
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                View 3D NFTs in augmented reality using your mobile device. Supports iOS Quick Look and Android Scene Viewer.
              </p>
              <div className="h-96">
                <ARPreview
                  modelUrl="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
                  iosUrl="https://modelviewer.dev/shared-assets/models/Astronaut.usdz"
                  poster="https://modelviewer.dev/shared-assets/models/Astronaut.webp"
                  alt="Astronaut 3D Model"
                  title="AR-Enabled NFT"
                />
              </div>
              <div className="mt-4 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                <p className="text-sm text-pink-900 dark:text-pink-300">
                  <strong>Features:</strong> AR button (mobile) • Auto-rotate • Camera controls • Cross-platform (iOS/Android)
                </p>
              </div>
            </section>
          )}

          {/* Gallery Views Demo */}
          {(activeDemo === 'all' || activeDemo === 'gallery') && (
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                🖼️ Gallery View Options
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Multiple layout options: Grid, Masonry, List, and Carousel views for browsing collections.
              </p>
              <NFTGallery
                items={sampleNFTs}
                onItemClick={(item) => console.log('Clicked:', item)}
                defaultView="grid"
              />
              <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <p className="text-sm text-indigo-900 dark:text-indigo-300">
                  <strong>Layouts:</strong> Grid (2-4 columns) • Masonry (Pinterest-style) • List (detailed) • Carousel (slideshow)
                </p>
              </div>
            </section>
          )}
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready for Production</h3>
            <p className="text-lg opacity-90 mb-6">
              All components are fully responsive, dark mode compatible, and optimized for performance.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                ✅ TypeScript
              </span>
              <span className="px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                ✅ Responsive
              </span>
              <span className="px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                ✅ Dark Mode
              </span>
              <span className="px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                ✅ Accessible
              </span>
              <span className="px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                ✅ Animated
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NFTDisplayShowcase;
