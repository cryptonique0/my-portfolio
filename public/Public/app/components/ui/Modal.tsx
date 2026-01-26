/**
 * Modal/Dialog Component
 * For displaying overlays and modals
 */

import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeButton?: boolean;
  children: React.ReactNode;
}

const sizeStyles = {
  sm: 'w-full sm:max-w-sm',
  md: 'w-full sm:max-w-md',
  lg: 'w-full sm:max-w-lg',
  xl: 'w-full sm:max-w-xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeButton = true,
  children,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.currentTarget === e.target) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="
        backdrop:bg-black/50 backdrop:backdrop-blur-sm
        rounded-xl shadow-2xl
        max-h-[90vh] overflow-y-auto
        bg-white dark:bg-slate-800
        border border-slate-200 dark:border-slate-700
      "
    >
      <div className={sizeStyles[size]}>
        {(title || closeButton) && (
          <div className="flex items-center justify-between gap-4 p-6 border-b border-slate-200 dark:border-slate-700">
            {title && <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>}
            {closeButton && (
              <button
                onClick={onClose}
                className="
                  flex-shrink-0
                  p-1 rounded-lg
                  text-slate-500 hover:text-slate-900
                  dark:text-slate-400 dark:hover:text-white
                  hover:bg-slate-100 dark:hover:bg-slate-700
                  transition-colors duration-200
                "
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </dialog>
  );
};

/**
 * Alert Component
 */
type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const alertStyles: Record<AlertVariant, string> = {
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
  success:
    'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100',
  warning:
    'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100',
  error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
};

const iconMap: Record<AlertVariant, string> = {
  info: 'ℹ️',
  success: '✓',
  warning: '⚠️',
  error: '✕',
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  onClose,
  action,
}) => {
  return (
    <div
      className={`
        flex items-start gap-4 p-4 rounded-lg border-2
        ${alertStyles[variant]}
        animate-in fade-in slide-in-from-top-2 duration-200
      `}
    >
      <span className="text-2xl flex-shrink-0">{iconMap[variant]}</span>
      <div className="flex-1 min-w-0">
        {title && <h3 className="font-bold mb-1">{title}</h3>}
        <p className="text-sm opacity-90">{message}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="flex-shrink-0 font-semibold hover:opacity-75 transition-opacity"
        >
          {action.label}
        </button>
      )}
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Close"
        >
          ✕
        </button>
      )}
    </div>
  );
};

/**
 * Tooltip Component
 */
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
}) => {
  const positionStyles = {
    top: 'bottom-full mb-2 -translate-x-1/2 left-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
    bottom: 'top-full mt-2 -translate-x-1/2 left-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div className="group relative inline-block w-fit">
      {children}
      <div
        className={`
          absolute ${positionStyles[position]}
          px-3 py-1.5 rounded-lg
          bg-slate-900 dark:bg-white
          text-white dark:text-slate-900
          text-xs font-semibold
          opacity-0 group-hover:opacity-100
          pointer-events-none transition-opacity duration-200
          whitespace-nowrap
          shadow-lg
        `}
      >
        {content}
      </div>
    </div>
  );
};
