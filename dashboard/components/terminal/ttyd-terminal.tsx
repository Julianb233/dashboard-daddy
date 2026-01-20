'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Maximize2,
  Minimize2,
  RefreshCw,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface TtydTerminalProps {
  url?: string;
  className?: string;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

/**
 * ttyd terminal iframe wrapper
 * Embeds the ttyd web terminal with controls for refresh, fullscreen, and external link
 */
export function TtydTerminal({
  url = 'https://terminal.dashboard-daddy.com',
  className,
  onFullscreenChange,
}: TtydTerminalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle iframe load
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  // Handle iframe error
  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  // Refresh the terminal
  const handleRefresh = useCallback(() => {
    if (iframeRef.current) {
      setIsLoading(true);
      setHasError(false);
      iframeRef.current.src = iframeRef.current.src;
    }
  }, []);

  // Toggle fullscreen
  const handleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
        onFullscreenChange?.(true);
      }).catch(console.error);
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        onFullscreenChange?.(false);
      }).catch(console.error);
    }
  }, [onFullscreenChange]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      onFullscreenChange?.(isFs);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [onFullscreenChange]);

  // Open in new tab
  const handleOpenExternal = useCallback(() => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [url]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-col h-full bg-[#0d1117] rounded-lg overflow-hidden border border-gray-800',
        isFullscreen && 'rounded-none border-0',
        className
      )}
    >
      {/* Terminal header / toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-gray-800">
        <div className="flex items-center gap-4">
          {/* macOS-style window controls (decorative) */}
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
          </div>

          <span className="text-sm font-medium text-gray-300">
            Web Terminal
          </span>

          {isLoading && (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-xs">Connecting...</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
            title="Refresh terminal"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleFullscreen}
            className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenExternal}
            className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Terminal content */}
      <div className="flex-1 relative">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0d1117] z-10">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">Loading terminal...</span>
            </div>
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0d1117] z-10">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <span className="text-sm">Failed to load terminal</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* ttyd iframe */}
        <iframe
          ref={iframeRef}
          src={url}
          onLoad={handleLoad}
          onError={handleError}
          className="w-full h-full border-0"
          title="Web Terminal"
          allow="clipboard-read; clipboard-write"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      </div>
    </div>
  );
}

export default TtydTerminal;
