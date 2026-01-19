import { NextResponse } from 'next/server';

const mockTasks = [
  { id: '1', title: 'Build auth system', status: 'completed', assignedAgent: 'Claude Code', createdAt: new Date() },
  { id: '2', title: 'Create dashboard layout', status: 'in_progress', assignedAgent: 'Claude Code', createdAt: new Date() },
  { id: '3', title: 'Implement agent monitoring', status: 'pending', createdAt: new Date() },
  { id: '4', title: 'Set up deployment pipeline', status: 'pending', createdAt: new Date() },
];

export async function GET() {
  return NextResponse.json(mockTasks);
}
