'use client';

import { 
  Youtube, 
  Brain, 
  Shield, 
  BarChart3, 
  FileText, 
  Folder,
  Download,
  ExternalLink,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  FolderOpen
} from 'lucide-react';

interface Deliverable {
  id: string;
  name: string;
  type: string;
  icon: React.ReactNode;
  date: string;
  status: 'pending' | 'in_progress' | 'completed';
  folder?: string;
  url?: string;
  downloadUrl?: string;
}

const mockDeliverables: Deliverable[] = [
  {
    id: '1',
    name: 'YouTube Audits',
    type: 'Content Analysis',
    icon: <Youtube size={18} />,
    date: 'Today',
    status: 'completed',
    folder: 'Marketing',
    downloadUrl: '#',
  },
  {
    id: '2',
    name: 'Daily AI Pulse',
    type: 'AI Report',
    icon: <Brain size={18} />,
    date: 'Today',
    status: 'in_progress',
    folder: 'Analytics',
    url: '#',
  },
  {
    id: '3',
    name: 'Daily SWOT Analysis',
    type: 'Strategy',
    icon: <BarChart3 size={18} />,
    date: 'Today',
    status: 'pending',
    folder: 'Strategy',
  },
  {
    id: '4',
    name: 'Security Audits',
    type: 'Security',
    icon: <Shield size={18} />,
    date: 'Yesterday',
    status: 'completed',
    folder: 'Security',
    downloadUrl: '#',
  },
  {
    id: '5',
    name: 'Client Proposals',
    type: 'Documents',
    icon: <FileText size={18} />,
    date: 'Jan 28',
    status: 'completed',
    folder: 'Clients',
    downloadUrl: '#',
  },
  {
    id: '6',
    name: 'Q1 Planning',
    type: 'Strategy',
    icon: <Calendar size={18} />,
    date: 'Jan 27',
    status: 'completed',
    folder: 'Planning',
    url: '#',
  },
  {
    id: '7',
    name: 'Code Review',
    type: 'Development',
    icon: <FileText size={18} />,
    date: 'Jan 26',
    status: 'in_progress',
    folder: 'Development',
    url: '#',
  },
  {
    id: '8',
    name: 'Team Performance',
    type: 'Analytics',
    icon: <BarChart3 size={18} />,
    date: 'Jan 25',
    status: 'completed',
    folder: 'HR',
    downloadUrl: '#',
  },
];

export function DeliverablesSection() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={14} className="text-green-400" />;
      case 'in_progress':
        return <Clock size={14} className="text-orange-400" />;
      case 'pending':
        return <AlertCircle size={14} className="text-gray-400" />;
      default:
        return <AlertCircle size={14} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'in_progress':
        return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'pending':
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Ready';
      case 'in_progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-900/30 rounded-lg">
            <FolderOpen size={20} className="text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Deliverables</h3>
            <p className="text-sm text-gray-400">Recent outputs and reports</p>
          </div>
        </div>
        <div className="text-sm text-gray-400">
          {mockDeliverables.filter(d => d.status === 'completed').length} of {mockDeliverables.length} completed
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {mockDeliverables.map((deliverable) => (
          <div
            key={deliverable.id}
            className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors group"
          >
            {/* Deliverable Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="text-blue-400">
                {deliverable.icon}
              </div>
              <div className="flex items-center gap-1">
                {getStatusIcon(deliverable.status)}
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(deliverable.status)}`}>
                  {getStatusText(deliverable.status)}
                </span>
              </div>
            </div>

            {/* Deliverable Info */}
            <div className="mb-3">
              <h4 className="text-sm font-medium text-white mb-1">
                {deliverable.name}
              </h4>
              <p className="text-xs text-gray-400">{deliverable.type}</p>
            </div>

            {/* Date and Folder */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{deliverable.date}</span>
              </div>
              {deliverable.folder && (
                <div className="flex items-center gap-1">
                  <Folder size={12} />
                  <span>{deliverable.folder}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white transition-colors"
                onClick={() => console.log('Open folder:', deliverable.folder)}
              >
                <Folder size={12} />
                <span>Folder</span>
              </button>
              
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {deliverable.url && (
                  <button
                    className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
                    onClick={() => window.open(deliverable.url, '_blank')}
                    title="View"
                  >
                    <ExternalLink size={12} />
                  </button>
                )}
                {deliverable.downloadUrl && (
                  <button
                    className="p-1.5 bg-gray-600 hover:bg-gray-500 rounded text-white transition-colors"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = deliverable.downloadUrl!;
                      link.download = deliverable.name;
                      link.click();
                    }}
                    title="Download"
                  >
                    <Download size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="mt-6 pt-4 border-t border-gray-800">
        <button className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors flex items-center justify-center gap-2">
          <FolderOpen size={16} />
          <span>View All Deliverables</span>
        </button>
      </div>
    </div>
  );
}