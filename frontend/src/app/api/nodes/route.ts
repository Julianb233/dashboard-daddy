import { NextRequest, NextResponse } from 'next/server';
import { NodeInfo, NodeListResponse } from '@/types/nodes';

// Mock nodes data - replace with actual node discovery/management
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

export async function GET() {
  try {
    // Simulate dynamic metrics updates
    const nodes = mockNodes.map(node => ({
      ...node,
      metrics: {
        ...node.metrics,
        cpuUsage: Math.max(0, Math.min(100, node.metrics.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(0, Math.min(100, node.metrics.memoryUsage + (Math.random() - 0.5) * 5)),
        networkLatency: Math.max(0, node.metrics.networkLatency + (Math.random() - 0.5) * 20),
      },
      lastHeartbeat: node.status === 'connected' ? new Date() : node.lastHeartbeat,
    }));

    const response: NodeListResponse = {
      nodes,
      timestamp: new Date().toISOString(),
      totalNodes: nodes.length,
      healthyNodes: nodes.filter(node => node.health === 'healthy').length,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get nodes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, nodeId } = await request.json();
    
    // Find the node
    const nodeIndex = mockNodes.findIndex(node => node.id === nodeId);
    
    if (nodeIndex === -1) {
      return NextResponse.json(
        { error: 'Node not found' },
        { status: 404 }
      );
    }
    
    // Execute action
    switch (action) {
      case 'connect':
        mockNodes[nodeIndex].status = 'connected';
        mockNodes[nodeIndex].health = 'healthy';
        mockNodes[nodeIndex].connectedAt = new Date();
        break;
      case 'disconnect':
        mockNodes[nodeIndex].status = 'disconnected';
        mockNodes[nodeIndex].health = 'offline';
        break;
      case 'restart':
        mockNodes[nodeIndex].status = 'connecting';
        // Simulate restart delay
        setTimeout(() => {
          mockNodes[nodeIndex].status = 'connected';
          mockNodes[nodeIndex].health = 'healthy';
          mockNodes[nodeIndex].metrics.uptime = 0;
        }, 3000);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Node ${action} initiated`,
      node: mockNodes[nodeIndex] 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to execute node action' },
      { status: 500 }
    );
  }
}