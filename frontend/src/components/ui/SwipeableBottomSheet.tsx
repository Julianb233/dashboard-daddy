'use client';

import { useState, useEffect, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GripHorizontal } from 'lucide-react';

interface SwipeableBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[]; // Heights as percentages (e.g., [25, 50, 90])
  initialSnap?: number;
  showHandle?: boolean;
  showCloseButton?: boolean;
}

export function SwipeableBottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [25, 50, 90],
  initialSnap = 1,
  showHandle = true,
  showCloseButton = true,
}: SwipeableBottomSheetProps) {
  const [currentSnapIndex, setCurrentSnapIndex] = useState(initialSnap);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const currentHeight = snapPoints[currentSnapIndex];

  useEffect(() => {
    if (isOpen) {
      setCurrentSnapIndex(initialSnap);
      setDragOffset(0);
    }
  }, [isOpen, initialSnap]);

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handlers = useSwipeable({
    onSwiping: (e) => {
      setIsDragging(true);
      // Only respond to vertical swipes
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        setDragOffset(e.deltaY);
      }
    },
    onSwipedDown: () => {
      setIsDragging(false);
      const threshold = 50;
      
      if (dragOffset > threshold) {
        // Snap to lower point or close
        if (currentSnapIndex > 0) {
          setCurrentSnapIndex(currentSnapIndex - 1);
        } else {
          onClose();
        }
      }
      setDragOffset(0);
    },
    onSwipedUp: () => {
      setIsDragging(false);
      const threshold = 50;
      
      if (dragOffset < -threshold) {
        // Snap to higher point
        if (currentSnapIndex < snapPoints.length - 1) {
          setCurrentSnapIndex(currentSnapIndex + 1);
        }
      }
      setDragOffset(0);
    },
    onSwiped: () => {
      setIsDragging(false);
      setDragOffset(0);
    },
    trackTouch: true,
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  const effectiveHeight = Math.max(
    0,
    Math.min(100, currentHeight - (dragOffset / (typeof window !== 'undefined' ? window.innerHeight : 800)) * 100)
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: `${100 - effectiveHeight}%` }}
            exit={{ y: '100%' }}
            transition={{ 
              type: isDragging ? 'tween' : 'spring',
              duration: isDragging ? 0 : 0.3,
              bounce: 0.2,
            }}
            className="fixed bottom-0 left-0 right-0 bg-gray-900 rounded-t-3xl z-50 flex flex-col"
            style={{ 
              height: '100vh',
              touchAction: 'none',
            }}
          >
            {/* Handle area - draggable */}
            <div
              {...handlers}
              className="flex-shrink-0 pt-3 pb-2 cursor-grab active:cursor-grabbing"
            >
              {showHandle && (
                <div className="w-12 h-1.5 bg-gray-600 rounded-full mx-auto" />
              )}
            </div>

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-800">
                <h3 className="text-lg font-semibold text-white">
                  {title}
                </h3>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4">
              {children}
            </div>

            {/* Snap point indicators */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2">
              {snapPoints.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSnapIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSnapIndex
                      ? 'bg-blue-500'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Quick action sheet variant
export function QuickActionSheet({
  isOpen,
  onClose,
  title,
  actions,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actions: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    variant?: 'default' | 'danger';
  }>;
}) {
  return (
    <SwipeableBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      snapPoints={[40]}
      initialSnap={0}
    >
      <div className="grid grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              action.onClick();
              onClose();
            }}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${
              action.variant === 'danger'
                ? 'hover:bg-red-500/20 text-red-400'
                : 'hover:bg-gray-800 text-gray-300'
            }`}
          >
            <div className={`p-3 rounded-full ${
              action.variant === 'danger' ? 'bg-red-500/20' : 'bg-gray-800'
            }`}>
              {action.icon}
            </div>
            <span className="text-sm">{action.label}</span>
          </button>
        ))}
      </div>
    </SwipeableBottomSheet>
  );
}
