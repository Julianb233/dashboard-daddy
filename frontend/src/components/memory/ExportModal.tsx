'use client';

import { useState } from 'react';
import { MemorySearchResult } from '@/lib/supabase/types';
import { useMemoryStore } from '@/store/memory';
import { X, Download, Copy, FileText, FileSpreadsheet, FileCode, Check } from 'lucide-react';

interface ExportModalProps {
  items: MemorySearchResult[];
  onClose: () => void;
}

export function ExportModal({ items, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<'json' | 'csv' | 'markdown'>('json');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { exportResults } = useMemoryStore();

  const handleCopy = async () => {
    const exportData = exportResults(format);
    await navigator.clipboard.writeText(exportData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    setDownloading(true);
    
    const exportData = exportResults(format);
    const blob = new Blob([exportData], { 
      type: format === 'json' ? 'application/json' : 
            format === 'csv' ? 'text/csv' : 'text/markdown' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memory-export-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setTimeout(() => {
      setDownloading(false);
      onClose();
    }, 500);
  };

  const formatInfo = {
    json: {
      name: 'JSON',
      description: 'Structured data format, good for importing into other applications',
      icon: <FileCode size={20} />,
      color: 'text-yellow-400'
    },
    csv: {
      name: 'CSV',
      description: 'Spreadsheet format, good for data analysis in Excel or Google Sheets',
      icon: <FileSpreadsheet size={20} />,
      color: 'text-green-400'
    },
    markdown: {
      name: 'Markdown',
      description: 'Text format with formatting, good for documentation and notes',
      icon: <FileText size={20} />,
      color: 'text-blue-400'
    }
  };

  const selectedFormat = formatInfo[format];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Download size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Export Memory Items</h2>
              <p className="text-sm text-gray-400">
                {items.length} item{items.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">Export Format</h3>
            <div className="grid grid-cols-3 gap-3">
              {(['json', 'csv', 'markdown'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`p-4 border rounded-lg transition-all ${
                    format === fmt
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`${formatInfo[fmt].color}`}>
                      {formatInfo[fmt].icon}
                    </div>
                    <span className="text-sm font-medium text-white">
                      {formatInfo[fmt].name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className={selectedFormat.color}>
                  {selectedFormat.icon}
                </div>
                <span className="font-medium text-white">{selectedFormat.name}</span>
              </div>
              <p className="text-sm text-gray-300">
                {selectedFormat.description}
              </p>
            </div>
          </div>

          {/* Options */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">Options</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-white">Include Metadata</div>
                  <div className="text-sm text-gray-400">
                    Export agent, topics, timestamps, and other metadata
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">Preview</h3>
            <div className="bg-gray-900 border border-gray-600 rounded-lg p-4 max-h-40 overflow-auto">
              <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                {exportResults(format).substring(0, 300)}
                {exportResults(format).length > 300 && '...'}
              </pre>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Showing first 300 characters of {exportResults(format).length} total
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex items-center justify-between">
          <button
            onClick={handleCopy}
            disabled={items.length === 0}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={items.length === 0 || downloading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {downloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Download File
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}