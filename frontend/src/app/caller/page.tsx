'use client'

import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Phone, PhoneCall, History, PlayCircle, PauseCircle, Download, CheckCircle, Clock, PhoneForwarded, PhoneOff, AlertCircle, User, Calendar } from 'lucide-react';

interface Call {
  id: string;
  phoneNumber: string;
  purpose: string;
  status: 'active' | 'completed' | 'failed' | 'queued' | 'ringing' | 'in-progress';
  duration?: number;
  startedAt: string;
  endedAt?: string;
  outcome?: 'resolved' | 'callback_needed' | 'transferred';
  recording?: {
    url: string;
    duration: number;
  };
  transcript?: string;
  assistantId: string;
  metadata?: Record<string, any>;
}

interface Assistant {
  id: string;
  name: string;
  description: string;
}

const CALL_PURPOSES = [
  { 
    value: 'customer_service', 
    label: 'Customer Service', 
    script: 'Hello! I\'m calling to help resolve any questions or concerns you may have about our services. How can I assist you today?' 
  },
  { 
    value: 'order', 
    label: 'Order Inquiry', 
    script: 'Hi there! I\'m calling regarding your recent order. I wanted to check in and see if you have any questions or if there\'s anything I can help you with.' 
  },
  { 
    value: 'booking', 
    label: 'Appointment Booking', 
    script: 'Good day! I\'m calling to help schedule an appointment that works best for your availability. What dates and times would work well for you?' 
  },
  { 
    value: 'inquiry', 
    label: 'General Inquiry', 
    script: 'Hello! I\'m reaching out to gather some information and see how we can best assist you today. Do you have a few minutes to chat?' 
  },
  { 
    value: 'follow_up', 
    label: 'Follow Up', 
    script: 'Hi! I\'m following up on our previous conversation to see how things are going and if there\'s anything else we can help you with.' 
  }
];

const ASSISTANTS: Assistant[] = [
  { id: '811c7837-c7a0-420e-8c4d-b7c18386b698', name: 'New Sahara', description: 'Primary AI Assistant' },
  { id: '5c43b486-c1da-4667-87ef-980b8484e906', name: 'New Sahara Backup', description: 'Backup AI Assistant' }
];

