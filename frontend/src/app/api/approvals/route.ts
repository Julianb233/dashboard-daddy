import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Demo approvals for when table doesn't exist
const demoApprovals = [
  {
    id: '1',
    title: 'Contact Organization Plan',
    description: 'Clean up 7,145 Google Contacts - remove duplicates, add relationship fields',
    agent: 'Bubba',
    status: 'pending',
    priority: 'high',
    created_at: new Date().toISOString()
  },
  {
    id: '2', 
    title: 'Start Modeling Outreach',
    description: 'Begin reaching out to 50 brands per category with personalized pitches',
    agent: 'Bubba',
    status: 'pending',
    priority: 'high',
    created_at: new Date().toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: approvals, error } = await supabase
      .from('approval_queue')
      .select('*')
      .order('created_at', { ascending: false });

    // If table doesn't exist or error, return demo data
    if (error) {
      console.log('Approval queue not available, using demo data');
      return NextResponse.json({
        approvals: demoApprovals,
        total: demoApprovals.length,
        pending: demoApprovals.filter(a => a.status === 'pending').length,
        approved: demoApprovals.filter(a => a.status === 'approved').length,
        timestamp: new Date().toISOString(),
        demo: true
      });
    }

    return NextResponse.json({
      approvals: approvals || [],
      total: approvals?.length || 0,
      pending: approvals?.filter((a: any) => a.status === 'pending').length || 0,
      approved: approvals?.filter((a: any) => a.status === 'approved').length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching approvals:', error);
    // Return demo data on any error
    return NextResponse.json({
      approvals: demoApprovals,
      total: demoApprovals.length,
      pending: demoApprovals.filter(a => a.status === 'pending').length,
      approved: 0,
      timestamp: new Date().toISOString(),
      demo: true
    });
  }
}