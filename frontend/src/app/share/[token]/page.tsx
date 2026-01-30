'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AlertTriangle, Lock, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { ShareLink, FilteredDashboardData } from '@/types/sharing';
import { NodeHealthBadge } from '@/components/nodes';

interface SharedDashboardPageProps {}

export default function SharedDashboardPage({}: SharedDashboardPageProps) {
  const params = useParams();
  const token = params.token as string;
  
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [dashboardData, setDashboardData] = useState<FilteredDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [authPassword, setAuthPassword] = useState('');

  useEffect(() => {
    loadSharedDashboard();
  }, [token]);

  const loadSharedDashboard = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation - check if token exists
      const isValidToken = token?.startsWith('share_');
      
      if (!isValidToken) {
        throw new Error('Invalid share link');
      }

      // Mock share link data
      const mockShareLink: ShareLink = {
        id: '1',
        token,
        name: 'Public Dashboard View',
        config: {
          permissions: ['stats', 'commands'],
          type: 'public',
          allowEmbedding: true,
          requireAuth: false,
        },
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-25'),
        accessCount: 42,
        lastAccessedAt: new Date(),
        isActive: true,
      };

      // Check if link is expired
      if (mockShareLink.config.expiresAt && new Date() > mockShareLink.config.expiresAt) {
        throw new Error('This share link has expired');
      }

      // Check if link is active
      if (!mockShareLink.isActive) {
        throw new Error('This share link has been disabled');
      }

      setShareLink(mockShareLink);

      // Check if auth is required
      if (mockShareLink.config.requireAuth) {
        setRequiresAuth(true);
        return;
      }

      // Load filtered dashboard data based on permissions
      await loadDashboardData(mockShareLink.config.permissions);

      // Track access
      await trackAccess(token);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shared dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async (permissions: string[]) => {
    // TODO: Replace with actual API call that filters data based on permissions
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockData: FilteredDashboardData = {};

    if (permissions.includes('stats') || permissions.includes('full')) {
      mockData.stats = {
        totalAgents: 12,
        runningAgents: 8,
        totalTasks: 156,
        completedTasks: 142,
      };
    }

    if (permissions.includes('commands') || permissions.includes('full')) {
      mockData.agents = [
        { id: '1', name: 'Claude Code', status: 'running', type: 'claude-code' },
        { id: '2', name: 'Gemini CLI', status: 'idle', type: 'gemini-cli' },
        { id: '3', name: 'OpenAI Codex', status: 'stopped', type: 'openai-codex' },
      ];
    }

    if (permissions.includes('errors') || permissions.includes('full')) {
      mockData.errors = [
        {
          id: '1',
          message: 'Agent connection timeout',
          timestamp: new Date(),
          severity: 'medium',
        },
        {
          id: '2',
          message: 'Task execution failed',
          timestamp: new Date(Date.now() - 300000),
          severity: 'high',
        },
      ];
    }

    setDashboardData(mockData);
  };

  const trackAccess = async (token: string) => {
    // TODO: Replace with actual API call to track access
    console.log('Tracking access for token:', token);
  };

  const handleAuth = async () => {
    // TODO: Replace with actual authentication check
    if (authPassword === 'demo') {
      setRequiresAuth(false);
      await loadDashboardData(shareLink!.config.permissions);
    } else {
      setError('Invalid password');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading shared dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle size={64} className="mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <a 
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ExternalLink size={16} />
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (requiresAuth) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-gray-900 border border-gray-700 rounded-lg">
          <div className="text-center mb-6">
            <Lock size={48} className="mx-auto mb-4 text-blue-400" />
            <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
            <p className="text-gray-400">This dashboard requires a password to access.</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
            />
            <button
              onClick={handleAuth}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Access Dashboard
            </button>
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Dashboard Daddy</h1>
            <p className="text-sm text-gray-400">Shared Dashboard: {shareLink?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Eye size={16} />
              <span>{shareLink?.accessCount} views</span>
            </div>
            <div className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-sm">
              {shareLink?.config.type}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Stats */}
          {dashboardData?.stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-400">Total Agents</h3>
                <p className="text-2xl font-bold text-white">{dashboardData.stats.totalAgents}</p>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-400">Running Agents</h3>
                <p className="text-2xl font-bold text-green-400">{dashboardData.stats.runningAgents}</p>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-400">Total Tasks</h3>
                <p className="text-2xl font-bold text-white">{dashboardData.stats.totalTasks}</p>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-400">Completed Tasks</h3>
                <p className="text-2xl font-bold text-blue-400">{dashboardData.stats.completedTasks}</p>
              </div>
            </div>
          )}

          {/* Agents */}
          {dashboardData?.agents && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Active Agents</h2>
              <div className="grid gap-4">
                {dashboardData.agents.map((agent) => (
                  <div key={agent.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          agent.status === 'running' ? 'bg-green-400' :
                          agent.status === 'idle' ? 'bg-yellow-400' :
                          'bg-gray-400'
                        }`} />
                        <div>
                          <h3 className="font-medium text-white">{agent.name}</h3>
                          <p className="text-sm text-gray-400">{agent.type}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400 capitalize">{agent.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {dashboardData?.errors && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Recent Errors</h2>
              <div className="space-y-3">
                {dashboardData.errors.map((error) => (
                  <div key={error.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white">{error.message}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {error.timestamp.toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        error.severity === 'high' ? 'bg-red-600/20 text-red-400' :
                        error.severity === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-blue-600/20 text-blue-400'
                      }`}>
                        {error.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Watermark */}
          <div className="text-center text-gray-500 text-sm py-4">
            <p>Powered by Dashboard Daddy • <a href="/" className="text-blue-400 hover:text-blue-300">Create your own dashboard</a></p>
          </div>
        </div>
      </main>
    </div>
  );
}