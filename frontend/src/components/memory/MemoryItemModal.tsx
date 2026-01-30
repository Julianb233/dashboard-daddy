'use client';

import { useState, useEffect } from 'react';
import { MemoryItem, CreateMemoryItemData } from '@/lib/supabase/types';
import { useMemoryStore } from '@/store/memory';
import { X, Save, Edit, Copy, Download, Trash2, Calendar, User, Tag, File } from 'lucide-react';

interface MemoryItemModalProps {
  item?: MemoryItem;
  onClose: () => void;
}

export function MemoryItemModal({ item, onClose }: MemoryItemModalProps) {
  const isEditing = !!item;
  const [formData, setFormData] = useState<CreateMemoryItemData>({
    title: item?.title || '',
    content: item?.content || '',
    topics: item?.topics || [],
    metadata: item?.metadata || {}
  });
  const [newTopic, setNewTopic] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const { createMemoryItem, updateMemoryItem, deleteMemoryItem, memoryAgents } = useMemoryStore();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (isEditing) {
        await updateMemoryItem(item.id, formData);
      } else {
        await createMemoryItem(formData.title, formData.content, formData.metadata);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save memory item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item || !confirm('Are you sure you want to delete this memory item?')) return;

    try {
      await deleteMemoryItem(item.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete memory item:', error);
    }
  };

  const handleCopyContent = async () => {
    await navigator.clipboard.writeText(formData.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddTopic = () => {
    if (!newTopic.trim()) return;
    
    const topic = newTopic.trim().toLowerCase();
    if (!formData.topics?.includes(topic)) {
      setFormData(prev => ({
        ...prev,
        topics: [...(prev.topics || []), topic]
      }));
    }
    setNewTopic('');
  };

  const handleRemoveTopic = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics?.filter(t => t !== topic) || []
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTopic.trim()) {
      e.preventDefault();
      handleAddTopic();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <File size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEditing ? 'Edit Memory Item' : 'Create Memory Item'}
              </h2>
              {isEditing && (
                <p className="text-sm text-gray-400">
                  Created {formatDate(item.created_at)}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyContent}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title={copied ? 'Copied!' : 'Copy content'}
            >
              <Copy size={18} className={copied ? 'text-green-400' : ''} />
            </button>
            
            {isEditing && (
              <button
                onClick={handleDelete}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a descriptive title..."
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[200px] font-mono text-sm"
                placeholder="Enter the content of your memory..."
                required
              />
            </div>

            {/* Topics */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Topics
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a topic and press Enter..."
                />
                <button
                  type="button"
                  onClick={handleAddTopic}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.topics?.map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
                  >
                    <Tag size={12} />
                    {topic}
                    <button
                      type="button"
                      onClick={() => handleRemoveTopic(topic)}
                      className="ml-1 hover:text-red-300"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Additional Information
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Agent</label>
                  <select
                    value={formData.agent_id || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      agent_id: e.target.value || undefined 
                    }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select agent</option>
                    {memoryAgents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">File Path</label>
                  <input
                    type="text"
                    value={formData.file_path || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      file_path: e.target.value || undefined 
                    }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., /path/to/file.md"
                  />
                </div>
              </div>
            </div>

            {/* Read-only info for editing */}
            {isEditing && (
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Item Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-gray-300">Created:</span>
                    <span className="text-gray-400">{formatDate(item.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-gray-300">Updated:</span>
                    <span className="text-gray-400">{formatDate(item.updated_at)}</span>
                  </div>
                  {item.agent && (
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400" />
                      <span className="text-gray-300">Agent:</span>
                      <span className="text-gray-400">{item.agent.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {isEditing ? 'Save changes to update this memory item' : 'Create a new memory item'}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !formData.title.trim() || !formData.content.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {isEditing ? 'Save Changes' : 'Create Item'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}