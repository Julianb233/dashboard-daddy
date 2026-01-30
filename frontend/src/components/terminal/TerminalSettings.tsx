'use client'

import { useState, useEffect } from 'react'
import { TerminalPreferences } from '@/types/terminal'

interface TerminalSettingsProps {
  onClose: () => void;
}

export function TerminalSettings({ onClose }: TerminalSettingsProps) {
  const [preferences, setPreferences] = useState<TerminalPreferences>({
    fontSize: 12,
    fontFamily: 'geist-mono',
    theme: 'dark',
    scrollback: 1000,
    autoScroll: true,
    showTimestamps: false,
  });

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('terminal-preferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to load terminal preferences:', err);
      }
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = (newPreferences: TerminalPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('terminal-preferences', JSON.stringify(newPreferences));
  };

  const handleClose = () => {
    onClose();
  };

  const resetToDefaults = () => {
    const defaults: TerminalPreferences = {
      fontSize: 12,
      fontFamily: 'geist-mono',
      theme: 'dark',
      scrollback: 1000,
      autoScroll: true,
      showTimestamps: false,
    };
    savePreferences(defaults);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Terminal Settings</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Size
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="8"
                max="24"
                value={preferences.fontSize}
                onChange={(e) => savePreferences({
                  ...preferences,
                  fontSize: parseInt(e.target.value)
                })}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-8 text-center">
                {preferences.fontSize}px
              </span>
            </div>
            <div className="mt-2 p-2 bg-gray-900 rounded font-mono text-green-300 text-center"
                 style={{ fontSize: `${preferences.fontSize}px` }}>
              Sample terminal text
            </div>
          </div>

          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Family
            </label>
            <select
              value={preferences.fontFamily}
              onChange={(e) => savePreferences({
                ...preferences,
                fontFamily: e.target.value as TerminalPreferences['fontFamily']
              })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="geist-mono">Geist Mono</option>
              <option value="jetbrains-mono">JetBrains Mono</option>
              <option value="source-code-pro">Source Code Pro</option>
            </select>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['dark', 'light', 'cyberpunk'] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => savePreferences({ ...preferences, theme })}
                  className={`p-3 rounded-lg border text-center text-sm font-medium transition-colors ${
                    preferences.theme === theme
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  <div className={`w-full h-8 rounded mb-2 ${
                    theme === 'dark' ? 'bg-gray-900' :
                    theme === 'light' ? 'bg-white border' :
                    'bg-purple-900'
                  }`} />
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollback Buffer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scrollback Buffer
            </label>
            <select
              value={preferences.scrollback}
              onChange={(e) => savePreferences({
                ...preferences,
                scrollback: parseInt(e.target.value)
              })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="500">500 messages</option>
              <option value="1000">1000 messages</option>
              <option value="2000">2000 messages</option>
              <option value="5000">5000 messages</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Maximum number of messages to keep in memory
            </p>
          </div>

          {/* Behavior Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Behavior
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.autoScroll}
                  onChange={(e) => savePreferences({
                    ...preferences,
                    autoScroll: e.target.checked
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">
                  Auto-scroll to bottom on new messages
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.showTimestamps}
                  onChange={(e) => savePreferences({
                    ...preferences,
                    showTimestamps: e.target.checked
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">
                  Show timestamps for messages
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-8">
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}