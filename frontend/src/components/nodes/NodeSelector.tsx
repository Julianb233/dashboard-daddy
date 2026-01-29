'use client';

import { useState } from 'react';
import { ChevronDown, Server, Wifi, WifiOff, AlertTriangle, CheckCircle, Circle, RefreshCw } from 'lucide-react';
import { NodeInfo, NodeHealth } from '@/types/nodes';

interface NodeSelectorProps {
  nodes: NodeInfo[];
  selectedNode: NodeInfo | null;
  onSelectNode: (nodeId: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export function NodeSelector({ nodes, selectedNode, onSelectNode, onRefresh, loading }: NodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getHealthColor = (health: NodeHealth) => {
    switch (health) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'offline': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getHealthIcon = (health: NodeHealth) => {
    switch (health) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return Circle;
      case 'offline': return Circle;
      default: return Circle;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return Wifi;
      case 'connecting': return RefreshCw;
      default: return WifiOff;
    }
  };

  const healthyNodesCount = nodes.filter(node => node.health === 'healthy').length;
  const totalNodes = nodes.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-white transition-colors"
      >
        <Server size={16} />
        <div className="text-left">
          <div className="text-sm font-medium">
            {selectedNode ? selectedNode.name : 'Select Node'}
          </div>
          <div className="text-xs text-gray-400">
            {healthyNodesCount}/{totalNodes} healthy
          </div>
        </div>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-80 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-20">
            <div className="p-3 border-b border-gray-600">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">Available Nodes</h3>
                <button
                  onClick={() => {
                    onRefresh();
                    setIsOpen(false);
                  }}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  disabled={loading}
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {healthyNodesCount} of {totalNodes} nodes healthy
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {nodes.map((node) => {
                const HealthIcon = getHealthIcon(node.health);
                const StatusIcon = getStatusIcon(node.status);
                const isSelected = selectedNode?.id === node.id;

                return (
                  <button
                    key={node.id}
                    onClick={() => {
                      onSelectNode(node.id);
                      setIsOpen(false);
                    }}
                    className={`w-full p-3 text-left hover:bg-gray-700 transition-colors border-l-2 ${
                      isSelected 
                        ? 'border-blue-500 bg-gray-750' 
                        : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <HealthIcon size={16} className={getHealthColor(node.health)} />
                        <span className="font-medium text-white">{node.name}</span>
                        {isSelected && (
                          <span className="px-2 py-0.5 bg-blue-600 text-xs text-white rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <StatusIcon 
                        size={14} 
                        className={`${
                          node.status === 'connected' ? 'text-green-400' : 
                          node.status === 'connecting' ? 'text-yellow-400 animate-spin' : 
                          'text-gray-400'
                        }`} 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                      <div>
                        <span className="text-gray-500">CPU:</span> {node.metrics.cpuUsage.toFixed(1)}%
                      </div>
                      <div>
                        <span className="text-gray-500">RAM:</span> {node.metrics.memoryUsage.toFixed(1)}%
                      </div>
                      <div>
                        <span className="text-gray-500">Agents:</span> {Math.floor(Math.random() * node.capabilities.maxAgents)}/{node.capabilities.maxAgents}
                      </div>
                      <div>
                        <span className="text-gray-500">Uptime:</span> {Math.floor(node.metrics.uptime / 86400)}d
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mt-2">
                      <div className="text-xs text-gray-500">
                        {node.ipAddress}
                      </div>
                      {node.region && (
                        <>
                          <div className="w-1 h-1 bg-gray-600 rounded-full" />
                          <div className="text-xs text-gray-500">
                            {node.region}
                          </div>
                        </>
                      )}
                    </div>

                    {node.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {node.tags.map((tag) => (
                          <span 
                            key={tag}
                            className="px-1.5 py-0.5 bg-gray-700 text-xs text-gray-300 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-3 border-t border-gray-600 bg-gray-750">
              <button 
                className="w-full text-xs text-gray-400 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Auto-discovery: every 30s
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}