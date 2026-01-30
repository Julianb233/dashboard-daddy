'use client';

import React, { useState, useRef } from 'react';
import { 
  Mic, MicOff, Phone, Video, Users, Calendar, 
  MessageSquare, Send, Clock, ChevronDown, Sparkles,
  Coffee, Mail, Gift, Heart
} from 'lucide-react';

interface Person {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  notes?: string;
  last_contact_date?: string;
  relationship_role?: string;
  interests?: string[];
}

interface QuickActionsProps {
  person: Person;
  onUpdate: (data: any) => void;
  onClose?: () => void;
}

// Voice Note Component
export function VoiceNoteRecorder({ person, onSave }: { person: Person; onSave: (note: string, audioBlob?: Blob) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [transcription, setTranscription] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioURL(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSave = () => {
    if (transcription.trim()) {
      onSave(transcription);
      setTranscription('');
      setAudioURL(null);
    }
  };

  return (
    <div className="bg-gray-700/50 rounded-xl p-4">
      <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
        <Mic className="w-4 h-4" />
        Quick Voice Note
      </h4>
      
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-3 rounded-full transition-all ${
            isRecording 
              ? 'bg-red-500 animate-pulse' 
              : 'bg-purple-500 hover:bg-purple-600'
          }`}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        
        <span className="text-sm text-gray-400">
          {isRecording ? 'Recording... Click to stop' : 'Click to record a note'}
        </span>
      </div>

      {audioURL && (
        <audio src={audioURL} controls className="w-full mb-3" />
      )}

      <textarea
        value={transcription}
        onChange={(e) => setTranscription(e.target.value)}
        placeholder={`Add context about ${person.first_name || person.name}...`}
        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        rows={3}
      />

      {transcription && (
        <button
          onClick={handleSave}
          className="mt-2 w-full py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm font-medium transition-colors"
        >
          Save Note
        </button>
      )}
    </div>
  );
}

// Log Meeting Component
export function LogMeeting({ person, onLog }: { person: Person; onLog: (meeting: any) => void }) {
  const [meetingType, setMeetingType] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);

  const meetingTypes = [
    { type: 'zoom', icon: Video, label: 'Zoom Call', color: 'bg-blue-500' },
    { type: 'phone', icon: Phone, label: 'Phone Call', color: 'bg-green-500' },
    { type: 'in_person', icon: Users, label: 'In Person', color: 'bg-purple-500' },
    { type: 'coffee', icon: Coffee, label: 'Coffee/Meal', color: 'bg-yellow-500' },
    { type: 'email', icon: Mail, label: 'Email', color: 'bg-gray-500' },
  ];

  const handleQuickLog = (type: string) => {
    setMeetingType(type);
    setShowForm(true);
  };

  const handleSubmit = () => {
    onLog({
      type: meetingType,
      notes,
      date: new Date().toISOString()
    });
    setMeetingType('');
    setNotes('');
    setShowForm(false);
  };

  return (
    <div className="bg-gray-700/50 rounded-xl p-4">
      <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        Log Interaction
      </h4>

      <div className="flex flex-wrap gap-2 mb-3">
        {meetingTypes.map(({ type, icon: Icon, label, color }) => (
          <button
            key={type}
            onClick={() => handleQuickLog(type)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
              meetingType === type 
                ? `${color} text-white` 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="space-y-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did you discuss? Any action items?"
            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500"
            rows={2}
          />
          <button
            onClick={handleSubmit}
            className="w-full py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-medium transition-colors"
          >
            Log {meetingTypes.find(m => m.type === meetingType)?.label}
          </button>
        </div>
      )}
    </div>
  );
}

// Quick Follow-up Component with AI Suggestions
export function QuickFollowUp({ person, lastInteraction }: { person: Person; lastInteraction?: any }) {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('');

  const name = person.first_name || person.name?.split(' ')[0] || 'them';
  const role = person.relationship_role;
  
  // Generate contextual follow-up suggestions
  const getFollowUpTemplates = () => {
    const templates = [];
    
    // Light touch - checking in
    templates.push({
      id: 'light',
      label: '👋 Light Touch',
      message: `Hey ${name}! Just thinking about you and wanted to check in. Hope you're doing well!`,
      description: 'Simple, friendly check-in'
    });

    // Reference last conversation if available
    if (lastInteraction?.notes) {
      const topic = lastInteraction.notes.split(' ').slice(0, 5).join(' ');
      templates.push({
        id: 'reference',
        label: '💬 Reference Last Chat',
        message: `Hey ${name}! Been thinking about our conversation about ${topic}... How's that going?`,
        description: 'Continue the conversation'
      });
    }

    // Role-specific templates
    if (role === 'mentor') {
      templates.push({
        id: 'mentor',
        label: '🙏 Gratitude',
        message: `Hey ${name}, I've been implementing what you taught me about [topic] and wanted to share some wins with you. When do you have a few minutes to connect?`,
        description: 'Show appreciation & update'
      });
    }

    if (role === 'disciple') {
      templates.push({
        id: 'encourage',
        label: '💪 Encouragement',
        message: `Hey ${name}! Just wanted you to know I'm praying for you. How's your week going? Anything I can support you with?`,
        description: 'Spiritual encouragement'
      });
    }

    if (role === 'client' || role === 'prospect') {
      templates.push({
        id: 'value',
        label: '💡 Add Value',
        message: `Hey ${name}! Saw something that made me think of you - [resource/insight]. Thought it might be helpful for [their goal].`,
        description: 'Provide value first'
      });
    }

    // Interest-based if available
    if (person.interests && person.interests.length > 0) {
      const interest = person.interests[0];
      templates.push({
        id: 'interest',
        label: '🎯 Shared Interest',
        message: `Hey ${name}! Came across something about ${interest} and immediately thought of you. Would love to catch up soon!`,
        description: 'Connect over interests'
      });
    }

    // Time-based
    templates.push({
      id: 'schedule',
      label: '📅 Schedule Time',
      message: `Hey ${name}! It's been a while since we connected. Would love to grab coffee or jump on a quick call. What does your schedule look like?`,
      description: 'Request meeting'
    });

    return templates;
  };

  const templates = getFollowUpTemplates();

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template.id);
    setCustomMessage(template.message);
  };

  const handleSend = async (method: 'text' | 'email') => {
    // This would integrate with actual sending
    console.log(`Sending via ${method}:`, customMessage);
    alert(`Ready to send via ${method}. Integration coming soon!`);
    setShowOptions(false);
    setSelectedTemplate(null);
    setCustomMessage('');
  };

  return (
    <div className="bg-gray-700/50 rounded-xl p-4">
      <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-yellow-400" />
        Quick Follow-Up
      </h4>

      {!showOptions ? (
        <button
          onClick={() => setShowOptions(true)}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Create Follow-Up Message
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">Choose a template or write your own:</p>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedTemplate === template.id
                    ? 'bg-purple-500/30 border border-purple-500'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{template.label}</span>
                  <span className="text-xs text-gray-500">{template.description}</span>
                </div>
              </button>
            ))}
          </div>

          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Customize your message..."
            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500"
            rows={3}
          />

          <div className="flex gap-2">
            <button
              onClick={() => handleSend('text')}
              disabled={!customMessage.trim()}
              className="flex-1 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Send Text
            </button>
            <button
              onClick={() => handleSend('email')}
              disabled={!customMessage.trim()}
              className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Send Email
            </button>
          </div>

          <button
            onClick={() => { setShowOptions(false); setSelectedTemplate(null); setCustomMessage(''); }}
            className="w-full py-2 text-gray-400 hover:text-white text-sm"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// Last Interaction Display
