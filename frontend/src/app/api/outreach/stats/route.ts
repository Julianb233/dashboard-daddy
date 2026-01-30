import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { data: leads, error } = await supabase
      .from('marketing_leads')
      .select('*');
    
    if (error) {
      // Return mock stats if table doesn't exist
      if (error.code === '42P01') {
        return NextResponse.json({
          totalLeads: 0,
          totalPotentialRevenue: 0,
          confirmedRevenue: 0,
          conversionRate: 0,
          statusBreakdown: {},
          pricePointBreakdown: {},
          weeklyProgress: [],
          topBrands: [],
          pipelineValue: { discovered: 0, followed: 0, dmed: 0, replied: 0, negotiating: 0, booked: 0 }
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    const allLeads = leads || [];
    
    // Calculate stats
    const totalLeads = allLeads.length;
    const totalPotentialRevenue = allLeads.reduce((sum, l) => sum + (l.potential_revenue || 0), 0);
    const bookedLeads = allLeads.filter(l => l.status === 'booked' || l.status === 'completed');
    const confirmedRevenue = bookedLeads.reduce((sum, l) => sum + (l.potential_revenue || 0), 0);
    const conversionRate = totalLeads > 0 ? (bookedLeads.length / totalLeads) * 100 : 0;
    
    // Status breakdown
    const statusBreakdown: Record<string, number> = {};
    allLeads.forEach(l => {
      statusBreakdown[l.status] = (statusBreakdown[l.status] || 0) + 1;
    });
    
    // Price point breakdown
    const pricePointBreakdown: Record<string, number> = {};
    allLeads.forEach(l => {
      pricePointBreakdown[l.price_point] = (pricePointBreakdown[l.price_point] || 0) + 1;
    });
    
    // Pipeline value by status
    const pipelineValue: Record<string, number> = {
      discovered: 0, followed: 0, dmed: 0, replied: 0, negotiating: 0, booked: 0
    };
    allLeads.forEach(l => {
      if (pipelineValue[l.status] !== undefined) {
        pipelineValue[l.status] += (l.potential_revenue || 0);
      }
    });
    
    // Top brands by potential revenue
    const topBrands = allLeads
      .sort((a, b) => (b.potential_revenue || 0) - (a.potential_revenue || 0))
      .slice(0, 10)
      .map(l => ({
        name: l.brand_name,
        instagram: l.instagram_handle,
        revenue: l.potential_revenue,
        status: l.status
      }));
    
    // Weekly progress (mock for now - would need date tracking)
    const weeklyProgress = [
      { week: 'Week 1', discovered: 5, contacted: 3, booked: 0 },
      { week: 'Week 2', discovered: 8, contacted: 5, booked: 1 },
      { week: 'Week 3', discovered: 12, contacted: 8, booked: 2 },
      { week: 'Week 4', discovered: 15, contacted: 10, booked: 3 }
    ];
    
    return NextResponse.json({
      totalLeads,
      totalPotentialRevenue,
      confirmedRevenue,
      conversionRate,
      statusBreakdown,
      pricePointBreakdown,
      pipelineValue,
      topBrands,
      weeklyProgress
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