export default function CallerPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('customer_service');
  const [selectedAssistant, setSelectedAssistant] = useState(ASSISTANTS[0].id);
  const [isCallActive, setIsCallActive] = useState(false);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [playingRecording, setPlayingRecording] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load call history on mount
  useEffect(() => {
    loadCallHistory();
    // Set up polling for active calls
    const interval = setInterval(loadCallHistory, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadCallHistory = async () => {
    try {
      const response = await fetch('/api/caller/history');
      if (response.ok) {
        const data = await response.json();
        setCalls(data.calls || []);
        
        // Check for active calls
        const activeCalls = data.calls?.filter((call: Call) => call.status === 'active' || call.status === 'in-progress');
        if (activeCalls?.length > 0) {
          setIsCallActive(true);
          setActiveCallId(activeCalls[0].id);
        } else {
          setIsCallActive(false);
          setActiveCallId(null);
        }
      } else {
        throw new Error('Failed to fetch call history');
      }
    } catch (error) {
      console.error('Failed to load call history:', error);
      setError('Failed to load call history');
    }
  };

  const makeCall = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid phone number');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/caller/make-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          purpose: selectedPurpose,
          assistantId: selectedAssistant,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsCallActive(true);
        setActiveCallId(data.callId);
        setPhoneNumber('');
        await loadCallHistory();
      } else {
        throw new Error(data.message || 'Failed to make call');
      }
    } catch (error) {
      console.error('Failed to make call:', error);
      setError(error instanceof Error ? error.message : 'Failed to make call. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const endCall = async () => {
    if (!activeCallId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/caller/end-call/${activeCallId}`, {
        method: 'POST',
      });

      if (response.ok) {
        setIsCallActive(false);
        setActiveCallId(null);
        await loadCallHistory();
      } else {
        throw new Error('Failed to end call');
      }
    } catch (error) {
      console.error('Failed to end call:', error);
      setError('Failed to end call');
    } finally {
      setIsLoading(false);
    }
  };

  const connectMe = async (callId: string) => {
    try {
      const response = await fetch(`/api/caller/connect/${callId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Human handoff requested. You will be connected shortly.');
        await loadCallHistory();
      } else {
        throw new Error(data.message || 'Failed to request human handoff');
      }
    } catch (error) {
      console.error('Failed to connect:', error);
      setError('Failed to request human handoff');
    }
  };

  const updateOutcome = async (callId: string, outcome: Call['outcome']) => {
    try {
      const response = await fetch(`/api/caller/outcome/${callId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outcome }),
      });

      if (response.ok) {
        await loadCallHistory();
      } else {
        throw new Error('Failed to update outcome');
      }
    } catch (error) {
      console.error('Failed to update outcome:', error);
      setError('Failed to update outcome');
    }
  };

  const playRecording = (recordingId: string) => {
    if (playingRecording === recordingId) {
      setPlayingRecording(null);
    } else {
      setPlayingRecording(recordingId);
      // In a real implementation, you would play the audio here
      setTimeout(() => setPlayingRecording(null), 3000); // Mock playing for 3 seconds
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPhoneNumber = (phone: string) => {
    // Simple phone number formatting
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
    }
    return phone;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'active': case 'in-progress': return 'text-emerald-400 bg-emerald-500/20';
      case 'failed': return 'text-red-400 bg-red-500/20';
      case 'queued': case 'ringing': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'resolved': return 'text-green-400 bg-green-500/20';
      case 'callback_needed': return 'text-yellow-400 bg-yellow-500/20';
      case 'transferred': return 'text-emerald-400 bg-emerald-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const selectedPurposeData = CALL_PURPOSES.find(p => p.value === selectedPurpose);

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Phone className="h-8 w-8 text-primary" />
              AI Caller Assistant
            </h1>
            <p className="text-muted-foreground mt-2">Make and manage AI-powered phone calls with Vapi AI</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Calls</p>
              <p className="text-2xl font-bold text-foreground">{calls.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">This Session</p>
              <p className="text-2xl font-bold text-primary">{calls.filter(c => new Date(c.startedAt) > new Date(Date.now() - 86400000)).length}</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="text-red-400">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        )}

        {/* Active Call Status */}
        {isCallActive && activeCallId && (
          <div className="bg-card border border-primary/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                  <PhoneCall className="h-6 w-6 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-foreground">Call in Progress</h3>
                    <p className="text-sm text-muted-foreground">Call ID: {activeCallId}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={endCall}
                disabled={isLoading}
                className="bg-destructive hover:bg-destructive/80 text-destructive-foreground px-6 py-2 rounded-md transition-colors flex items-center space-x-2"
              >
                <PhoneOff className="h-4 w-4" />
                <span>{isLoading ? 'Ending...' : 'End Call'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Make Call Section */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center space-x-2">
            <PhoneCall className="h-5 w-5" />
            <span>Make New Call</span>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Phone Number Input */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-foreground mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full bg-input text-foreground border border-border rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  disabled={isCallActive || isLoading}
                />
              </div>

              {/* Purpose Selector */}
              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-foreground mb-2">
                  Call Purpose
                </label>
                <select
                  id="purpose"
                  value={selectedPurpose}
                  onChange={(e) => setSelectedPurpose(e.target.value)}
                  className="w-full bg-input text-foreground border border-border rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  disabled={isCallActive || isLoading}
                >
                  {CALL_PURPOSES.map((purpose) => (
                    <option key={purpose.value} value={purpose.value}>
                      {purpose.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assistant Selector */}
              <div>
                <label htmlFor="assistant" className="block text-sm font-medium text-foreground mb-2">
                  AI Assistant
                </label>
                <select
                  id="assistant"
                  value={selectedAssistant}
                  onChange={(e) => setSelectedAssistant(e.target.value)}
                  className="w-full bg-input text-foreground border border-border rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  disabled={isCallActive || isLoading}
                >
                  {ASSISTANTS.map((assistant) => (
                    <option key={assistant.id} value={assistant.id}>
                      {assistant.name} - {assistant.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-6">
              {/* AI Script Preview */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  AI Script Preview
                </label>
                <div className="bg-muted rounded-md p-4 h-40 overflow-y-auto">
                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    {selectedPurposeData?.script}
                  </p>
                </div>
              </div>
              
              {/* Make Call Button */}
              <button
                onClick={makeCall}
                disabled={isCallActive || isLoading || !phoneNumber.trim()}
                className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-semibold py-4 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                <PhoneCall className="h-5 w-5" />
                <span>
                  {isLoading ? 'Starting Call...' : isCallActive ? 'Call in Progress' : 'Make Call'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Call History */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
              <History className="h-5 w-5" />
              <span>Call History</span>
            </h2>
            <button
              onClick={loadCallHistory}
              className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md text-sm transition-colors"
            >
              Refresh
            </button>
          </div>

          {calls.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No calls yet</h3>
              <p className="text-muted-foreground">Make your first AI call above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {calls.map((call) => (
                <div key={call.id} className="bg-muted rounded-lg p-6 border hover:border-border/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Call Header */}
                      <div className="flex items-center space-x-4 mb-3">
                        <span className="font-semibold text-foreground text-lg">
                          {formatPhoneNumber(call.phoneNumber)}
                        </span>
                        <span className="text-sm bg-primary/20 text-primary px-3 py-1 rounded-full">
                          {CALL_PURPOSES.find(p => p.value === call.purpose)?.label || call.purpose}
                        </span>
                        <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(call.status)}`}>
                          {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                        </span>
                      </div>
                      
                      {/* Call Details */}
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(call.startedAt).toLocaleString()}</span>
                        </div>
                        {call.duration && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDuration(call.duration)}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{ASSISTANTS.find(a => a.id === call.assistantId)?.name || 'Unknown Assistant'}</span>
                        </div>
                      </div>

                      {/* Outcome */}
                      {call.outcome && (
                        <div className="mb-3">
                          <span className="text-sm text-muted-foreground mr-2">Outcome:</span>
                          <span className={`text-sm px-3 py-1 rounded-full ${getOutcomeColor(call.outcome)}`}>
                            {call.outcome.replace('_', ' ').charAt(0).toUpperCase() + call.outcome.replace('_', ' ').slice(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {/* Recording Playback */}
                      {call.recording && (
                        <button
                          onClick={() => playRecording(call.id)}
                          className="bg-secondary hover:bg-secondary/80 text-secondary-foreground p-2 rounded-md transition-colors"
                          title="Play Recording"
                        >
                          {playingRecording === call.id ? (
                            <PauseCircle className="h-4 w-4" />
                          ) : (
                            <PlayCircle className="h-4 w-4" />
                          )}
                        </button>
                      )}

                      {/* Connect Me (for active calls) */}
                      {(call.status === 'active' || call.status === 'in-progress') && (
                        <button
                          onClick={() => connectMe(call.id)}
                          className="bg-primary hover:bg-primary/80 text-primary-foreground p-2 rounded-md transition-colors"
                          title="Connect Me (3-way call)"
                        >
                          <PhoneForwarded className="h-4 w-4" />
                        </button>
                      )}

                      {/* Outcome Buttons (for completed calls without outcome) */}
                      {call.status === 'completed' && !call.outcome && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => updateOutcome(call.id, 'resolved')}
                            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md transition-colors text-xs"
                            title="Mark as Resolved"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => updateOutcome(call.id, 'callback_needed')}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-md transition-colors text-xs"
                            title="Callback Needed"
                          >
                            <Clock className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => updateOutcome(call.id, 'transferred')}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-md transition-colors text-xs"
                            title="Transferred"
                          >
                            <PhoneForwarded className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Transcript */}
                  {call.transcript && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                        View Transcript
                      </summary>
                      <div className="mt-3 p-4 bg-background rounded border text-sm leading-relaxed">
                        {call.transcript}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}