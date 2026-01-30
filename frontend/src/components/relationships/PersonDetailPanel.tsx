'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Building, Calendar, Tag, Edit, Trash2 } from 'lucide-react';
import { VoiceNoteRecorder, LogMeeting, QuickFollowUp, LastInteraction } from './QuickActions';

interface Person {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  nickname?: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  circle?: string;
  relationship_role?: string;
  relationship_strength?: number;
  notes?: string;
  tags?: string[];
  interests?: string[];
  last_contact_date?: string;
  next_contact_date?: string;
  birthday?: string;
  how_we_met?: string;
  contact_history?: any[];
}

interface PersonDetailPanelProps {
  person: Person;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (person: Person) => void;
  onDelete: (id: string) => void;
}

export default function PersonDetailPanel({ 
  person, 
  isOpen, 
  onClose, 
  onUpdate,
  onDelete 
}: PersonDetailPanelProps) {
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && person.id) {
      fetchInteractions();
    }
  }, [isOpen, person.id]);

  const fetchInteractions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/relationships/${person.id}/contact-history`);
      if (response.ok) {
        const data = await response.json();
        setInteractions(data.history || []);
      }
    } catch (error) {
      console.error('Error fetching interactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async (note: string) => {
    try {
      // Add note to person's notes
      const updatedNotes = person.notes 
        ? `${person.notes}\n\n[${new Date().toLocaleDateString()}] ${note}`
        : `[${new Date().toLocaleDateString()}] ${note}`;
      
      const response = await fetch(`/api/relationships/${person.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: updatedNotes })
      });

      if (response.ok) {
        onUpdate({ ...person, notes: updatedNotes });
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleLogMeeting = async (meeting: any) => {
    try {
      // Log interaction
      const response = await fetch(`/api/relationships/${person.id}/contact-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_type: meeting.type,
          notes: meeting.notes,
          contact_date: meeting.date
        })
      });

      if (response.ok) {
        fetchInteractions();
        // Update last contact date
        onUpdate({ ...person, last_contact_date: meeting.date });
      }
    } catch (error) {
      console.error('Error logging meeting:', error);
    }
  };

  const getCircleColor = (circle?: string) => {
    switch (circle) {
      case 'inner': return 'bg-purple-500';
      case 'key': return 'bg-green-500';
      case 'outer': return 'bg-gray-500';
      default: return 'bg-gray-600';
    }
  };

  const getRoleEmoji = (role?: string) => {
    switch (role) {
      case 'mentor': return '👑';
      case 'disciple': return '🙏';
      case 'client': return '💼';
      case 'prospect': return '🎯';
      case 'family': return '👨‍👩‍👧‍👦';
      case 'friend': return '😊';
      case 'peer': return '🤝';
      default: return '👤';
    }
  };

  if (!isOpen) return null;

  const displayName = person.name || `${person.first_name || ''} ${person.last_name || ''}`.trim();

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-lg bg-gray-900 h-full overflow-y-auto shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${getCircleColor(person.circle)} flex items-center justify-center text-xl font-bold`}>
              {(person.first_name || person.name || '?')[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{displayName}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>{getRoleEmoji(person.relationship_role)}</span>
                <span className="capitalize">{person.relationship_role || 'Contact'}</span>
                <span>•</span>
                <span className="capitalize">{person.circle || 'outer'} circle</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Contact Info */}
          <div className="bg-gray-800 rounded-xl p-4 space-y-3">
            {person.phone && (
              <a href={`tel:${person.phone}`} className="flex items-center gap-3 text-gray-300 hover:text-white">
                <Phone className="w-4 h-4 text-green-400" />
                {person.phone}
              </a>
            )}
            {person.email && (
              <a href={`mailto:${person.email}`} className="flex items-center gap-3 text-gray-300 hover:text-white">
                <Mail className="w-4 h-4 text-blue-400" />
                {person.email}
              </a>
            )}
            {person.company && (
              <div className="flex items-center gap-3 text-gray-300">
                <Building className="w-4 h-4 text-purple-400" />
                {person.company} {person.job_title && `• ${person.job_title}`}
              </div>
            )}
            {person.birthday && (
              <div className="flex items-center gap-3 text-gray-300">
                <Calendar className="w-4 h-4 text-pink-400" />
                Birthday: {new Date(person.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </div>
            )}
          </div>

          {/* Tags */}
          {person.tags && person.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {person.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Relationship Strength */}
          {person.relationship_strength && (
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Relationship Strength</span>
                <span className="text-lg font-bold text-white">{person.relationship_strength}/10</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                  style={{ width: `${person.relationship_strength * 10}%` }}
                />
              </div>
            </div>
          )}

          {/* Last Interaction */}
          <LastInteraction person={person} interactions={interactions} />

          {/* Quick Actions */}
          <VoiceNoteRecorder person={person} onSave={handleSaveNote} />
          
          <LogMeeting person={person} onLog={handleLogMeeting} />
          
          <QuickFollowUp person={person} lastInteraction={interactions[0]} />

          {/* Notes */}
          {person.notes && (
            <div className="bg-gray-800 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Notes</h4>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{person.notes}</p>
            </div>
          )}

          {/* How We Met */}
          {person.how_we_met && (
            <div className="bg-gray-800 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">How We Met</h4>
              <p className="text-gray-300 text-sm">{person.how_we_met}</p>
            </div>
          )}

          {/* Interaction History */}
          {interactions.length > 0 && (
            <div className="bg-gray-800 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Interaction History</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {interactions.map((interaction, i) => (
                  <div key={i} className="flex justify-between items-start p-2 bg-gray-700/50 rounded-lg">
                    <div>
                      <span className="text-sm text-white capitalize">
                        {interaction.interaction_type || interaction.contact_type}
                      </span>
                      {interaction.notes && (
                        <p className="text-xs text-gray-400 mt-1">{interaction.notes}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(interaction.occurred_at || interaction.contact_date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-700">
            <button
              onClick={() => {/* Open edit modal */}}
              className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete ${displayName}?`)) {
                  onDelete(person.id);
                  onClose();
                }
              }}
              className="py-2 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
