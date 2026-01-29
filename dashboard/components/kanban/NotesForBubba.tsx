'use client';

import { useState } from 'react';
import { MessageSquare, Send, Clock } from 'lucide-react';

export function NotesForBubba() {
  const [note, setNote] = useState('');
  const [notesHistory, setNotesHistory] = useState<string[]>([
    'Check client email responses from yesterday',
    'Update Linear project status for Q1 review',
    'Prepare agenda for team meeting tomorrow',
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (note.trim()) {
      setNotesHistory(prev => [note, ...prev]);
      setNote('');
      // In a real app, this would send to Supabase or an API
      console.log('Task added:', note);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-900/30 rounded-lg">
          <MessageSquare size={20} className="text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Notes for Bubba</h3>
          <p className="text-sm text-gray-400">Add tasks here — Bubba checks on every heartbeat</p>
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Type a new task for Bubba..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            rows={4}
          />
          <button
            type="submit"
            disabled={!note.trim()}
            className="absolute bottom-4 right-4 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <Send size={18} className="text-white" />
          </button>
        </div>
      </form>

      {/* Recent Notes */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock size={14} />
          <span>Recent notes</span>
        </div>
        
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {notesHistory.map((noteText, index) => (
            <div
              key={index}
              className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-sm"
            >
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-400 flex-shrink-0"></div>
                <p className="text-gray-300">{noteText}</p>
              </div>
              <div className="text-xs text-gray-500 mt-2 text-right">
                Added {index === 0 ? 'just now' : `${index + 1}h ago`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Heartbeat Info */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span>Bubba checks notes every 30 minutes during heartbeats</span>
        </div>
      </div>
    </div>
  );
}