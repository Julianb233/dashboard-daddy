import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface AdAgency {
  id: string;
  name: string;
  type: 'ad_agency' | 'talent_agency' | 'production_company' | 'casting_agency';
  headquarters: string;
  website?: string;
  linkedin?: string;
  tier: 1 | 2 | 3;
  luxury_clients: string[];
  fashion_clients: string[];
  automotive_clients: string[];
  lifestyle_clients: string[];
  annual_billings?: string;
  notable_campaigns?: string[];
  submission_email?: string;
  submission_process?: string;
  notes?: string;
  status: 'research' | 'contacted' | 'relationship' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface AgencyContact {
  id: string;
  agency_id: string;
  name: string;
  title: string;
  department?: string;
  email?: string;
  linkedin?: string;
  phone?: string;
  is_decision_maker: boolean;
  notes?: string;
  last_contacted?: string;
  status: 'research' | 'contacted' | 'responded' | 'meeting' | 'relationship';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = (page - 1) * limit;
    
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const tier = searchParams.get('tier');
    
    let query = supabase
      .from('ad_agencies')
      .select('*', { count: 'exact' })
      .order('tier', { ascending: true });
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,headquarters.ilike.%${search}%`);
    }
    
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }
    
    if (tier && tier !== 'all') {
      query = query.eq('tier', parseInt(tier));
    }
    
    query = query.range(offset, offset + limit - 1);
    
    const { data: agencies, error, count } = await query;
    
    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({
          agencies: [],
          total: 0,
          page,
          limit,
          tableExists: false
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({
      agencies: agencies || [],
      total: count || 0,
      page,
      limit,
      tableExists: true
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch agencies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.name) {
      return NextResponse.json(
        { error: 'Agency name is required' },
        { status: 400 }
      );
    }
    
    const newAgency = {
      name: body.name,
      type: body.type || 'ad_agency',
      headquarters: body.headquarters || null,
      website: body.website || null,
      linkedin: body.linkedin || null,
      tier: body.tier || 2,
      luxury_clients: body.luxury_clients || [],
      fashion_clients: body.fashion_clients || [],
      automotive_clients: body.automotive_clients || [],
      lifestyle_clients: body.lifestyle_clients || [],
      annual_billings: body.annual_billings || null,
      notable_campaigns: body.notable_campaigns || [],
      submission_email: body.submission_email || null,
      submission_process: body.submission_process || null,
      notes: body.notes || null,
      status: body.status || 'research',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: agency, error } = await supabase
      .from('ad_agencies')
      .insert(newAgency)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating agency:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(agency);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to create agency' }, { status: 500 });
  }
}
