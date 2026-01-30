'use client';

import { useState, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, Archive, ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeAction {
  icon: React.ReactNode;
  color: string;
  label: string;
  onAction: () => void;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  className?: string;
  threshold?: number;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction = {
    icon: <Trash2 className="w-5 h-5" />,
    color: 'bg-red-500',
    label: 'Delete',
    onAction: () => {},
  },
  rightAction = {
    icon: <Check className="w-5 h-5" />,
    color: 'bg-green-500',
    label: 'Complete',
    onAction: () => {},
  },
  className = '',
  threshold = 100,
}: SwipeableCardProps) {
  const [offset, setOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handlers = useSwipeable({
    onSwiping: (e) => {
      setIsSwiping(true);
      setOffset(e.deltaX);
    },
    onSwipedLeft: () => {
      if (Math.abs(offset) > threshold) {
        setIsRemoving(true);
        setOffset(-300);
        setTimeout(() => {
          leftAction.onAction();
          onSwipeLeft?.();
        }, 200);
      } else {
        setOffset(0);
      }
      setIsSwiping(false);
    },
    onSwipedRight: () => {
      if (Math.abs(offset) > threshold) {
        setIsRemoving(true);
        setOffset(300);
        setTimeout(() => {
          rightAction.onAction();
          onSwipeRight?.();
        }, 200);
      } else {
        setOffset(0);
      }
      setIsSwiping(false);
    },
    onSwiped: () => {
      if (Math.abs(offset) <= threshold) {
        setOffset(0);
      }
      setIsSwiping(false);
    },
    trackMouse: true,
    trackTouch: true,
    preventScrollOnSwipe: true,
  });

  const getActionOpacity = (direction: 'left' | 'right') => {
    const absOffset = Math.abs(offset);
    if (direction === 'left' && offset < 0) {
      return Math.min(absOffset / threshold, 1);
    }
    if (direction === 'right' && offset > 0) {
      return Math.min(absOffset / threshold, 1);
    }
    return 0;
  };

  return (
    <AnimatePresence>
      {!isRemoving && (
        <motion.div
          initial={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className={`relative overflow-hidden ${className}`}
        >
          {/* Left action background (shows when swiping right) */}
          <div
            className={`absolute inset-y-0 left-0 flex items-center justify-start pl-4 ${rightAction.color}`}
            style={{
              opacity: getActionOpacity('right'),
              width: Math.max(offset, 0),
            }}
          >
            <div className="flex items-center gap-2 text-white">
              {rightAction.icon}
              <span className="font-medium">{rightAction.label}</span>
            </div>
          </div>

          {/* Right action background (shows when swiping left) */}
          <div
            className={`absolute inset-y-0 right-0 flex items-center justify-end pr-4 ${leftAction.color}`}
            style={{
              opacity: getActionOpacity('left'),
              width: Math.max(-offset, 0),
            }}
          >
            <div className="flex items-center gap-2 text-white">
              <span className="font-medium">{leftAction.label}</span>
              {leftAction.icon}
            </div>
          </div>

          {/* Main card content */}
          <div
            ref={cardRef}
            {...handlers}
            className="relative bg-gray-800 cursor-grab active:cursor-grabbing"
            style={{
              transform: `translateX(${offset}px)`,
              transition: isSwiping ? 'none' : 'transform 0.2s ease-out',
            }}
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Preset configurations
export const SwipeableTaskCard = ({
  children,
  onComplete,
  onDelete,
  className,
}: {
  children: React.ReactNode;
  onComplete?: () => void;
  onDelete?: () => void;
  className?: string;
}) => (
  <SwipeableCard
    className={className}
    rightAction={{
      icon: <Check className="w-5 h-5" />,
      color: 'bg-green-500',
      label: 'Complete',
      onAction: onComplete || (() => {}),
    }}
    leftAction={{
      icon: <Trash2 className="w-5 h-5" />,
      color: 'bg-red-500',
      label: 'Delete',
      onAction: onDelete || (() => {}),
    }}
    onSwipeRight={onComplete}
    onSwipeLeft={onDelete}
  >
    {children}
  </SwipeableCard>
);

export const SwipeableArchiveCard = ({
  children,
  onArchive,
  onDelete,
  className,
}: {
  children: React.ReactNode;
  onArchive?: () => void;
  onDelete?: () => void;
  className?: string;
}) => (
  <SwipeableCard
    className={className}
    rightAction={{
      icon: <Archive className="w-5 h-5" />,
      color: 'bg-blue-500',
      label: 'Archive',
      onAction: onArchive || (() => {}),
    }}
    leftAction={{
      icon: <Trash2 className="w-5 h-5" />,
      color: 'bg-red-500',
      label: 'Delete',
      onAction: onDelete || (() => {}),
    }}
    onSwipeRight={onArchive}
    onSwipeLeft={onDelete}
  >
    {children}
  </SwipeableCard>
);
