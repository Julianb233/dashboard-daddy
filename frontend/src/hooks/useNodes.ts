'use client';

import { useState, useEffect, useCallback } from 'react';
import { NodeInfo, NodeListResponse, NodeActionRequest } from '@/types/nodes';

interface NodesState {
  nodes: NodeInfo[];
  selectedNodeId: string | null;
  loading: boolean;
  error: string | null;
}

export function useNodes() {
  const [state, setState] = useState<NodesState>({
    nodes: [],
    selectedNodeId: null,
    loading: false,
    error: null,
  });

  // Mock API functions - replace with actual API calls
  const fetchNodes = async (): Promise<NodeListResponse> => {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockNodes: NodeInfo[] = [
      {
        id: 'node-local',
        name: 'Local Development',
        hostname: 'localhost',
        ipAddress: '127.0.0.1',
        port: 8080,
        status: 'connected',
        health: 'healthy',
        version: '1.0.0',
        platform: 'linux',
        architecture: 'x64',
        capabilities: {
          maxAgents: 10,
          supportedAgentTypes: ['claude-code', 'gemini-cli', 'openai-codex'],
          hasGpu: false,
          dockerSupported: true,
          kubernetesSupported: false,
        },
        metrics: {
          cpuUsage: 25.5,
          memoryUsage: 68.2,
          diskUsage: 45.8,
          networkLatency: 1,
          uptime: 86400,
          load: [1.2, 1.5, 1.8],
        },
        lastHeartbeat: new Date(),
        connectedAt: new Date(Date.now() - 86400000),
        region: 'us-west-1',
        tags: ['development', 'local'],
      },
      {
        id: 'node-prod-1',
        name: 'Production Server 1',
        hostname: 'prod-dashboard-1',
        ipAddress: '10.0.1.100',
        port: 8080,
        status: 'connected',
        health: 'healthy',
        version: '1.0.0',
        platform: 'linux',
        architecture: 'x64',
        capabilities: {
          maxAgents: 50,
          supportedAgentTypes: ['claude-code', 'gemini-cli', 'openai-codex'],
          hasGpu: true,
          dockerSupported: true,
          kubernetesSupported: true,
        },
        metrics: {
          cpuUsage: 15.3,
          memoryUsage: 42.7,
          diskUsage: 23.1,
          networkLatency: 45,
          uptime: 2592000,
          load: [0.8, 1.1, 1.3],
        },
        lastHeartbeat: new Date(Date.now() - 30000),
        connectedAt: new Date(Date.now() - 2592000000),
        region: 'us-east-1',
        tags: ['production', 'high-performance'],
      },
      {
        id: 'node-staging',
        name: 'Staging Environment',
        hostname: 'staging-dashboard',
        ipAddress: '10.0.2.50',
        port: 8080,
        status: 'connected',
        health: 'warning',
        version: '1.0.0-rc.1',
        platform: 'linux',
        architecture: 'arm64',
        capabilities: {
          maxAgents: 20,
          supportedAgentTypes: ['claude-code', 'gemini-cli'],
          hasGpu: false,
          dockerSupported: true,
          kubernetesSupported: true,
        },
        metrics: {
          cpuUsage: 78.9,
          memoryUsage: 85.4,
          diskUsage: 67.2,
          networkLatency: 120,
          uptime: 432000,
          load: [2.5, 2.8, 3.1],
        },
        lastHeartbeat: new Date(Date.now() - 180000),
        connectedAt: new Date(Date.now() - 432000000),
        region: 'eu-west-1',
        tags: ['staging', 'testing'],
      },
      {
        id: 'node-edge-1',
        name: 'Edge Node (Offline)',
        hostname: 'edge-node-sf',
        ipAddress: '192.168.10.100',
        port: 8080,
        status: 'disconnected',
        health: 'offline',
        version: '0.9.8',
        platform: 'linux',
        architecture: 'arm64',
        capabilities: {
          maxAgents: 5,
          supportedAgentTypes: ['claude-code'],
          hasGpu: false,
          dockerSupported: true,
          kubernetesSupported: false,
        },
        metrics: {
          cpuUsage: 0,
          memoryUsage: 0,
          diskUsage: 0,
          networkLatency: 0,
          uptime: 0,
          load: [0, 0, 0],
        },
        lastHeartbeat: new Date(Date.now() - 3600000),
        region: 'us-west-2',
        tags: ['edge', 'remote'],
      },
    ];

    return {
      nodes: mockNodes,
      timestamp: new Date().toISOString(),
      totalNodes: mockNodes.length,
      healthyNodes: mockNodes.filter(n => n.health === 'healthy').length,
    };
  };

  const executeNodeAction = async (request: NodeActionRequest): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({ 
        ...prev, 
        nodes: prev.nodes.map(node => {
          if (node.id === request.nodeId) {
            switch (request.action) {
              case 'disconnect':
                return { ...node, status: 'disconnected', health: 'offline' };
              case 'connect':
                return { ...node, status: 'connected', health: 'healthy' };
              case 'restart':
                return { ...node, status: 'connecting' };
              default:
                return node;
            }
          }
          return node;
        }),
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to execute node action' 
      }));
      throw error;
    }
  };

  const selectNode = useCallback((nodeId: string | null) => {
    setState(prev => ({ ...prev, selectedNodeId: nodeId }));
  }, []);

  const refreshNodes = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetchNodes();
      setState(prev => ({ 
        ...prev, 
        nodes: response.nodes, 
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to refresh nodes' 
      }));
    }
  }, []);

  const getSelectedNode = useCallback(() => {
    return state.nodes.find(node => node.id === state.selectedNodeId) || null;
  }, [state.nodes, state.selectedNodeId]);

  const getHealthyNodesCount = useCallback(() => {
    return state.nodes.filter(node => node.health === 'healthy').length;
  }, [state.nodes]);

  useEffect(() => {
    const loadNodes = async () => {
      setState(prev => ({ ...prev, loading: true }));
      try {
        const response = await fetchNodes();
        const firstHealthyNode = response.nodes.find(node => node.health === 'healthy');
        setState(prev => ({ 
          ...prev, 
          nodes: response.nodes, 
          selectedNodeId: firstHealthyNode?.id || response.nodes[0]?.id || null,
          loading: false 
        }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Failed to load nodes' 
        }));
      }
    };

    loadNodes();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      refreshNodes();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshNodes]);

  return {
    nodes: state.nodes,
    selectedNode: getSelectedNode(),
    selectedNodeId: state.selectedNodeId,
    loading: state.loading,
    error: state.error,
    healthyNodesCount: getHealthyNodesCount(),
    selectNode,
    refreshNodes,
    executeNodeAction,
  };
}