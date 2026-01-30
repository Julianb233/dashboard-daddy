import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // In a real application, you would gather actual system metrics
    // For now, we'll simulate realistic data with some variation
    
    const baseMetrics = {
      uptime: getSystemUptime(),
      cpuUsage: getRandomMetric(15, 35, 23), // Base around 23%
      memoryUsage: getRandomMetric(60, 75, 67), // Base around 67%
      diskUsage: getRandomMetric(40, 50, 45), // Base around 45%
      networkLatency: getRandomMetric(8, 18, 12), // Base around 12ms
      databaseStatus: Math.random() > 0.9 ? 'warning' : 'healthy', // 90% healthy
      apiResponseTime: getRandomMetric(100, 200, 156), // Base around 156ms
      activeConnections: getRandomMetric(800, 900, 847), // Base around 847
    };
    
    return NextResponse.json(baseMetrics);
  } catch (error) {
    console.error('Error fetching system metrics:', error)
    return NextResponse.json({ error: 'Failed to fetch system metrics' }, { status: 500 })
  }
}

function getSystemUptime(): string {
  // Simulate system uptime (in real app, this would be actual uptime)
  const uptimeMs = Date.now() - (Date.now() % (1000 * 60 * 60 * 24 * 7)) + (Math.random() * 1000 * 60 * 60 * 24 * 7);
  const uptimeDays = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
  const uptimeHours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const uptimeMinutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m`;
}

function getRandomMetric(min: number, max: number, base: number): number {
  // Generate values around the base with some realistic variation
  const variation = (max - min) * 0.1; // 10% variation
  const randomValue = base + (Math.random() - 0.5) * variation * 2;
  return Math.max(min, Math.min(max, Math.round(randomValue)));
}