export function LastInteraction({ person, interactions }: { person: Person; interactions?: any[] }) {
  const lastMeeting = interactions?.[0];
  
  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
    return d.toLocaleDateString();
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'zoom': case 'video': return <Video className="w-4 h-4 text-blue-400" />;
      case 'phone': case 'call': return <Phone className="w-4 h-4 text-green-400" />;
      case 'in_person': case 'meeting': return <Users className="w-4 h-4 text-purple-400" />;
      case 'email': return <Mail className="w-4 h-4 text-gray-400" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!lastMeeting && !person.last_contact_date) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
        <p className="text-yellow-400 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4" />
          No recorded interactions yet
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-700/50 rounded-xl p-4">
      <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Last Interaction
      </h4>
      
      {lastMeeting ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getInteractionIcon(lastMeeting.interaction_type || lastMeeting.contact_type)}
              <span className="text-white capitalize">
                {lastMeeting.interaction_type || lastMeeting.contact_type || 'Contact'}
              </span>
            </div>
            <span className="text-sm text-gray-400">
              {formatDate(lastMeeting.occurred_at || lastMeeting.contact_date)}
            </span>
          </div>
          {lastMeeting.notes && (
            <p className="text-sm text-gray-400 bg-gray-800 rounded-lg p-2">
              "{lastMeeting.notes}"
            </p>
          )}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">
          Last contact: {formatDate(person.last_contact_date!)}
        </p>
      )}
    </div>
  );
}
