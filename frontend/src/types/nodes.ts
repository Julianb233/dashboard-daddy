// Node/Machine types for multi-machine support

export type NodeHealth = 'healthy' | 'warning' | 'error' | 'offline';

export type NodeStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface NodeMetrics {
  cpuUsage: number; // percentage
  memoryUsage: number; // percentage
  diskUsage: number; // percentage
  networkLatency: number; // ms
  uptime: number; // seconds
  load: [number, number, number]; // 1m, 5m, 15m load averages
}

export interface NodeCapabilities {
  maxAgents: number;
  supportedAgentTypes: string[];
  hasGpu: boolean;
  dockerSupported: boolean;
  kubernetesSupported: boolean;
}

export interface NodeInfo {
  id: string;
  name: string;
  hostname: string;
  ipAddress: string;
  port: number;
  status: NodeStatus;
  health: NodeHealth;
  version: string;
  platform: string; // linux, darwin, windows
  architecture: string; // x64, arm64
  capabilities: NodeCapabilities;
  metrics: NodeMetrics;
  lastHeartbeat: Date;
  connectedAt?: Date;
  region?: string;
  tags: string[];
}

export interface NodeAgent {
  nodeId: string;
  agentId: string;
  agentName: string;
  status: string;
  resources: {
    cpu: number;
    memory: number;
  };
}

export interface NodeDiscoveryConfig {
  autoDiscovery: boolean;
  discoveryInterval: number; // seconds
  healthCheckInterval: number; // seconds
  timeout: number; // seconds
  allowedNetworks: string[]; // CIDR blocks
}

export interface NodeListResponse {
  nodes: NodeInfo[];
  timestamp: string;
  totalNodes: number;
  healthyNodes: number;
}

export interface NodeActionRequest {
  action: 'connect' | 'disconnect' | 'restart' | 'update' | 'sync';
  nodeId: string;
}

export interface NodeActionResponse {
  success: boolean;
  message: string;
  node?: NodeInfo;
}