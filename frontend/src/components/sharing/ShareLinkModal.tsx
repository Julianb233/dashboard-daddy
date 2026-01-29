'use client';

import { useState } from 'react';
import { X, Copy, Check, ExternalLink, Eye, EyeOff, Settings as SettingsIcon, Clock, Globe, Lock } from 'lucide-react';
import { SharePermission, CreateShareRequest, ShareLink } from '@/types/sharing';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateShare: (request: CreateShareRequest) => Promise<void>;
  shareLinks: ShareLink[];
}

export function ShareLinkModal({ isOpen, onClose, onCreateShare, shareLinks }: ShareLinkModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'public' as 'public' | 'private',
    permissions: ['stats'] as SharePermission[],
    allowEmbedding: true,
    requireAuth: false,
    expiresAt: '',
  });
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const request: CreateShareRequest = {
        name: formData.name,
        config: {
          permissions: formData.permissions,
          type: formData.type,
          allowEmbedding: formData.allowEmbedding,
          requireAuth: formData.requireAuth,
          ...(formData.expiresAt && { expiresAt: new Date(formData.expiresAt) }),
        },
      };
      
      await onCreateShare(request);
      setFormData({
        name: '',
        type: 'public',
        permissions: ['stats'],
        allowEmbedding: true,
        requireAuth: false,
        expiresAt: '',
      });
    } catch (error) {
      console.error('Failed to create share link:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permission: SharePermission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const copyToClipboard = async (text: string, linkId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedLinkId(linkId);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const getShareUrl = (token: string) => {
    return `${window.location.origin}/share/${token}`;
  };

  const getEmbedCode = (token: string) => {
    const url = getShareUrl(token);
    return `<iframe src="${url}" width="100%" height="600" frameborder="0"></iframe>`;
  };

  const permissionOptions = [
    { id: 'stats' as SharePermission, label: 'Statistics', description: 'Agent counts, task metrics' },
    { id: 'commands' as SharePermission, label: 'Commands', description: 'Agent actions and controls' },
    { id: 'errors' as SharePermission, label: 'Error Logs', description: 'System errors and warnings' },
    { id: 'full' as SharePermission, label: 'Full Access', description: 'Complete dashboard access' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Share Dashboard</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Create New Share Link */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Create New Share Link</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Share Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Public Dashboard, Team View"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Share Type
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: 'public' }))}
                    className={`flex-1 p-3 rounded-lg border text-left transition-colors ${
                      formData.type === 'public'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Globe size={20} />
                      <div>
                        <div className="font-medium">Public</div>
                        <div className="text-xs text-gray-400">Anyone with link</div>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: 'private' }))}
                    className={`flex-1 p-3 rounded-lg border text-left transition-colors ${
                      formData.type === 'private'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Lock size={20} />
                      <div>
                        <div className="font-medium">Private</div>
                        <div className="text-xs text-gray-400">Restricted access</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Permissions
                </label>
                <div className="space-y-2">
                  {permissionOptions.map((option) => (
                    <div key={option.id} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id={option.id}
                        checked={formData.permissions.includes(option.id)}
                        onChange={() => handlePermissionToggle(option.id)}
                        className="mt-1 text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <div>
                        <label htmlFor={option.id} className="text-sm font-medium text-gray-300 cursor-pointer">
                          {option.label}
                        </label>
                        <p className="text-xs text-gray-400">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="allowEmbedding"
                  checked={formData.allowEmbedding}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowEmbedding: e.target.checked }))}
                  className="text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="allowEmbedding" className="text-sm font-medium text-gray-300 cursor-pointer">
                  Allow embedding in external sites
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="requireAuth"
                  checked={formData.requireAuth}
                  onChange={(e) => setFormData(prev => ({ ...prev, requireAuth: e.target.checked }))}
                  className="text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="requireAuth" className="text-sm font-medium text-gray-300 cursor-pointer">
                  Require authentication
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expires At (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? 'Creating...' : 'Create Share Link'}
              </button>
            </form>
          </div>

          {/* Existing Share Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Existing Share Links</h3>
            
            {shareLinks.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <Globe size={48} className="mx-auto mb-4 opacity-50" />
                <p>No share links created yet</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {shareLinks.map((link) => (
                  <div key={link.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-white">{link.name}</h4>
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            {link.config.type === 'public' ? <Globe size={12} /> : <Lock size={12} />}
                            {link.config.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye size={12} />
                            {link.accessCount} views
                          </span>
                          {link.config.expiresAt && (
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              Expires {new Date(link.config.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${link.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                        <button className="text-gray-400 hover:text-white">
                          <SettingsIcon size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={getShareUrl(link.token)}
                          readOnly
                          className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-gray-300"
                        />
                        <button
                          onClick={() => copyToClipboard(getShareUrl(link.token), link.id)}
                          className="p-1 text-gray-400 hover:text-white"
                        >
                          {copiedLinkId === link.id ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                        <a
                          href={getShareUrl(link.token)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-gray-400 hover:text-white"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>

                      {link.config.allowEmbedding && (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={getEmbedCode(link.token)}
                            readOnly
                            className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-gray-300"
                            placeholder="Embed code"
                          />
                          <button
                            onClick={() => copyToClipboard(getEmbedCode(link.token), `${link.id}-embed`)}
                            className="p-1 text-gray-400 hover:text-white"
                          >
                            {copiedLinkId === `${link.id}-embed` ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {link.config.permissions.map((permission) => (
                        <span key={permission} className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded">
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}