import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params

  // Return single agent details
  // In production: query Docker for container status
  return NextResponse.json({
    success: true,
    agent: { id, status: 'running' }
  });
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params
  const { action } = await request.json();

  // In production: execute Docker command
  // docker start/stop/restart <container>

  console.log(`Agent ${id}: ${action}`);

  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return NextResponse.json({
    success: true,
    message: `Agent ${id} ${action} successful`,
  });
}
