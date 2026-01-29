'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

interface Person {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  relationship_type?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showNewPerson, setShowNewPerson] = useState(false);
  const [newPerson, setNewPerson] = useState({
    name: '',
    email: '',
    phone: '',
    relationship_type: '',
    notes: ''
  });

  useEffect(() => {
    fetchPeople();
  }, []);

  async function fetchPeople() {
    try {
      setLoading(true);
      const response = await fetch('/api/people');
      
      if (!response.ok) {
        throw new Error('Failed to fetch people');
      }
      
      const data = await response.json();
      setPeople(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function createPerson() {
    try {
      const response = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPerson)
      });

      if (!response.ok) {
        throw new Error('Failed to create person');
      }

      await fetchPeople();
      setShowNewPerson(false);
      setNewPerson({ name: '', email: '', phone: '', relationship_type: '', notes: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create person');
    }
  }

  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(search.toLowerCase()) ||
    person.email?.toLowerCase().includes(search.toLowerCase()) ||
    person.relationship_type?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const relationshipColors: Record<string, string> = {
    client: 'bg-blue-100 text-blue-800',
    friend: 'bg-green-100 text-green-800',
    family: 'bg-purple-100 text-purple-800',
    colleague: 'bg-yellow-100 text-yellow-800',
    mentor: 'bg-indigo-100 text-indigo-800',
    partner: 'bg-pink-100 text-pink-800'
  };

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">People</h1>
            <p className="text-gray-500 mt-1">Manage your contacts and relationships</p>
          </div>
          <button 
            onClick={() => setShowNewPerson(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Person
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* New Person Modal */}
        {showNewPerson && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Add New Person</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newPerson.name}
                    onChange={(e) => setNewPerson({...newPerson, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newPerson.email}
                    onChange={(e) => setNewPerson({...newPerson, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="email@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newPerson.phone}
                    onChange={(e) => setNewPerson({...newPerson, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="(123) 456-7890"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship Type
                  </label>
                  <select
                    value={newPerson.relationship_type}
                    onChange={(e) => setNewPerson({...newPerson, relationship_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select type</option>
                    <option value="client">Client</option>
                    <option value="friend">Friend</option>
                    <option value="family">Family</option>
                    <option value="colleague">Colleague</option>
                    <option value="mentor">Mentor</option>
                    <option value="partner">Partner</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={newPerson.notes}
                    onChange={(e) => setNewPerson({...newPerson, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowNewPerson(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={createPerson}
                  disabled={!newPerson.name.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Person
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search people by name, email, or relationship..."
            />
            <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">Total People</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{people.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">Clients</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {people.filter(p => p.relationship_type === 'client').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">Recent</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {people.filter(p => {
                const date = new Date(p.created_at);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return date > weekAgo;
              }).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">With Email</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {people.filter(p => p.email).length}
            </p>
          </div>
        </div>

        {/* People List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredPeople.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p className="text-lg">No people found</p>
              <p className="text-sm mt-2">Add your first contact to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPeople.map((person) => (
                <div key={person.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{person.name}</h3>
                        {person.relationship_type && (
                          <span className={`px-2 py-1 text-xs rounded-full ${relationshipColors[person.relationship_type] || 'bg-gray-100 text-gray-800'}`}>
                            {person.relationship_type}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        {person.email && (
                          <div className="flex items-center gap-1">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>{person.email}</span>
                          </div>
                        )}
                        {person.phone && (
                          <div className="flex items-center gap-1">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>{person.phone}</span>
                          </div>
                        )}
                      </div>
                      
                      {person.notes && (
                        <p className="text-sm text-gray-600 mb-2">{person.notes}</p>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Added {formatDate(person.created_at)}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800">
                        Edit
                      </button>
                      <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
