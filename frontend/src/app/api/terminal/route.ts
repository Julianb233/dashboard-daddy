import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'Terminal API ready',
    endpoints: {
      sessions: '/api/terminal/sessions',
      websocket: '/api/terminal/ws'
    }
  });
}
