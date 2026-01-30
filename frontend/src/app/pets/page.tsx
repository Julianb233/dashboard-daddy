'use client';

import { useState, useEffect } from 'react';

interface CareItem {
  id: string;
  pet: string;
  task: string;
  emoji: string;
  frequency: string;
  instructions: string;
  startDate: string;
  endDate: string | null;
  status: string;
  priority: string;
  daysUntil: number;
  isToday: boolean;
  isOverdue: boolean;
}

interface PetData {
  pet: {
    name: string;
    emoji: string;
    breed: string;
    vet: string;
    vetPhone: string;
    vetDoctor: string;
  };
  careItems: CareItem[];
  lastUpdated: string;
}

export default function PetCarePage() {
  const [data, setData] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pet-care')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf8e8] p-4 sm:p-6">
        <div className="animate-pulse">Loading pet care data...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#fdf8e8] p-4 sm:p-6">
        <div className="text-red-600">Failed to load pet care data</div>
      </div>
    );
  }

  const { pet, careItems } = data;

  const activeItems = careItems.filter(i => i.status === 'active' || i.isToday);
  const upcomingItems = careItems.filter(i => i.status === 'upcoming' || i.status === 'scheduled');

  return (
    <div className="min-h-screen bg-[#fdf8e8] p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0a4d3c]">
          {pet.emoji} {pet.name}&apos;s Care
        </h1>
        <p className="text-[#0a4d3c]/70 mt-1">
          Vet: {pet.vetDoctor} at {pet.vet}
        </p>
        <p className="text-[#0a4d3c]/60 text-sm">
          📞 {pet.vetPhone}
        </p>
      </div>

      {/* Today's Tasks */}
      {activeItems.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[#0a4d3c] mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            Do Today
          </h2>
          <div className="space-y-3">
            {activeItems.map(item => (
              <div 
                key={item.id}
                className="bg-white border-2 border-[#d4a84b] rounded-xl p-4 shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{item.emoji}</span>
                      <h3 className="font-bold text-[#0a4d3c]">{item.task}</h3>
                    </div>
                    <p className="text-sm text-[#0a4d3c]/70 mb-2">{item.frequency}</p>
                    <p className="text-sm text-[#0a4d3c] bg-[#fdf8e8] p-2 rounded-lg">
                      📋 {item.instructions}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.priority === 'high' 
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.priority}
                  </span>
                </div>
                {item.endDate && (
                  <p className="text-xs text-[#0a4d3c]/50 mt-2">
                    Until: {new Date(item.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Tasks */}
      <div>
        <h2 className="text-lg font-semibold text-[#0a4d3c] mb-3">
          📅 Upcoming
        </h2>
        <div className="space-y-3">
          {upcomingItems.map(item => (
            <div 
              key={item.id}
              className="bg-white border border-[#0a4d3c]/20 rounded-xl p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{item.emoji}</span>
                    <h3 className="font-medium text-[#0a4d3c]">{item.task}</h3>
                  </div>
                  <p className="text-sm text-[#0a4d3c]/60">{item.frequency}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-[#d4a84b]">
                    {item.daysUntil === 0 ? 'Today' : 
                     item.daysUntil === 1 ? 'Tomorrow' :
                     `In ${item.daysUntil} days`}
                  </span>
                  <p className="text-xs text-[#0a4d3c]/50">
                    {new Date(item.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#0a4d3c]/70 mt-2">
                {item.instructions}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <a 
          href={`tel:${pet.vetPhone.replace(/[^\d]/g, '')}`}
          className="flex-1 bg-[#0a4d3c] text-white py-3 px-4 rounded-xl text-center font-medium hover:bg-[#0a4d3c]/90 transition"
        >
          📞 Call Vet
        </a>
        <button 
          className="flex-1 bg-[#d4a84b] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#d4a84b]/90 transition"
          onClick={() => alert('Mark as done feature coming soon!')}
        >
          ✅ Mark Done
        </button>
      </div>
    </div>
  );
}
