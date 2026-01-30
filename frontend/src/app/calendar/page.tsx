'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  event_type?: string;
  location?: string;
  created_at: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  // TODO: Implement calendar navigation with these
  // const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar');
      
      if (!response.ok) {
        throw new Error('Failed to fetch calendar events');
      }
      
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getEventColor = (eventType?: string) => {
    switch (eventType) {
      case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'task': return 'bg-green-100 text-green-800 border-green-200';
      case 'deadline': return 'bg-red-100 text-red-800 border-red-200';
      case 'personal': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get events for today
  const today = new Date().toDateString();
  const todaysEvents = events.filter(event => 
    new Date(event.start_date).toDateString() === today
  );

  // Get upcoming events (next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.start_date);
    return eventDate > new Date() && eventDate <= nextWeek;
  }).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-500 mt-1">View and manage your schedule</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-lg ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-lg ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Week
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-4 py-2 rounded-lg ${view === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Day
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">Today's Events</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{todaysEvents.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">Upcoming (7 days)</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{upcomingEvents.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Events</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{events.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Events */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Schedule</h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : todaysEvents.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No events scheduled for today</p>
                  <p className="text-sm mt-2">Enjoy your day!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todaysEvents.map((event) => (
                    <div key={event.id} className={`border rounded-lg p-4 ${getEventColor(event.event_type)}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          {event.description && (
                            <p className="text-sm mt-1 opacity-80">{event.description}</p>
                          )}
                          {event.location && (
                            <p className="text-sm mt-1 opacity-80">📍 {event.location}</p>
                          )}
                        </div>
                        <div className="text-sm">
                          {formatDate(event.start_date)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No upcoming events</p>
                  <p className="text-sm mt-2">Check back later</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{event.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(event.start_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        {event.event_type && (
                          <span className={`px-2 py-1 text-xs rounded-full ${getEventColor(event.event_type)}`}>
                            {event.event_type}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calendar View Placeholder */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Calendar View</h2>
              <div className="text-center text-gray-500 py-8">
                <p>Calendar grid view coming soon</p>
                <p className="text-sm mt-2">Currently showing {view} view</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
