import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Faith's current care schedule (from vet visit Jan 28, 2026)
const faithCareItems = [
  {
    id: 'mometamax',
    pet: 'Faith',
    task: 'Mometamax Ear Drops',
    emoji: '💧',
    frequency: 'Daily at 8 PM',
    instructions: '8 drops in LEFT ear only. Massage 15-20 sec.',
    startDate: '2026-01-28',
    endDate: '2026-02-11',
    status: 'active',
    priority: 'high'
  },
  {
    id: 'ear-flush',
    pet: 'Faith',
    task: 'Ear Flush (Malacetic)',
    emoji: '🧴',
    frequency: 'Tue & Fri at 10 AM',
    instructions: 'Fill ear, massage 30 sec, wipe debris.',
    startDate: '2026-01-31',
    endDate: '2026-02-11',
    status: 'upcoming',
    priority: 'high'
  },
  {
    id: 'recheck',
    pet: 'Faith',
    task: 'Ear Recheck @ Banfield',
    emoji: '🏥',
    frequency: 'One-time',
    instructions: 'Dr. Brian Bovenzi - ear swab to confirm healed. Call (858) 274-4794 to schedule.',
    startDate: '2026-02-11',
    endDate: '2026-02-11',
    status: 'scheduled',
    priority: 'high'
  },
  {
    id: 'tick-flea',
    pet: 'Faith',
    task: 'Tick/Flea Medicine',
    emoji: '💊',
    frequency: 'Monthly on 28th',
    instructions: 'Apply to back of neck between shoulder blades. Part fur, squeeze tube.',
    startDate: '2026-02-28',
    endDate: null,
    status: 'upcoming',
    priority: 'medium'
  },
  {
    id: 'vaccines',
    pet: 'Faith',
    task: 'Lepto & Bordetella Vaccines',
    emoji: '💉',
    frequency: 'Annual',
    instructions: 'Due June 16, 2026. Schedule at Banfield.',
    startDate: '2026-06-16',
    endDate: '2026-06-16',
    status: 'scheduled',
    priority: 'low'
  }
];

export async function GET() {
  // Calculate days until each task
  const now = new Date();
  const itemsWithDays = faithCareItems.map(item => {
    const startDate = new Date(item.startDate);
    const daysUntil = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return {
      ...item,
      daysUntil: daysUntil <= 0 ? 0 : daysUntil,
      isToday: daysUntil <= 0 && item.status === 'active',
      isOverdue: daysUntil < 0 && item.status !== 'active'
    };
  });

  return NextResponse.json({
    pet: {
      name: 'Faith',
      emoji: '🐕',
      breed: 'Dog',
      vet: 'Banfield Pet Hospital',
      vetPhone: '(858) 274-4794',
      vetDoctor: 'Dr. Brian Bovenzi'
    },
    careItems: itemsWithDays,
    lastUpdated: new Date().toISOString()
  });
}
