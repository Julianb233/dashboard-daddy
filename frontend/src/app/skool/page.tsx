'use client';

import { useState, useEffect } from 'react';

interface SkoolEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  isFree: boolean;
  attending: boolean;
  community: string;
  eventType: string;
}

interface Community {
  id: string;
  name: string;
  cost: string;
  specialty: string;
  status: string;
}

interface SkoolData {
  communities: Community[];
  events: SkoolEvent[];
  eventsByDate: Record<string, SkoolEvent[]>;
  summary: {
    total: number;
    attending: number;
    thisWeek: number;
  };
}

export default function SkoolPage() {
  const [data, setData] = useState<SkoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<SkoolEvent | null>(null);
  const [communityFilter, setCommunityFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/api/skool')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAttendance = async (eventId: string, action: 'attend' | 'skip') => {
    const res = await fetch('/api/skool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, action })
    });
    
    if (res.ok) {
      const result = await res.json();
      alert(result.message);
      // Refresh
      const newData = await fetch('/api/skool').then(r => r.json());
      setData(newData);
      setSelectedEvent(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf8e8] p-4 sm:p-6">
        <div className="animate-pulse text-[#0a4d3c]">Loading Skool communities...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#fdf8e8] p-4 sm:p-6">
        <div className="text-red-600">Failed to load Skool data</div>
      </div>
    );
  }

  const filteredEvents = communityFilter === 'all' 
    ? data.events 
    : data.events.filter(e => e.community === communityFilter);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getEventTypeEmoji = (type: string) => {
    switch (type) {
      case 'Q&A / Support': return '❓';
      case 'Onboarding': return '👋';
      case 'Tech Support': return '🛠️';
      case 'Workshop': return '🎓';
      case 'Community': return '☕';
      case 'Coaching Call': return '📞';
      default: return '📅';
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8e8]">
      {/* Header */}
      <div className="bg-[#0a4d3c] text-white p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold">🎓 Skool Communities</h1>
        <p className="text-white/70 mt-1">Manage your community events and attendance</p>
        
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{data.summary.thisWeek}</div>
            <div className="text-xs text-white/70">This Week</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{data.summary.attending}</div>
            <div className="text-xs text-white/70">Attending</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{data.summary.total}</div>
            <div className="text-xs text-white/70">Upcoming</div>
          </div>
        </div>
      </div>

      {/* Communities Overview */}
      <div className="p-4 border-b border-[#0a4d3c]/10">
        <h2 className="font-semibold text-[#0a4d3c] mb-3">Your Communities</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {data.communities.filter(c => c.status === 'active').map(community => (
            <button
              key={community.id}
              onClick={() => setCommunityFilter(communityFilter === community.name ? 'all' : community.name)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition ${
                communityFilter === community.name
                  ? 'bg-[#0a4d3c] text-white'
                  : 'bg-white border border-[#0a4d3c]/20 text-[#0a4d3c]'
              }`}
            >
              {community.name}
              <span className="ml-2 text-xs opacity-70">{community.cost}</span>
            </button>
          ))}
          {communityFilter !== 'all' && (
            <button
              onClick={() => setCommunityFilter('all')}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm bg-[#d4a84b] text-white"
            >
              Show All
            </button>
          )}
        </div>
      </div>

      {/* Events List */}
      <div className="p-4 space-y-4">
        {Object.entries(data.eventsByDate)
          .filter(([_, events]) => communityFilter === 'all' || events.some(e => e.community === communityFilter))
          .map(([date, events]) => (
          <div key={date}>
            <h3 className="font-semibold text-[#0a4d3c] mb-2 sticky top-0 bg-[#fdf8e8] py-2">
              {formatDate(events[0].start)}
            </h3>
            <div className="space-y-2">
              {events
                .filter(e => communityFilter === 'all' || e.community === communityFilter)
                .map(event => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`bg-white rounded-xl p-4 border-2 cursor-pointer transition-all hover:shadow-md ${
                    event.attending ? 'border-[#0a4d3c]' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-lg">{getEventTypeEmoji(event.eventType)}</span>
                        <span className="text-xs px-2 py-0.5 bg-[#0a4d3c]/10 rounded text-[#0a4d3c]">
                          {event.community}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-[#d4a84b]/20 rounded text-[#0a4d3c]">
                          {event.eventType}
                        </span>
                        {event.attending && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 rounded text-green-700 font-medium">
                            ✓ Attending
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-[#0a4d3c]">{event.title}</h4>
                      <p className="text-sm text-[#0a4d3c]/60 mt-1">
                        🕐 {formatTime(event.start)}
                      </p>
                    </div>
                    <div className="text-[#d4a84b]">→</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="text-center py-8 text-[#0a4d3c]/50">
            No upcoming events found
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-2xl mr-2">{getEventTypeEmoji(selectedEvent.eventType)}</span>
                  <span className="px-2 py-0.5 bg-[#0a4d3c]/10 rounded text-xs text-[#0a4d3c]">
                    {selectedEvent.community}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="text-[#0a4d3c]/50 hover:text-[#0a4d3c] text-2xl"
                >
                  ×
                </button>
              </div>
              <h2 className="text-xl font-bold text-[#0a4d3c] mt-2">{selectedEvent.title}</h2>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2 text-[#0a4d3c]">
                <span>📅</span>
                <span>{formatDate(selectedEvent.start)}</span>
                <span>•</span>
                <span>{formatTime(selectedEvent.start)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-[#0a4d3c]">
                <span>🏷️</span>
                <span>{selectedEvent.eventType}</span>
              </div>
              
              {selectedEvent.description && (
                <div className="bg-[#fdf8e8] rounded-lg p-3">
                  <p className="text-sm text-[#0a4d3c]/80">{selectedEvent.description}</p>
                </div>
              )}
              
              {selectedEvent.eventType === 'Q&A / Support' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>💡 Tip:</strong> If you mark this as attending, Bubba will prepare a list of questions based on your current tech stack and blockers.
                  </p>
                </div>
              )}
              
              {/* Attendance Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleAttendance(selectedEvent.id, 'attend')}
                  className={`flex-1 py-3 rounded-xl font-medium transition ${
                    selectedEvent.attending
                      ? 'bg-green-500 text-white'
                      : 'bg-[#0a4d3c] text-white hover:bg-[#0a4d3c]/90'
                  }`}
                >
                  {selectedEvent.attending ? '✓ Attending' : '✓ I\'ll Attend'}
                </button>
                <button
                  onClick={() => handleAttendance(selectedEvent.id, 'skip')}
                  className={`flex-1 py-3 rounded-xl font-medium transition ${
                    !selectedEvent.attending && !selectedEvent.isFree
                      ? 'bg-gray-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Skip This One
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
