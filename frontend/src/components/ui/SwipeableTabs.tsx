'use client';

import { useState, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  badge?: number | string;
}

interface SwipeableTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'pills' | 'underline' | 'cards';
  className?: string;
}

export function SwipeableTabs({
  tabs,
  defaultTab,
  onChange,
  variant = 'underline',
  className = '',
}: SwipeableTabsProps) {
  const [activeIndex, setActiveIndex] = useState(() => {
    const index = tabs.findIndex(t => t.id === defaultTab);
    return index >= 0 ? index : 0;
  });
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const goToTab = (index: number) => {
    if (index < 0 || index >= tabs.length) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    onChange?.(tabs[index].id);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => goToTab(activeIndex + 1),
    onSwipedRight: () => goToTab(activeIndex - 1),
    trackMouse: false,
    trackTouch: true,
    preventScrollOnSwipe: true,
    swipeDuration: 500,
    delta: 50,
  });

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const getTabStyles = (isActive: boolean) => {
    switch (variant) {
      case 'pills':
        return isActive
          ? 'bg-blue-500 text-white'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700';
      case 'cards':
        return isActive
          ? 'bg-gray-800 text-white border-blue-500 border-b-2'
          : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border-transparent border-b-2';
      case 'underline':
      default:
        return isActive
          ? 'text-white border-blue-500'
          : 'text-gray-400 border-transparent hover:text-gray-300';
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Tab headers */}
      <div className={`flex gap-1 ${variant === 'underline' ? 'border-b border-gray-800' : ''}`}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => goToTab(index)}
            className={`
              flex items-center gap-2 px-4 py-2 transition-all
              ${variant === 'pills' ? 'rounded-lg' : ''}
              ${variant === 'underline' ? 'border-b-2 -mb-px' : ''}
              ${variant === 'cards' ? 'rounded-t-lg' : ''}
              ${getTabStyles(index === activeIndex)}
            `}
          >
            {tab.icon}
            <span className="font-medium">{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={`
                px-2 py-0.5 text-xs rounded-full
                ${index === activeIndex 
                  ? 'bg-white/20 text-white' 
                  : 'bg-gray-700 text-gray-300'}
              `}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        ref={containerRef}
        {...handlers}
        className="relative overflow-hidden flex-1 min-h-0"
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="w-full h-full"
          >
            {tabs[activeIndex].content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Swipe indicator dots */}
      <div className="flex justify-center gap-2 py-3">
        {tabs.map((_, index) => (
          <button
            key={index}
            onClick={() => goToTab(index)}
            className={`
              w-2 h-2 rounded-full transition-all
              ${index === activeIndex 
                ? 'bg-blue-500 w-4' 
                : 'bg-gray-600 hover:bg-gray-500'}
            `}
          />
        ))}
      </div>
    </div>
  );
}

// Vertical swipeable stack (like Tinder cards)
interface SwipeableStackProps {
  items: Array<{
    id: string;
    content: React.ReactNode;
  }>;
  onSwipeLeft?: (id: string) => void;
  onSwipeRight?: (id: string) => void;
  onSwipeUp?: (id: string) => void;
  emptyContent?: React.ReactNode;
}

export function SwipeableStack({
  items,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  emptyContent = <div className="text-gray-500 text-center p-8">No more items</div>,
}: SwipeableStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'up' | null>(null);

  const currentItem = items[currentIndex];

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (!currentItem) return;
      setExitDirection('left');
      setTimeout(() => {
        onSwipeLeft?.(currentItem.id);
        setCurrentIndex(i => i + 1);
        setExitDirection(null);
      }, 200);
    },
    onSwipedRight: () => {
      if (!currentItem) return;
      setExitDirection('right');
      setTimeout(() => {
        onSwipeRight?.(currentItem.id);
        setCurrentIndex(i => i + 1);
        setExitDirection(null);
      }, 200);
    },
    onSwipedUp: () => {
      if (!currentItem) return;
      setExitDirection('up');
      setTimeout(() => {
        onSwipeUp?.(currentItem.id);
        setCurrentIndex(i => i + 1);
        setExitDirection(null);
      }, 200);
    },
    trackMouse: true,
    trackTouch: true,
    preventScrollOnSwipe: true,
  });

  if (!currentItem) {
    return emptyContent;
  }

  const getExitAnimation = () => {
    switch (exitDirection) {
      case 'left':
        return { x: -500, rotate: -30, opacity: 0 };
      case 'right':
        return { x: 500, rotate: 30, opacity: 0 };
      case 'up':
        return { y: -500, opacity: 0 };
      default:
        return { x: 0, y: 0, rotate: 0, opacity: 1 };
    }
  };

  return (
    <div className="relative w-full h-[400px]">
      {/* Stack preview (next cards) */}
      {items.slice(currentIndex + 1, currentIndex + 3).map((item, offset) => (
        <div
          key={item.id}
          className="absolute inset-0 bg-gray-800 rounded-2xl"
          style={{
            transform: `scale(${1 - (offset + 1) * 0.05}) translateY(${(offset + 1) * 10}px)`,
            zIndex: -offset - 1,
            opacity: 1 - (offset + 1) * 0.3,
          }}
        />
      ))}

      {/* Current card */}
      <motion.div
        {...handlers}
        animate={getExitAnimation()}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="absolute inset-0 bg-gray-800 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ zIndex: 1 }}
      >
        {currentItem.content}
      </motion.div>

      {/* Action hints */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 text-sm text-gray-500">
        <span>← Reject</span>
        <span>|</span>
        <span>Accept →</span>
      </div>
    </div>
  );
}
