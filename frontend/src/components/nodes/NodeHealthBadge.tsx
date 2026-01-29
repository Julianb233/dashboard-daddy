'use client';

import { CheckCircle, AlertTriangle, XCircle, Circle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { NodeHealth, NodeStatus } from '@/types/nodes';

interface NodeHealthBadgeProps {
  health: NodeHealth;
  status: NodeStatus;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function NodeHealthBadge({ health, status, showText = true, size = 'md' }: NodeHealthBadgeProps) {
  const getHealthConfig = (health: NodeHealth) => {
    switch (health) {
      case 'healthy':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'bg-green-400/10',
          borderColor: 'border-green-400/20',
          text: 'Healthy',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/10',
          borderColor: 'border-yellow-400/20',
          text: 'Warning',
        };
      case 'error':
        return {
          icon: XCircle,
          color: 'text-red-400',
          bgColor: 'bg-red-400/10',
          borderColor: 'border-red-400/20',
          text: 'Error',
        };
      case 'offline':
        return {
          icon: Circle,
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          borderColor: 'border-gray-400/20',
          text: 'Offline',
        };
      default:
        return {
          icon: Circle,
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          borderColor: 'border-gray-400/20',
          text: 'Unknown',
        };
    }
  };

  const getStatusConfig = (status: NodeStatus) => {
    switch (status) {
      case 'connected':
        return {
          icon: Wifi,
          color: 'text-green-400',
          text: 'Connected',
        };
      case 'connecting':
        return {
          icon: RefreshCw,
          color: 'text-yellow-400',
          text: 'Connecting',
          animate: 'animate-spin',
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          color: 'text-gray-400',
          text: 'Disconnected',
        };
      case 'error':
        return {
          icon: WifiOff,
          color: 'text-red-400',
          text: 'Connection Error',
        };
      default:
        return {
          icon: WifiOff,
          color: 'text-gray-400',
          text: 'Unknown',
        };
    }
  };

  const healthConfig = getHealthConfig(health);
  const statusConfig = getStatusConfig(status);
  
  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 12,
      gap: 'gap-1',
    },
    md: {
      container: 'px-2.5 py-1.5 text-sm',
      icon: 14,
      gap: 'gap-1.5',
    },
    lg: {
      container: 'px-3 py-2 text-base',
      icon: 16,
      gap: 'gap-2',
    },
  };

  const sizeConfig = sizeClasses[size];
  const HealthIcon = healthConfig.icon;
  const StatusIcon = statusConfig.icon;

  if (!showText) {
    return (
      <div className="flex items-center gap-1">
        <HealthIcon size={sizeConfig.icon} className={healthConfig.color} />
        <StatusIcon 
          size={sizeConfig.icon - 2} 
          className={`${statusConfig.color} ${statusConfig.animate || ''}`} 
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Health Badge */}
      <div className={`
        flex items-center ${sizeConfig.gap} ${sizeConfig.container}
        ${healthConfig.bgColor} ${healthConfig.borderColor}
        border rounded-md font-medium
      `}>
        <HealthIcon size={sizeConfig.icon} className={healthConfig.color} />
        <span className={healthConfig.color}>{healthConfig.text}</span>
      </div>

      {/* Status Indicator */}
      <div className={`
        flex items-center ${sizeConfig.gap} ${sizeConfig.container}
        bg-gray-800 border border-gray-600 rounded-md font-medium text-gray-300
      `}>
        <StatusIcon 
          size={sizeConfig.icon} 
          className={`${statusConfig.color} ${statusConfig.animate || ''}`} 
        />
        <span className={statusConfig.color}>{statusConfig.text}</span>
      </div>
    </div>
  );
}

// Simplified version for compact displays
export function NodeHealthDot({ health, status, size = 'md' }: NodeHealthBadgeProps) {
  const getHealthColor = (health: NodeHealth) => {
    switch (health) {
      case 'healthy': return 'bg-green-400';
      case 'warning': return 'bg-yellow-400';
      case 'error': return 'bg-red-400';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const pulseAnimation = health === 'healthy' && status === 'connected' ? 'animate-pulse' : '';

  return (
    <div className={`${dotSizes[size]} ${getHealthColor(health)} rounded-full ${pulseAnimation}`} 
         title={`${health} - ${status}`} />
  );
}