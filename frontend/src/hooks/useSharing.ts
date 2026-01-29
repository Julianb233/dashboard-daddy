'use client';

import { useState, useEffect } from 'react';
import { ShareLink, CreateShareRequest, ShareResponse, ShareAccess } from '@/types/sharing';

interface SharingState {
  shareLinks: ShareLink[];
  loading: boolean;
  error: string | null;
}

export function useSharing() {
  const [state, setState] = useState<SharingState>({
    shareLinks: [],
    loading: false,
    error: null,
  });

  // Mock API functions - replace with actual API calls
  const fetchShareLinks = async (): Promise<ShareLink[]> => {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
      {
        id: '1',
        token: 'share_abc123def456',
        name: 'Public Dashboard',
        config: {
          permissions: ['stats', 'commands'],
          type: 'public',
          allowEmbedding: true,
          requireAuth: false,
        },
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-25'),
        accessCount: 42,
        lastAccessedAt: new Date('2024-01-25'),
        isActive: true,
      },
      {
        id: '2',
        token: 'share_xyz789uvw012',
        name: 'Internal Team View',
        config: {
          permissions: ['stats', 'commands', 'errors'],
          type: 'private',
          expiresAt: new Date('2024-03-01'),
          allowEmbedding: false,
          requireAuth: true,
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        accessCount: 8,
        lastAccessedAt: new Date('2024-01-24'),
        isActive: true,
      },
    ];
  };

  const createShareLink = async (request: CreateShareRequest): Promise<ShareResponse> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const token = `share_${Math.random().toString(36).substr(2, 16)}`;
      const shareLink: ShareLink = {
        id: Date.now().toString(),
        token,
        name: request.name,
        config: request.config,
        createdAt: new Date(),
        updatedAt: new Date(),
        accessCount: 0,
        isActive: true,
      };

      const fullUrl = `${window.location.origin}/share/${token}`;
      const embedCode = `<iframe src="${fullUrl}" width="100%" height="600" frameborder="0"></iframe>`;

      setState(prev => ({ 
        ...prev, 
        shareLinks: [...prev.shareLinks, shareLink],
        loading: false 
      }));

      return { shareLink, fullUrl, embedCode };
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to create share link' 
      }));
      throw error;
    }
  };

  const deleteShareLink = async (shareId: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState(prev => ({ 
        ...prev, 
        shareLinks: prev.shareLinks.filter(link => link.id !== shareId),
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to delete share link' 
      }));
      throw error;
    }
  };

  const toggleShareLink = async (shareId: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState(prev => ({ 
        ...prev, 
        shareLinks: prev.shareLinks.map(link => 
          link.id === shareId ? { ...link, isActive: !link.isActive } : link
        ),
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to toggle share link' 
      }));
      throw error;
    }
  };

  const getShareAccess = async (shareId: string): Promise<ShareAccess[]> => {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: '1',
        shareId,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '192.168.1.100',
        accessedAt: new Date('2024-01-25T10:30:00'),
        referrer: 'https://google.com',
      },
      {
        id: '2',
        shareId,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        ipAddress: '10.0.0.50',
        accessedAt: new Date('2024-01-25T09:15:00'),
      },
    ];
  };

  useEffect(() => {
    const loadShareLinks = async () => {
      setState(prev => ({ ...prev, loading: true }));
      try {
        const links = await fetchShareLinks();
        setState(prev => ({ ...prev, shareLinks: links, loading: false }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Failed to load share links' 
        }));
      }
    };

    loadShareLinks();
  }, []);

  return {
    shareLinks: state.shareLinks,
    loading: state.loading,
    error: state.error,
    createShareLink,
    deleteShareLink,
    toggleShareLink,
    getShareAccess,
  };
}