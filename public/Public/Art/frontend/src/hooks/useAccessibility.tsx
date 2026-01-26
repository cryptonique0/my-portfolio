import { useEffect, useRef } from 'react';

/**
 * Hook to manage focus trap within a modal or dialog
 */
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTab);
    };
  }, [isActive]);

  return containerRef;
};

/**
 * Hook to announce messages to screen readers
 */
export const useAnnouncer = () => {
  const announcerRef = useRef<HTMLDivElement>(null);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcerRef.current) {
      announcerRef.current.setAttribute('aria-live', priority);
      announcerRef.current.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  return { announcerRef, announce };
};

/**
 * Hook to handle keyboard navigation
 */
export const useKeyboardNavigation = (items: any[], onSelect: (index: number) => void) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
          break;
        case 'Enter':
          if (selectedIndex >= 0) {
            e.preventDefault();
            onSelect(selectedIndex);
          }
          break;
        case 'Escape':
          setSelectedIndex(-1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items.length, selectedIndex, onSelect]);

  return { selectedIndex, setSelectedIndex };
};

/**
 * Skip to main content link component
 */
export const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
    >
      Skip to main content
    </a>
  );
};

/**
 * Screen reader only text component
 */
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
};

/**
 * Live region for dynamic content announcements
 */
export const LiveRegion: React.FC<{
  children: React.ReactNode;
  priority?: 'polite' | 'assertive';
}> = ({ children, priority = 'polite' }) => {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {children}
    </div>
  );
};

import { useState } from 'react';
