import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type GalleryView = 'grid' | 'masonry' | 'list' | 'carousel';

interface GalleryItem {
  id: string;
  image: string;
  title: string;
  creator?: string;
  price?: string;
  [key: string]: any;
}

interface NFTGalleryProps {
  items: GalleryItem[];
  onItemClick?: (item: GalleryItem) => void;
  defaultView?: GalleryView;
  className?: string;
}

export const NFTGallery: React.FC<NFTGalleryProps> = ({
  items,
  onItemClick,
  defaultView = 'grid',
  className = ''
}) => {
  const [view, setView] = useState<GalleryView>(defaultView);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const viewOptions: { id: GalleryView; icon: string; label: string }[] = [
    { id: 'grid', icon: '▦', label: 'Grid' },
    { id: 'masonry', icon: '▦', label: 'Masonry' },
    { id: 'list', icon: '☰', label: 'List' },
    { id: 'carousel', icon: '◉', label: 'Carousel' }
  ];

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ y: -8, scale: 1.02 }}
          onClick={() => onItemClick?.(item)}
          onMouseEnter={() => setHoveredId(item.id)}
          onMouseLeave={() => setHoveredId(null)}
          className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg cursor-pointer border border-gray-200 dark:border-gray-700"
        >
          <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            />
            <AnimatePresence>
              {hoveredId === item.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4"
                >
                  <div className="text-white">
                    <p className="text-xs opacity-75">Quick View</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-gray-900 dark:text-white truncate">{item.title}</h3>
            {item.creator && (
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{item.creator}</p>
            )}
            {item.price && (
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-2">
                {item.price}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderMasonryView = () => (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => onItemClick?.(item)}
          className="break-inside-avoid bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg cursor-pointer border border-gray-200 dark:border-gray-700 mb-6"
        >
          <img
            src={item.image}
            alt={item.title}
            className="w-full object-cover"
            style={{ height: 'auto' }}
          />
          <div className="p-4">
            <h3 className="font-bold text-gray-900 dark:text-white">{item.title}</h3>
            {item.creator && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.creator}</p>
            )}
            {item.price && (
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-2">
                {item.price}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          whileHover={{ x: 4 }}
          onClick={() => onItemClick?.(item)}
          className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg cursor-pointer border border-gray-200 dark:border-gray-700 flex"
        >
          <div className="w-48 h-48 flex-shrink-0 bg-gray-100 dark:bg-gray-900">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{item.title}</h3>
              {item.creator && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">{item.creator}</p>
              )}
            </div>
            {item.price && (
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {item.price}
              </p>
            )}
          </div>
          <div className="p-6 flex items-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderCarouselView = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const next = () => setCurrentIndex((prev) => (prev + 1) % items.length);
    const prev = () => setCurrentIndex((p) => (p - 1 + items.length) % items.length);

    return (
      <div className="relative max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            onClick={() => onItemClick?.(items[currentIndex])}
            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
          >
            <div className="aspect-video bg-gray-100 dark:bg-gray-900">
              <img
                src={items[currentIndex].image}
                alt={items[currentIndex].title}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-8">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                {items[currentIndex].title}
              </h3>
              {items[currentIndex].creator && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                  {items[currentIndex].creator}
                </p>
              )}
              {items[currentIndex].price && (
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-4">
                  {items[currentIndex].price}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg"
        >
          <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg"
        >
          <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-blue-600 w-8'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      {/* View Selector */}
      <div className="flex items-center justify-end gap-2 mb-6">
        {viewOptions.map((option) => (
          <motion.button
            key={option.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView(option.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === option.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            title={option.label}
          >
            <span className="mr-2">{option.icon}</span>
            <span className="hidden sm:inline">{option.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Gallery Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {view === 'grid' && renderGridView()}
          {view === 'masonry' && renderMasonryView()}
          {view === 'list' && renderListView()}
          {view === 'carousel' && renderCarouselView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
